"""Dashboard summary + reports data."""
from fastapi import APIRouter, Request, Query
from datetime import datetime, timezone, timedelta
from typing import Optional

from auth import get_current_user

router = APIRouter(tags=["dashboard"])

CATEGORY_COLORS = {
    "Alimentação": "#E06D4F",
    "Transporte": "#285943",
    "Moradia": "#6E7370",
    "Lazer": "#E0A94F",
    "Saúde": "#3A7D5C",
    "Educação": "#8E6A3C",
    "Compras": "#D64C4C",
    "Assinaturas": "#556B4A",
    "Outros": "#9CA39F",
}


def _color(cat: str) -> str:
    return CATEGORY_COLORS.get(cat, "#285943")


def _month_start() -> datetime:
    return datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)


@router.get("/dashboard/summary")
async def summary(request: Request):
    db = request.app.state.db
    user = await get_current_user(request, db)
    uid = user["user_id"]
    month_start_iso = _month_start().isoformat()

    # month aggregates
    pipeline = [
        {"$match": {"user_id": uid, "date": {"$gte": month_start_iso}}},
        {"$group": {"_id": "$type", "total": {"$sum": "$amount"}}},
    ]
    agg = await db.transactions.aggregate(pipeline).to_list(10)
    income = next((a["total"] for a in agg if a["_id"] == "income"), 0)
    expense = next((a["total"] for a in agg if a["_id"] == "expense"), 0)

    # lifetime balance
    pipeline_all = [
        {"$match": {"user_id": uid}},
        {"$group": {"_id": "$type", "total": {"$sum": "$amount"}}},
    ]
    agg_all = await db.transactions.aggregate(pipeline_all).to_list(10)
    inc_all = next((a["total"] for a in agg_all if a["_id"] == "income"), 0)
    exp_all = next((a["total"] for a in agg_all if a["_id"] == "expense"), 0)
    balance = inc_all - exp_all

    # categories breakdown (month expenses)
    cat_pipeline = [
        {"$match": {"user_id": uid, "type": "expense", "date": {"$gte": month_start_iso}}},
        {"$group": {"_id": "$category", "total": {"$sum": "$amount"}}},
        {"$sort": {"total": -1}},
    ]
    cat_agg = await db.transactions.aggregate(cat_pipeline).to_list(30)
    categories = [
        {"name": c["_id"] or "Outros", "total": round(c["total"], 2), "color": _color(c["_id"] or "Outros")}
        for c in cat_agg
    ]

    # recent 8
    recent_docs = await db.transactions.find({"user_id": uid}, {"_id": 0}).sort("date", -1).to_list(8)
    # count
    count = await db.transactions.count_documents({"user_id": uid})

    return {
        "balance": round(balance, 2),
        "income_month": round(income, 2),
        "expense_month": round(expense, 2),
        "transactions_count": count,
        "categories": categories,
        "recent": recent_docs,
    }


@router.get("/reports/timeseries")
async def timeseries(request: Request, months: int = Query(6, ge=1, le=24)):
    """Monthly income/expense series for the last N months."""
    db = request.app.state.db
    user = await get_current_user(request, db)
    uid = user["user_id"]
    now = datetime.now(timezone.utc)
    start = (now.replace(day=1, hour=0, minute=0, second=0, microsecond=0) - timedelta(days=30 * (months - 1)))
    start = start.replace(day=1)
    pipeline = [
        {"$match": {"user_id": uid, "date": {"$gte": start.isoformat()}}},
        {"$addFields": {"month": {"$substr": ["$date", 0, 7]}}},
        {"$group": {"_id": {"month": "$month", "type": "$type"}, "total": {"$sum": "$amount"}}},
    ]
    agg = await db.transactions.aggregate(pipeline).to_list(500)
    by_month = {}
    for a in agg:
        m = a["_id"]["month"]
        t = a["_id"]["type"]
        by_month.setdefault(m, {"month": m, "income": 0, "expense": 0})[t] = round(a["total"], 2)

    # fill months
    result = []
    for i in range(months):
        dt = (now.replace(day=1) - timedelta(days=30 * (months - 1 - i))).replace(day=1)
        key = dt.strftime("%Y-%m")
        entry = by_month.get(key, {"month": key, "income": 0, "expense": 0})
        result.append(entry)
    # dedupe & sort
    seen = {}
    for e in result:
        seen[e["month"]] = e
    ordered = sorted(seen.values(), key=lambda x: x["month"])
    return ordered[-months:]


@router.get("/reports/by-category")
async def by_category(request: Request, period: str = "month"):
    db = request.app.state.db
    user = await get_current_user(request, db)
    uid = user["user_id"]
    now = datetime.now(timezone.utc)
    if period == "week":
        start = now - timedelta(days=7)
    elif period == "year":
        start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
    else:
        start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    pipeline = [
        {"$match": {"user_id": uid, "type": "expense", "date": {"$gte": start.isoformat()}}},
        {"$group": {"_id": "$category", "total": {"$sum": "$amount"}, "count": {"$sum": 1}}},
        {"$sort": {"total": -1}},
    ]
    agg = await db.transactions.aggregate(pipeline).to_list(50)
    return [
        {"name": a["_id"] or "Outros", "total": round(a["total"], 2), "count": a["count"], "color": _color(a["_id"] or "Outros")}
        for a in agg
    ]
