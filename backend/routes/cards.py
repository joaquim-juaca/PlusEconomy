"""Simulated card management."""
from fastapi import APIRouter, Request, HTTPException
from datetime import datetime
from typing import List

from models import CardIn, Card
from auth import get_current_user

router = APIRouter(prefix="/cards", tags=["cards"])


def _ser(d: dict) -> dict:
    v = d.get("created_at")
    if isinstance(v, str):
        d["created_at"] = datetime.fromisoformat(v)
    return d


@router.get("", response_model=List[Card])
async def list_cards(request: Request):
    db = request.app.state.db
    user = await get_current_user(request, db)
    docs = await db.cards.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(200)
    return [Card(**_ser(d)) for d in docs]


@router.post("", response_model=Card)
async def create_card(data: CardIn, request: Request):
    db = request.app.state.db
    user = await get_current_user(request, db)
    c = Card(user_id=user["user_id"], **data.model_dump())
    doc = c.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.cards.insert_one(doc)
    return c


@router.delete("/{cid}")
async def delete_card(cid: str, request: Request):
    db = request.app.state.db
    user = await get_current_user(request, db)
    res = await db.cards.delete_one({"id": cid, "user_id": user["user_id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}
