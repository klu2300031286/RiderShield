from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from database import get_db
from models import Payment, Claim
from schemas import PaymentProcess, PaymentOut
from auth import get_current_user
import random
import string

router = APIRouter(prefix="/api/payments", tags=["Payments"])


def generate_txn_id() -> str:
    suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
    return f"TXN_GS_{datetime.utcnow().strftime('%Y%m%d')}_{suffix}"


@router.post("/process", response_model=PaymentOut)
def process_payment(
    data: PaymentProcess,
    db: Session = Depends(get_db)
):
    claim = db.query(Claim).filter(Claim.id == data.claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    if claim.status != "approved":
        raise HTTPException(status_code=400, detail="Claim is not approved for payout")

    # Check if payment already exists
    existing = db.query(Payment).filter(Payment.claim_id == data.claim_id).first()
    if existing:
        return PaymentOut.model_validate(existing)

    payment = Payment(
        claim_id=claim.id,
        amount=float(claim.claim_amount),
        status="processed",
        method=data.method.value,
        transaction_id=generate_txn_id(),
        processed_at=datetime.utcnow()
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return PaymentOut.model_validate(payment)


@router.get("/claim/{claim_id}", response_model=PaymentOut)
def get_payment_by_claim(
    claim_id: int,
    db: Session = Depends(get_db)
):
    payment = db.query(Payment).filter(Payment.claim_id == claim_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="No payment found for this claim")
    return PaymentOut.model_validate(payment)


@router.get("/my-payments", response_model=list[PaymentOut])
def get_my_payments(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    payments = db.query(Payment).join(Claim).filter(
        Claim.user_id == current_user.id
    ).order_by(Payment.created_at.desc()).all()
    return [PaymentOut.model_validate(p) for p in payments]
