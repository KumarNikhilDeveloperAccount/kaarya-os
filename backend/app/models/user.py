from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    phone_number = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    
    # LinkedIn Integration
    linkedin_id = Column(String, unique=True, index=True, nullable=True)
    
    # OTP Support (Simplified)
    otp_code = Column(String, nullable=True)
    otp_expiry = Column(DateTime(timezone=True), nullable=True)
    
    # Profile & Metadata
    bio = Column(String, nullable=True)
    profile_picture = Column(String, nullable=True) # URL to storage
    skills = Column(String, default="") # Comma separated
    resume_data = Column(JSON, nullable=True)
    
    # Identity & Roles
    primary_role = Column(String, nullable=False, default="candidate") # "candidate", "company", "college", "trainer"
    
    # Verification & Trust
    is_email_verified = Column(Boolean, default=False)
    is_identity_verified = Column(Boolean, default=False)
    
    # Settings & Preferences
    preferences = Column(JSON, default={})
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
