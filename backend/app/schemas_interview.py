from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class InterviewBase(BaseModel):
    application_id: int
    candidate_id: int
    job_id: int

class InterviewCreate(InterviewBase):
    pass

class InterviewOut(InterviewBase):
    id: int
    chat_history: List[Dict[str, Any]]
    forensic_report: Optional[Dict[str, Any]] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class InterviewResponse(BaseModel):
    user_input: str
