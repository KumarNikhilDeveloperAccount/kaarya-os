from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    candidate_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    
    # Store chat history as JSON: [{"role": "assistant", "content": "..."}, {"role": "user", "content": "..."}]
    chat_history = Column(JSON, default=[])
    
    # Forensic evaluation results
    forensic_report = Column(JSON, nullable=True) # Final evaluation from Rit.ai
    status = Column(String, default="scheduled") # scheduled, in_progress, completed, failed
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    application = relationship("Application", backref="interview")
    candidate = relationship("User", backref="interviews_as_candidate")
    job = relationship("Job", backref="interviews")
