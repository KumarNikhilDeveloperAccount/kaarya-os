from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float, nullable=False)
    currency = Column(String, default="INR")
    status = Column(String, default="pending") # pending, success, failed, refunded
    provider = Column(String, default="razorpay")
    provider_order_id = Column(String, index=True)
    provider_payment_id = Column(String, index=True)
    item_type = Column(String) # interview_junior, interview_mid, interview_senior, hire_standard, hire_custom, college_per_student, college_yearly, training
    item_id = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    user = relationship("User")

class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id")) # Usually for Interviewers/Trainers
    balance_total = Column(Float, default=0.0) # All time earned
    balance_pending = Column(Float, default=0.0) # Not yet paid out
    balance_paid = Column(Float, default=0.0) # Already paid out
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    user = relationship("User")

class PayoutRequest(Base):
    __tablename__ = "payout_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float, nullable=False)
    status = Column(String, default="pending") # pending, processed, rejected
    payout_id = Column(String) # Provider payout ID
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
