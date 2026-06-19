"""Pydantic models for PlusEconomy."""
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, List, Literal
from datetime import datetime, timezone
import uuid


def _uuid() -> str:
    return f"{uuid.uuid4().hex}"


def _now() -> datetime:
    return datetime.now(timezone.utc)


# ============ USER ============
class UserPublic(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    is_premium: bool = False
    auth_provider: Literal["email", "google"] = "email"
    created_at: datetime


class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    name: str = Field(min_length=1, max_length=120)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    token: str
    user: UserPublic


# ============ TRANSACTION ============
class TransactionIn(BaseModel):
    type: Literal["income", "expense"]
    amount: float = Field(gt=0)
    category: str = Field(min_length=1, max_length=60)
    description: Optional[str] = Field(default="", max_length=240)
    card_id: Optional[str] = None
    date: Optional[datetime] = None


class Transaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=_uuid)
    user_id: str
    type: Literal["income", "expense"]
    amount: float
    category: str
    description: str = ""
    card_id: Optional[str] = None
    date: datetime
    created_at: datetime = Field(default_factory=_now)


# ============ CARD ============
class CardIn(BaseModel):
    name: str = Field(min_length=1, max_length=60)
    last4: str = Field(min_length=2, max_length=4)
    color: str = "#285943"
    limit: Optional[float] = None


class Card(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=_uuid)
    user_id: str
    name: str
    last4: str
    color: str = "#285943"
    limit: Optional[float] = None
    created_at: datetime = Field(default_factory=_now)


# ============ LIMIT ============
class LimitIn(BaseModel):
    category: Optional[str] = None
    card_id: Optional[str] = None
    monthly_amount: float = Field(gt=0)
    label: str = Field(min_length=1, max_length=60)


class SpendLimit(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=_uuid)
    user_id: str
    label: str
    category: Optional[str] = None
    card_id: Optional[str] = None
    monthly_amount: float
    created_at: datetime = Field(default_factory=_now)


# ============ GOAL ============
class GoalIn(BaseModel):
    title: str = Field(min_length=1, max_length=80)
    target_amount: float = Field(gt=0)
    current_amount: float = 0
    deadline: Optional[datetime] = None
    icon: str = "target"


class GoalContribute(BaseModel):
    amount: float = Field(gt=0)


class Goal(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=_uuid)
    user_id: str
    title: str
    target_amount: float
    current_amount: float = 0
    deadline: Optional[datetime] = None
    icon: str = "target"
    created_at: datetime = Field(default_factory=_now)


# ============ AI ============
class AiMessageIn(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    session_id: Optional[str] = None


class AiMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str
    ts: datetime = Field(default_factory=_now)


class AiResponse(BaseModel):
    session_id: str
    reply: str


# ============ DASHBOARD ============
class DashboardSummary(BaseModel):
    balance: float
    income_month: float
    expense_month: float
    transactions_count: int
    categories: List[dict]  # [{name, total, color}]
    recent: List[Transaction]
