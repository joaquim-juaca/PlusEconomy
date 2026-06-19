"""Investment simulator: simple/compound interest with optional monthly contributions."""
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, Field
from typing import List, Literal
import uuid
from datetime import datetime, timezone

from auth import get_current_user

router = APIRouter(prefix="/investments", tags=["investments"])


class SimulationIn(BaseModel):
    initial_amount: float = Field(ge=0)
    monthly_contribution: float = Field(default=0, ge=0)
    interest_rate: float = Field(ge=0, le=100)  # percent
    rate_period: Literal["monthly", "annual"] = "annual"
    duration: int = Field(gt=0, le=1200)
    duration_unit: Literal["months", "years"] = "years"
    interest_type: Literal["simple", "compound"] = "compound"


class SimulationRow(BaseModel):
    period: int
    invested: float
    earnings: float
    total: float


class SimulationOut(BaseModel):
    total_invested: float
    total_earnings: float
    final_amount: float
    monthly_rate: float
    months: int
    rows: List[SimulationRow]


def _compute(req: SimulationIn) -> SimulationOut:
    # Normalize months and monthly rate
    months = req.duration * 12 if req.duration_unit == "years" else req.duration
    months = int(months)
    if req.rate_period == "annual":
        # convert annual to monthly equivalent for compound: (1+r)^(1/12)-1
        if req.interest_type == "compound":
            monthly_rate = (1 + req.interest_rate / 100) ** (1 / 12) - 1
        else:
            monthly_rate = (req.interest_rate / 100) / 12
    else:
        monthly_rate = req.interest_rate / 100

    rows: List[SimulationRow] = []
    balance = req.initial_amount
    total_invested = req.initial_amount

    if req.interest_type == "compound":
        for i in range(1, months + 1):
            balance = balance * (1 + monthly_rate) + req.monthly_contribution
            if i > 1 or req.monthly_contribution > 0:
                total_invested = req.initial_amount + req.monthly_contribution * i
            earnings = balance - total_invested
            rows.append(SimulationRow(
                period=i,
                invested=round(total_invested, 2),
                earnings=round(earnings, 2),
                total=round(balance, 2),
            ))
    else:
        # Simple interest: balance = principal + principal * r * t
        # For monthly contributions in simple interest, each contribution earns interest only for remaining months.
        for i in range(1, months + 1):
            invested_now = req.initial_amount + req.monthly_contribution * i
            # interest on initial for i months
            interest_initial = req.initial_amount * monthly_rate * i
            # interest on each monthly contribution made at month k (k=1..i) for (i-k) months
            # sum = M * r * sum_{k=1..i}(i-k) = M * r * i*(i-1)/2
            interest_contrib = req.monthly_contribution * monthly_rate * (i * (i - 1) / 2)
            earnings = interest_initial + interest_contrib
            total = invested_now + earnings
            total_invested = invested_now
            rows.append(SimulationRow(
                period=i,
                invested=round(total_invested, 2),
                earnings=round(earnings, 2),
                total=round(total, 2),
            ))

    final = rows[-1] if rows else SimulationRow(period=0, invested=req.initial_amount, earnings=0, total=req.initial_amount)
    return SimulationOut(
        total_invested=final.invested,
        total_earnings=final.earnings,
        final_amount=final.total,
        monthly_rate=round(monthly_rate * 100, 4),
        months=months,
        rows=rows,
    )


@router.post("/simulate", response_model=SimulationOut)
async def simulate(data: SimulationIn, request: Request):
    db = request.app.state.db
    _ = await get_current_user(request, db)
    return _compute(data)


@router.post("/save")
async def save_simulation(data: SimulationIn, request: Request):
    db = request.app.state.db
    user = await get_current_user(request, db)
    out = _compute(data)
    sim_id = uuid.uuid4().hex
    doc = {
        "id": sim_id,
        "user_id": user["user_id"],
        "params": data.model_dump(),
        "summary": {
            "total_invested": out.total_invested,
            "total_earnings": out.total_earnings,
            "final_amount": out.final_amount,
            "months": out.months,
        },
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.investment_simulations.insert_one(doc)
    return {"id": sim_id, **out.model_dump()}


@router.get("/saved")
async def saved(request: Request):
    db = request.app.state.db
    user = await get_current_user(request, db)
    docs = await db.investment_simulations.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return docs


@router.delete("/saved/{sid}")
async def delete_saved(sid: str, request: Request):
    db = request.app.state.db
    user = await get_current_user(request, db)
    res = await db.investment_simulations.delete_one({"id": sid, "user_id": user["user_id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}
