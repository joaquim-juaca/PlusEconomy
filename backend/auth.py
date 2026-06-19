"""Auth utilities: JWT + Emergent session hybrid."""
import os
import jwt
import bcrypt
import requests
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException, Request, status
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorDatabase

JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret")
JWT_ALG = "HS256"
JWT_EXP_DAYS = 7


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_jwt(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=JWT_EXP_DAYS),
        "iat": datetime.now(timezone.utc),
        "type": "jwt",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def decode_jwt(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except Exception:
        return None


def fetch_emergent_session(session_id: str) -> Optional[dict]:
    """Call Emergent Auth backend to exchange session_id for user data."""
    try:
        r = requests.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id},
            timeout=10,
        )
        if r.status_code == 200:
            return r.json()
    except Exception:
        return None
    return None


async def get_current_user(request: Request, db: AsyncIOMotorDatabase):
    """Validate auth: cookie session_token (Emergent) OR Authorization Bearer (JWT or Emergent token)."""
    # 1. Cookie session_token (Emergent Google)
    token = request.cookies.get("session_token")
    # 2. Authorization header
    if not token:
        auth = request.headers.get("Authorization") or request.headers.get("authorization")
        if auth and auth.lower().startswith("bearer "):
            token = auth.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Try JWT first
    payload = decode_jwt(token)
    if payload and payload.get("sub"):
        user = await db.users.find_one({"user_id": payload["sub"]}, {"_id": 0})
        if user:
            return user

    # Try Emergent session_token in DB
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if session:
        expires_at = session.get("expires_at")
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at)
        if expires_at and expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at and expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=401, detail="Session expired")
        user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
        if user:
            return user

    raise HTTPException(status_code=401, detail="Invalid token")
