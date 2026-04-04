from sqlalchemy import Column, Integer, String, Numeric, Boolean, Enum, Date, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    role = Column(Enum("worker", "admin"), default="worker")
    location = Column(String(100), default="Mumbai")
    phone = Column(String(15))
    platform = Column(String(50), default="Zomato")
    created_at = Column(DateTime, server_default=func.now())

    policies = relationship("Policy", back_populates="user")
    claims = relationship("Claim", back_populates="user")


class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    premium_weekly = Column(Numeric(10, 2), nullable=False)
    coverage_amount = Column(Numeric(10, 2), nullable=False)
    risk_score = Column(Numeric(5, 2), default=0.0)
    status = Column(Enum("active", "expired", "cancelled"), default="active")
    start_date = Column(Date, nullable=False)
    end_date = Column(Date)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="policies")
    claims = relationship("Claim", back_populates="policy")


class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    policy_id = Column(Integer, ForeignKey("policies.id", ondelete="CASCADE"), nullable=False)
    trigger_type = Column(Enum("heavy_rain", "extreme_heat", "pollution", "curfew", "flood", "storm"), nullable=False)
    claim_amount = Column(Numeric(10, 2), nullable=False)
    status = Column(Enum("pending", "approved", "rejected", "fraud_detected"), default="pending")
    fraud_flag = Column(Boolean, default=False)
    fraud_reason = Column(String(255))
    location = Column(String(100))
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="claims")
    policy = relationship("Policy", back_populates="claims")
    payment = relationship("Payment", back_populates="claim", uselist=False)


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    claim_id = Column(Integer, ForeignKey("claims.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    status = Column(Enum("pending", "processed", "failed"), default="pending")
    method = Column(Enum("upi", "bank_transfer", "wallet"), default="upi")
    transaction_id = Column(String(100))
    processed_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())

    claim = relationship("Claim", back_populates="payment")


class RiskData(Base):
    __tablename__ = "risk_data"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    location = Column(String(100), nullable=False)
    weather_condition = Column(String(50))
    temperature = Column(Numeric(5, 2))
    humidity = Column(Numeric(5, 2))
    aqi = Column(Integer)
    risk_level = Column(Enum("low", "medium", "high", "critical"), default="low")
    is_disruption = Column(Boolean, default=False)
    recorded_at = Column(DateTime, server_default=func.now())
