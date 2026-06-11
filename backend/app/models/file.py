from sqlalchemy import Column, Integer, String, LargeBinary
from app.database import Base

class PersistentFile(Base):
    __tablename__ = "persistent_files"

    id = Column(String, primary_key=True, index=True) # Will use UUID hex string
    filename = Column(String, index=True)
    content_type = Column(String)
    file_data = Column(LargeBinary)
