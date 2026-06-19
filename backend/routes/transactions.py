"""Transaction CRUD."""
from fastapi import APIRouter, Request, HTTPException, Query
from datetime import datetime, timezone
from typing import Optional, List

from models import TransactionIn, Transaction
from auth import get_current_user

router = APIRouter(prefix="/transactions", tags=["transactions"])


def _serialize(doc: dict) -> dict:
    for f in ("date", "created_at"):
        v = doc.get(f)
        if isinstance(v, str):
            try:
                doc[f] = datetime.fromisoformat(v)
            except Exception:
                pass
    return doc


@router.get("", response_model=List[Transaction])
async def list_transactions(
    request: Request,
    type: Optional[str] = None,
    category: Optional[str] = None,
    card_id: Optional[str] = None,
    limit: int = Query(200, le=1000),
):
    db = request.app.state.db
    user = await get_current_user(request, db)
    q = {"user_id": user["user_id"]}
    if type:
        q["type"] = type
    if category:
        q["category"] = category
    if card_id:
        q["card_id"] = card_id
    docs = await db.transactions.find(q, {"_id": 0}).sort("date", -1).to_list(limit)
    return [Transaction(**_serialize(d)) for d in docs]


@router.post("", response_model=Transaction)
async def create_transaction(data: TransactionIn, request: Request):
    db = request.app.state.db
    user = await get_current_user(request, db)
    t = Transaction(
        user_id=user["user_id"],
        type=data.type,
        amount=data.amount,
        category=data.category,
        description=data.description or "",
        card_id=data.card_id,
        date=data.date or datetime.now(timezone.utc),
    )
    doc = t.model_dump()
    doc["date"] = doc["date"].isoformat()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.transactions.insert_one(doc)
    return t


@router.delete("/{tid}")
async def delete_transaction(tid: str, request: Request):
    db = request.app.state.db
    user = await get_current_user(request, db)
    res = await db.transactions.delete_one({"id": tid, "user_id": user["user_id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}


@router.put("/{tid}", response_model=Transaction)
async def update_transaction(tid: str, data: TransactionIn, request: Request):
    db = request.app.state.db
    user = await get_current_user(request, db)
    update = {
        "type": data.type,
        "amount": data.amount,
        "category": data.category,
        "description": data.description or "",
        "card_id": data.card_id,
    }
    if data.date:
        update["date"] = data.date.isoformat()
    res = await db.transactions.find_one_and_update(
        {"id": tid, "user_id": user["user_id"]},
        {"$set": update},
        projection={"_id": 0},
        return_document=True,
    )
    if not res:
        raise HTTPException(status_code=404, detail="Not found")
    return Transaction(**_serialize(res))
