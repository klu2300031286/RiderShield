from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import User, Policy, Claim, Payment, RiskData
from schemas import AdminStats, ClaimOut
from auth import require_admin

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/stats", response_model=AdminStats)
def get_admin_stats(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(func.count(User.id)).scalar()
    total_workers = db.query(func.count(User.id)).filter(User.role == "worker").scalar()
    total_policies = db.query(func.count(Policy.id)).scalar()
    active_policies = db.query(func.count(Policy.id)).filter(Policy.status == "active").scalar()
    total_claims = db.query(func.count(Claim.id)).scalar()
    approved_claims = db.query(func.count(Claim.id)).filter(Claim.status == "approved").scalar()
    pending_claims = db.query(func.count(Claim.id)).filter(Claim.status == "pending").scalar()
    fraud_alerts = db.query(func.count(Claim.id)).filter(Claim.fraud_flag == True).scalar()
    total_payouts = db.query(func.coalesce(func.sum(Payment.amount), 0)).filter(
        Payment.status == "processed"
    ).scalar()

    return AdminStats(
        total_users=total_users,
        total_workers=total_workers,
        total_policies=total_policies,
        active_policies=active_policies,
        total_claims=total_claims,
        approved_claims=approved_claims,
        pending_claims=pending_claims,
        fraud_alerts=fraud_alerts,
        total_payouts=float(total_payouts)
    )


@router.get("/claims", response_model=list[ClaimOut])
def get_all_claims(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    claims = db.query(Claim).order_by(Claim.created_at.desc()).all()
    return [ClaimOut.model_validate(c) for c in claims]


@router.get("/fraud-alerts", response_model=list[ClaimOut])
def get_fraud_alerts(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    frauds = db.query(Claim).filter(Claim.fraud_flag == True).order_by(Claim.created_at.desc()).all()
    return [ClaimOut.model_validate(c) for c in frauds]


@router.get("/risk-analytics")
def get_risk_analytics(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    risk_data = db.query(RiskData).order_by(RiskData.recorded_at.desc()).limit(20).all()
    analytics = []
    for r in risk_data:
        analytics.append({
            "id": r.id,
            "location": r.location,
            "weather_condition": r.weather_condition,
            "temperature": float(r.temperature) if r.temperature else 0,
            "humidity": float(r.humidity) if r.humidity else 0,
            "aqi": r.aqi,
            "risk_level": r.risk_level,
            "is_disruption": r.is_disruption,
            "recorded_at": r.recorded_at.isoformat() if r.recorded_at else None
        })
    return analytics


@router.get("/users")
def get_all_users(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    users = db.query(User).all()
    return [{
        "id": u.id,
        "name": u.name,
        "email": u.email,
        "role": u.role,
        "location": u.location,
        "platform": u.platform,
        "created_at": u.created_at.isoformat() if u.created_at else None
    } for u in users]
