"""Auth routes: JWT email/password + Emergent Google session exchange."""
from fastapi import APIRouter, HTTPException, Request, Response, Depends
from datetime import datetime, timezone, timedelta
import uuid

from models import RegisterIn, LoginIn, AuthResponse, UserPublic
from auth import (
    hash_password,
    verify_password,
    create_jwt,
    fetch_emergent_session,
    get_current_user,
)

router = APIRouter(prefix="/auth", tags=["auth"])


def _user_public(doc: dict) -> UserPublic:
    return UserPublic(
        user_id=doc["user_id"],
        email=doc["email"],
        name=doc.get("name", ""),
        picture=doc.get("picture"),
        is_premium=doc.get("is_premium", False),
        auth_provider=doc.get("auth_provider", "email"),
        created_at=doc.get("created_at", datetime.now(timezone.utc)),
    )


@router.post("/register", response_model=AuthResponse)
async def register(data: RegisterIn, request: Request):
    db = request.app.state.db
    existing = await db.users.find_one({"email": data.email.lower()}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = f"user_{uuid.uuid4().hex[:16]}"
    user_doc = {
        "user_id": user_id,
        "email": data.email.lower(),
        "name": data.name,
        "password_hash": hash_password(data.password),
        "picture": None,
        "is_premium": False,
        "auth_provider": "email",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(user_doc)
    user_doc.pop("_id", None)
    user_doc["created_at"] = datetime.now(timezone.utc)
    token = create_jwt(user_id)
    return AuthResponse(token=token, user=_user_public(user_doc))


@router.post("/login", response_model=AuthResponse)
async def login(data: LoginIn, request: Request):
    db = request.app.state.db
    user = await db.users.find_one({"email": data.email.lower()}, {"_id": 0})
    if not user or not user.get("password_hash"):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if isinstance(user.get("created_at"), str):
        user["created_at"] = datetime.fromisoformat(user["created_at"])
    token = create_jwt(user["user_id"])
    return AuthResponse(token=token, user=_user_public(user))


@router.post("/emergent-session")
async def emergent_session(request: Request, response: Response):
    """Exchange Emergent session_id (from URL hash) for a session cookie + user data."""
    body = await request.json()
    session_id = body.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    data = fetch_emergent_session(session_id)
    if not data:
        raise HTTPException(status_code=401, detail="Invalid session_id")

    db = request.app.state.db
    email = (data.get("email") or "").lower()
    if not email:
        raise HTTPException(status_code=400, detail="No email from provider")

    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        # Update name/picture if changed
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": data.get("name", existing.get("name")), "picture": data.get("picture")}},
        )
        user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    else:
        user_id = f"user_{uuid.uuid4().hex[:16]}"
        user = {
            "user_id": user_id,
            "email": email,
            "name": data.get("name", ""),
            "picture": data.get("picture"),
            "is_premium": False,
            "auth_provider": "google",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.users.insert_one(dict(user))
        user.pop("_id", None)

    session_token = data["session_token"]
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.update_one(
        {"session_token": session_token},
        {
            "$set": {
                "user_id": user_id,
                "session_token": session_token,
                "expires_at": expires_at.isoformat(),
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        },
        upsert=True,
    )

    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 3600,
    )

    if isinstance(user.get("created_at"), str):
        user["created_at"] = datetime.fromisoformat(user["created_at"])
    return {"user": _user_public(user).model_dump(), "session_token": session_token}


@router.get("/me", response_model=UserPublic)
async def me(request: Request):
    db = request.app.state.db
    user = await get_current_user(request, db)
    if isinstance(user.get("created_at"), str):
        user["created_at"] = datetime.fromisoformat(user["created_at"])
    return _user_public(user)


@router.post("/logout")
async def logout(request: Request, response: Response):
    db = request.app.state.db
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    response.delete_cookie("session_token", path="/")
    return {"ok": True}
