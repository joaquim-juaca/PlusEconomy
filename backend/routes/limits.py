"""Spending limits w/ progress computation."""
from fastapi import APIRouter, Request, HTTPException
from datetime import datetime, timezone
from typing import List

from models import LimitIn, SpendLimit
from auth import get_current_user

router = APIRouter(prefix="/limits", tags=["limits"])


def _month_start_iso() -> str:
    now = datetime.now(timezone.utc)
    return now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()


@router.get("")
async def list_limits(request: Request):
    db = request.app.state.db
    user = await get_current_user(request, db)
    docs = await db.limits.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(200)
    month_start = _month_start_iso()
    result = []
    for d in docs:
        q = {
            "user_id": user["user_id"],
            "type": "expense",
            "date": {"$gte": month_start},
        }
        if d.get("category"):
            q["category"] = d["category"]
        if d.get("card_id"):
            q["card_id"] = d["card_id"]
        pipeline = [
            {"$match": q},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}},
        ]
        agg = await db.transactions.aggregate(pipeline).to_list(1)
        spent = agg[0]["total"] if agg else 0
        percent = (spent / d["monthly_amount"]) * 100 if d["monthly_amount"] else 0
        result.append({
            "id": d["id"],
            "label": d.get("label", ""),
            "category": d.get("category"),
            "card_id": d.get("card_id"),
            "monthly_amount": d["monthly_amount"],
            "spent": round(spent, 2),
            "percent": round(percent, 1),
            "alert": percent >= 80,
        })
    return result


@router.post("", response_model=SpendLimit)
async def create_limit(data: LimitIn, request: Request):
    db = request.app.state.db
    user = await get_current_user(request, db)
    L = SpendLimit(user_id=user["user_id"], **data.model_dump())
    doc = L.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.limits.insert_one(doc)
    return L


@router.delete("/{lid}")
async def delete_limit(lid: str, request: Request):
    db = request.app.state.db
    user = await get_current_user(request, db)
    res = await db.limits.delete_one({"id": lid, "user_id": user["user_id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}
