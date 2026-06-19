"""Financial goals (gamified)."""
from fastapi import APIRouter, Request, HTTPException
from datetime import datetime
from typing import List

from models import GoalIn, Goal, GoalContribute
from auth import get_current_user

router = APIRouter(prefix="/goals", tags=["goals"])


def _ser(d: dict) -> dict:
    for f in ("created_at", "deadline"):
        v = d.get(f)
        if isinstance(v, str):
            try:
                d[f] = datetime.fromisoformat(v)
            except Exception:
                pass
    return d


@router.get("", response_model=List[Goal])
async def list_goals(request: Request):
    db = request.app.state.db
    user = await get_current_user(request, db)
    docs = await db.goals.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(200)
    return [Goal(**_ser(d)) for d in docs]


@router.post("", response_model=Goal)
async def create_goal(data: GoalIn, request: Request):
    db = request.app.state.db
    user = await get_current_user(request, db)
    g = Goal(user_id=user["user_id"], **data.model_dump())
    doc = g.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    if doc.get("deadline"):
        doc["deadline"] = doc["deadline"].isoformat()
    await db.goals.insert_one(doc)
    return g


@router.post("/{gid}/contribute", response_model=Goal)
async def contribute(gid: str, data: GoalContribute, request: Request):
    db = request.app.state.db
    user = await get_current_user(request, db)
    res = await db.goals.find_one_and_update(
        {"id": gid, "user_id": user["user_id"]},
        {"$inc": {"current_amount": data.amount}},
        projection={"_id": 0},
        return_document=True,
    )
    if not res:
        raise HTTPException(status_code=404, detail="Not found")
    return Goal(**_ser(res))


@router.delete("/{gid}")
async def delete_goal(gid: str, request: Request):
    db = request.app.state.db
    user = await get_current_user(request, db)
    res = await db.goals.delete_one({"id": gid, "user_id": user["user_id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}
