from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from database import get_db
from models import Claim, Policy, Payment, User
from schemas import ClaimTrigger, ClaimOut
from auth import get_current_user
import random

router = APIRouter(prefix="/api/claims", tags=["Claims"])

# Payout percentages per trigger type
PAYOUT_RATES = {
    "heavy_rain": 0.25,
    "extreme_heat": 0.20,
    "pollution": 0.30,
    "curfew": 0.35,
    "flood": 0.40,
    "storm": 0.35,
}


def detect_fraud(user_id: int, policy_id: int, trigger_type: str, location: str, db: Session) -> tuple[bool, str]:
    """Fraud detection system."""
    # Check 1: Duplicate claim in last 24 hours
    recent = db.query(Claim).filter(
        Claim.user_id == user_id,
        Claim.trigger_type == trigger_type,
        Claim.created_at >= datetime.utcnow() - timedelta(hours=24)
    ).first()
    if recent:
        return True, "Duplicate claim detected within 24 hours for same trigger type"

    # Check 2: Too many claims in a week
    week_claims = db.query(func.count(Claim.id)).filter(
        Claim.user_id == user_id,
        Claim.created_at >= datetime.utcnow() - timedelta(days=7)
    ).scalar()
    if week_claims >= 5:
        return True, "Excessive claims detected (5+ claims in 7 days)"

    # Check 3: Location mismatch
    user = db.query(User).filter(User.id == user_id).first()
    if user and location and user.location.lower() != location.lower():
        # Flag but don't auto-reject — might be valid if user is traveling
        if random.random() < 0.3:  # 30% chance to flag for demo
            return True, f"Location mismatch: registered in {user.location}, claim from {location}"

    return False, ""


@router.post("/trigger", response_model=ClaimOut)
def trigger_claim(
    data: ClaimTrigger,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get active policy
    policy = db.query(Policy).filter(
        Policy.user_id == current_user.id,
        Policy.status == "active"
    ).first()
    if not policy:
        raise HTTPException(status_code=400, detail="No active policy found. Please purchase a policy first.")

    # Calculate claim amount
    payout_rate = PAYOUT_RATES.get(data.trigger_type.value, 0.25)
    claim_amount = round(float(policy.coverage_amount) * payout_rate, 2)

    # Run fraud detection
    is_fraud, fraud_reason = detect_fraud(
        current_user.id, policy.id, data.trigger_type.value, data.location, db
    )

    claim = Claim(
        user_id=current_user.id,
        policy_id=policy.id,
        trigger_type=data.trigger_type.value,
        claim_amount=claim_amount,
        status="fraud_detected" if is_fraud else "approved",
        fraud_flag=is_fraud,
        fraud_reason=fraud_reason if is_fraud else None,
        location=data.location
    )
    db.add(claim)
    db.commit()
    db.refresh(claim)

    # Auto-process payment if approved
    if not is_fraud:
        txn_id = f"TXN_GS_{datetime.utcnow().strftime('%Y%m%d')}_{claim.id:03d}"
        payment = Payment(
            claim_id=claim.id,
            amount=claim_amount,
            status="processed",
            method="upi",
            transaction_id=txn_id,
            processed_at=datetime.utcnow()
        )
        db.add(payment)
        db.commit()

    return ClaimOut.model_validate(claim)


@router.get("/", response_model=list[ClaimOut])
def get_claims(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    claims = db.query(Claim).filter(
        Claim.user_id == current_user.id
    ).order_by(Claim.created_at.desc()).all()
    return [ClaimOut.model_validate(c) for c in claims]


@router.get("/{claim_id}", response_model=ClaimOut)
def get_claim(
    claim_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    claim = db.query(Claim).filter(
        Claim.id == claim_id,
        Claim.user_id == current_user.id
    ).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return ClaimOut.model_validate(claim)
