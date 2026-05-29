from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool
    is_admin: bool
    roles: str
    active_persona: str
    bio: Optional[str] = None
    profile_picture: Optional[str] = None
    skills: Optional[str] = None

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    profile_picture: Optional[str] = None
    skills: Optional[str] = None

class OTPRequest(BaseModel):
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None

class OTPVerify(BaseModel):
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    code: str

class PasswordReset(BaseModel):
    email: EmailStr
    code: str
    new_password: str

class LinkedInAuth(BaseModel):
    code: Optional[str] = None
    email: Optional[EmailStr] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class JobOut(BaseModel):
    id: int
    title: str
    company_id: int

    class Config:
        from_attributes = True

class ApplicationOut(BaseModel):
    id: int
    job: JobOut
    candidate: UserOut
    ai_score: Optional[float] = None
    ai_feedback: Optional[dict] = None
    status: str
    created_at: str # Simplification for now

    class Config:
        from_attributes = True

# Support Ticket Schemas
class TicketMessageCreate(BaseModel):
    content: str

class TicketMessageOut(BaseModel):
    id: int
    ticket_id: int
    sender_id: int
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class TicketCreate(BaseModel):
    subject: str
    content: str # Initial message content

class TicketOut(BaseModel):
    id: int
    user_id: int
    subject: str
    status: str
    priority: str
    created_at: datetime
    updated_at: datetime
    messages: list[TicketMessageOut] = []

    class Config:
        from_attributes = True
