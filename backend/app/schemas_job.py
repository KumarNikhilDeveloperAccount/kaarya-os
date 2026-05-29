from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class JobBase(BaseModel):
    title: str
    description: str
    location: Optional[str] = None
    salary_range: Optional[str] = None

class JobCreate(JobBase):
    pass

class JobOut(JobBase):
    id: int
    company_id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ApplicationBase(BaseModel):
    job_id: int

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationOut(ApplicationBase):
    id: int
    candidate_id: int
    resume_path: str
    ai_score: Optional[float] = None
    ai_feedback: Optional[Dict[str, Any]] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class StatusUpdate(BaseModel):
    status: str
