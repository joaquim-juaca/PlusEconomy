"""Mocked premium billing."""
from fastapi import APIRouter, Request

from auth import get_current_user

router = APIRouter(prefix="/billing", tags=["billing"])


@router.post("/upgrade")
async def upgrade(request: Request):
    """MOCK: toggles is_premium = True."""
    db = request.app.state.db
    user = await get_current_user(request, db)
    await db.users.update_one({"user_id": user["user_id"]}, {"$set": {"is_premium": True}})
    return {"ok": True, "is_premium": True, "note": "MOCK upgrade"}


@router.post("/downgrade")
async def downgrade(request: Request):
    db = request.app.state.db
    user = await get_current_user(request, db)
    await db.users.update_one({"user_id": user["user_id"]}, {"$set": {"is_premium": False}})
    return {"ok": True, "is_premium": False}
