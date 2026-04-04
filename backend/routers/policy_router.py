from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date, timedelta
from database import get_db
from models import Policy, RiskData, User
from schemas import PolicyCreate, PolicyOut
from auth import get_current_user
import random

router = APIRouter(prefix="/api/policies", tags=["Policies"])


def calculate_premium(coverage_amount: float, risk_score: float) -> float:
    """AI-based premium calculation using risk factors."""
    base_rate = 0.025  # 2.5% base rate
    risk_multiplier = 1 + (risk_score / 100)
    weekly_premium = coverage_amount * base_rate * risk_multiplier
    return round(max(weekly_premium, 29.0), 2)  # Minimum ₹29/week


def compute_risk_score(location: str, db: Session) -> float:
    """Simulate ML-based risk scoring based on location data."""
    risk_entry = db.query(RiskData).filter(
        RiskData.location == location
    ).order_by(RiskData.recorded_at.desc()).first()

    if risk_entry:
        score = 0.0
        # Weather factor
        if risk_entry.weather_condition in ["Heavy Rain", "Thunderstorm", "Flood"]:
            score += 30
        elif risk_entry.weather_condition in ["Extreme Heat", "Dust Storm"]:
            score += 25
        elif risk_entry.weather_condition in ["Haze"]:
            score += 15
        # AQI factor
        if risk_entry.aqi and risk_entry.aqi > 300:
            score += 25
        elif risk_entry.aqi and risk_entry.aqi > 150:
            score += 15
        elif risk_entry.aqi and risk_entry.aqi > 100:
            score += 10
        # Temperature factor
        if risk_entry.temperature and risk_entry.temperature > 40:
            score += 20
        elif risk_entry.temperature and risk_entry.temperature > 35:
            score += 10
        # Humidity factor
        if risk_entry.humidity and risk_entry.humidity > 85:
            score += 10
        return min(score, 100.0)

    # Default score with some randomness for demo
    return round(random.uniform(20, 50), 2)


@router.post("/", response_model=PolicyOut)
def create_policy(
    data: PolicyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check for existing active policy
    existing = db.query(Policy).filter(
        Policy.user_id == current_user.id,
        Policy.status == "active"
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You already have an active policy. Cancel it first.")

    location = data.location or current_user.location
    risk_score = compute_risk_score(location, db)
    premium = calculate_premium(data.coverage_amount, risk_score)

    policy = Policy(
        user_id=current_user.id,
        premium_weekly=premium,
        coverage_amount=data.coverage_amount,
        risk_score=risk_score,
        status="active",
        start_date=date.today(),
        end_date=date.today() + timedelta(weeks=12)
    )
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return PolicyOut.model_validate(policy)


@router.get("/", response_model=list[PolicyOut])
def get_policies(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    policies = db.query(Policy).filter(Policy.user_id == current_user.id).all()
    return [PolicyOut.model_validate(p) for p in policies]


@router.get("/active", response_model=PolicyOut)
def get_active_policy(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    policy = db.query(Policy).filter(
        Policy.user_id == current_user.id,
        Policy.status == "active"
    ).first()
    if not policy:
        raise HTTPException(status_code=404, detail="No active policy found")
    return PolicyOut.model_validate(policy)


@router.delete("/{policy_id}")
def cancel_policy(
    policy_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    policy = db.query(Policy).filter(
        Policy.id == policy_id,
        Policy.user_id == current_user.id
    ).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    policy.status = "cancelled"
    db.commit()
    return {"message": "Policy cancelled successfully"}
