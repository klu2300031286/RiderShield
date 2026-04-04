from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime
from enum import Enum


# --- Enums ---
class RoleEnum(str, Enum):
    worker = "worker"
    admin = "admin"

class PolicyStatus(str, Enum):
    active = "active"
    expired = "expired"
    cancelled = "cancelled"

class ClaimStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    fraud_detected = "fraud_detected"

class TriggerType(str, Enum):
    heavy_rain = "heavy_rain"
    extreme_heat = "extreme_heat"
    pollution = "pollution"
    curfew = "curfew"
    flood = "flood"
    storm = "storm"

class PaymentStatus(str, Enum):
    pending = "pending"
    processed = "processed"
    failed = "failed"

class PaymentMethod(str, Enum):
    upi = "upi"
    bank_transfer = "bank_transfer"
    wallet = "wallet"

class RiskLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


# --- Auth Schemas ---
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    location: Optional[str] = "Mumbai"
    phone: Optional[str] = None
    platform: Optional[str] = "Zomato"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    location: str
    phone: Optional[str]
    platform: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# --- Policy Schemas ---
class PolicyCreate(BaseModel):
    coverage_amount: float
    location: Optional[str] = None

class PolicyOut(BaseModel):
    id: int
    user_id: int
    premium_weekly: float
    coverage_amount: float
    risk_score: float
    status: str
    start_date: date
    end_date: Optional[date]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# --- Claim Schemas ---
class ClaimTrigger(BaseModel):
    location: str
    trigger_type: TriggerType

class ClaimOut(BaseModel):
    id: int
    user_id: int
    policy_id: int
    trigger_type: str
    claim_amount: float
    status: str
    fraud_flag: bool
    fraud_reason: Optional[str]
    location: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# --- Payment Schemas ---
class PaymentProcess(BaseModel):
    claim_id: int
    method: PaymentMethod = PaymentMethod.upi

class PaymentOut(BaseModel):
    id: int
    claim_id: int
    amount: float
    status: str
    method: str
    transaction_id: Optional[str]
    processed_at: Optional[datetime]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# --- Risk Schemas ---
class RiskAssessment(BaseModel):
    location: str
    risk_score: float
    risk_level: str
    weather_condition: str
    temperature: float
    humidity: float
    aqi: int
    suggested_premium: float
    is_disruption: bool

class DisruptionSimulate(BaseModel):
    location: str
    trigger_type: TriggerType

class WeatherOut(BaseModel):
    location: str
    weather_condition: str
    temperature: float
    humidity: float
    aqi: int
    risk_level: str
    is_disruption: bool


# --- Admin Schemas ---
class AdminStats(BaseModel):
    total_users: int
    total_workers: int
    total_policies: int
    active_policies: int
    total_claims: int
    approved_claims: int
    pending_claims: int
    fraud_alerts: int
    total_payouts: float
