"""AI recommendations — GPT-5.2 via emergentintegrations (Premium)."""
import os
import uuid
from fastapi import APIRouter, Request, HTTPException
from datetime import datetime, timezone, timedelta

from models import AiMessageIn
from auth import get_current_user

from emergentintegrations.llm.chat import LlmChat, UserMessage

router = APIRouter(prefix="/ai", tags=["ai"])

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")


def _system_prompt(context: str, lang: str) -> str:
    if lang == "en":
        return (
            "You are PlusCoach, a friendly and pragmatic personal finance coach inside "
            "the PlusEconomy app. You give short, actionable, warm advice (max 180 words). "
            "Always prefer bullet points when giving recommendations. "
            "Base every answer on the user's real data below.\n\n"
            f"USER DATA:\n{context}"
        )
    return (
        "Você é o PlusCoach, um coach financeiro amigável e pragmático dentro do app "
        "PlusEconomy. Dê conselhos curtos, acionáveis e acolhedores (máx. 180 palavras). "
        "Prefira sempre listas (bullets) ao dar recomendações. "
        "Baseie TODA resposta nos dados reais do usuário abaixo.\n\n"
        f"DADOS DO USUÁRIO:\n{context}"
    )


async def _build_context(db, uid: str) -> str:
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()
    # month totals
    agg = await db.transactions.aggregate([
        {"$match": {"user_id": uid, "date": {"$gte": month_start}}},
        {"$group": {"_id": "$type", "total": {"$sum": "$amount"}}},
    ]).to_list(10)
    income = next((a["total"] for a in agg if a["_id"] == "income"), 0)
    expense = next((a["total"] for a in agg if a["_id"] == "expense"), 0)
    # top cats
    cats = await db.transactions.aggregate([
        {"$match": {"user_id": uid, "type": "expense", "date": {"$gte": month_start}}},
        {"$group": {"_id": "$category", "total": {"$sum": "$amount"}}},
        {"$sort": {"total": -1}}, {"$limit": 5},
    ]).to_list(5)
    cat_str = ", ".join([f"{c['_id']}: R$ {c['total']:.2f}" for c in cats]) or "sem despesas"
    # goals
    goals = await db.goals.find({"user_id": uid}, {"_id": 0}).to_list(10)
    goals_str = "; ".join([f"{g['title']} ({g['current_amount']:.0f}/{g['target_amount']:.0f})" for g in goals]) or "nenhuma"
    # 3 months expense trend
    three_start = (now.replace(day=1) - timedelta(days=90)).replace(day=1).isoformat()
    trend = await db.transactions.aggregate([
        {"$match": {"user_id": uid, "type": "expense", "date": {"$gte": three_start}}},
        {"$addFields": {"m": {"$substr": ["$date", 0, 7]}}},
        {"$group": {"_id": "$m", "t": {"$sum": "$amount"}}},
        {"$sort": {"_id": 1}},
    ]).to_list(10)
    trend_str = ", ".join([f"{t['_id']}={t['t']:.0f}" for t in trend]) or "sem histórico"

    return (
        f"Receitas no mês: R$ {income:.2f}\n"
        f"Despesas no mês: R$ {expense:.2f}\n"
        f"Saldo do mês: R$ {income-expense:.2f}\n"
        f"Top categorias (mês): {cat_str}\n"
        f"Tendência últimos 3 meses: {trend_str}\n"
        f"Metas ativas: {goals_str}\n"
    )


@router.post("/chat")
async def chat(data: AiMessageIn, request: Request):
    db = request.app.state.db
    user = await get_current_user(request, db)
    if not user.get("is_premium"):
        raise HTTPException(status_code=402, detail="Premium required")
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="LLM key not configured")

    # detect lang from Accept-Language or default to pt
    lang = "pt"
    al = request.headers.get("x-lang") or request.headers.get("X-Lang")
    if al and al.lower().startswith("en"):
        lang = "en"

    session_id = data.session_id or f"sess_{uuid.uuid4().hex[:12]}"
    context = await _build_context(db, user["user_id"])
    system = _system_prompt(context, lang)

    chat_client = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"{user['user_id']}:{session_id}",
        system_message=system,
    ).with_model("openai", "gpt-5.2")

    reply = await chat_client.send_message(UserMessage(text=data.message))

    # persist
    await db.ai_conversations.update_one(
        {"user_id": user["user_id"], "session_id": session_id},
        {
            "$push": {
                "messages": {
                    "$each": [
                        {"role": "user", "content": data.message, "ts": datetime.now(timezone.utc).isoformat()},
                        {"role": "assistant", "content": reply, "ts": datetime.now(timezone.utc).isoformat()},
                    ]
                }
            },
            "$setOnInsert": {"created_at": datetime.now(timezone.utc).isoformat()},
        },
        upsert=True,
    )

    return {"session_id": session_id, "reply": reply}


@router.get("/insights")
async def insights(request: Request):
    """Quick heuristic insights (free), plus call-to-upgrade for deeper AI."""
    db = request.app.state.db
    user = await get_current_user(request, db)
    uid = user["user_id"]
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()
    last_month_start = (now.replace(day=1) - timedelta(days=1)).replace(day=1).isoformat()
    last_month_end = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()

    # top category this month
    cur = await db.transactions.aggregate([
        {"$match": {"user_id": uid, "type": "expense", "date": {"$gte": month_start}}},
        {"$group": {"_id": "$category", "total": {"$sum": "$amount"}}},
        {"$sort": {"total": -1}}, {"$limit": 1},
    ]).to_list(1)
    prev = await db.transactions.aggregate([
        {"$match": {"user_id": uid, "type": "expense", "date": {"$gte": last_month_start, "$lt": last_month_end}}},
        {"$group": {"_id": "$category", "total": {"$sum": "$amount"}}},
        {"$sort": {"total": -1}}, {"$limit": 1},
    ]).to_list(1)

    tips = []
    if cur:
        tips.append({
            "title": "Maior categoria do mês",
            "body": f"{cur[0]['_id']} está em R$ {cur[0]['total']:.2f}. Considere definir um limite.",
            "icon": "trending-up",
        })
    if prev and cur and prev[0]["_id"] == cur[0]["_id"]:
        diff = cur[0]["total"] - prev[0]["total"]
        sign = "aumentou" if diff > 0 else "diminuiu"
        tips.append({
            "title": "Comparado ao mês anterior",
            "body": f"Você {sign} R$ {abs(diff):.2f} em {cur[0]['_id']}.",
            "icon": "activity",
        })
    if not tips:
        tips.append({
            "title": "Registre suas transações",
            "body": "Adicione algumas despesas para receber insights personalizados.",
            "icon": "sparkles",
        })
    return {"tips": tips, "premium": user.get("is_premium", False)}
