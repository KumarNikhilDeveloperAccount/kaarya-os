from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class NotificationCreate(BaseModel):
    title: str
    message: str
    persona_context: Optional[str] = None

class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    persona_context: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
