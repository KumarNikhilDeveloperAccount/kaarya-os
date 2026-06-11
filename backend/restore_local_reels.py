import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import User
from app.models.ecosystem import Reel

# Connect to local SQLite DB
SQLALCHEMY_DATABASE_URL = "sqlite:///./kaarya_os.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

def restore_reels():
    from app.database import Base
    Base.metadata.create_all(bind=engine)
    
    # 1. Get or create a mock user for the reels
    user = db.query(User).filter(User.primary_role == "candidate").first()
    if not user:
        user = User(
            email="restored_user@example.com",
            full_name="Restored User",
            hashed_password="mock",
            primary_role="candidate",
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print("Created mock user for restored reels.")

    # 2. Find MP4 files in uploads directory
    uploads_dir = "backend/uploads"
    if not os.path.exists(uploads_dir):
        uploads_dir = "uploads" # Fallback if run from backend folder
        if not os.path.exists(uploads_dir):
            print(f"Could not find {uploads_dir} directory.")
            return

    mp4_files = [f for f in os.listdir(uploads_dir) if f.endswith(".mp4")]
    
    if not mp4_files:
        print("No .mp4 files found to restore.")
        return

    # 3. Insert reels if they don't exist
    restored_count = 0
    for file_name in mp4_files:
        video_url = f"/api/uploads/{file_name}"
        
        # Check if reel already exists
        existing = db.query(Reel).filter(Reel.video_url == video_url).first()
        if not existing:
            new_reel = Reel(
                author_id=user.id,
                video_url=video_url,
                caption="Restored Reel",
                tags="restored,kaarya",
                likes_count=120,
                views_count=450
            )
            db.add(new_reel)
            restored_count += 1

    if restored_count > 0:
        db.commit()
        print(f"Successfully restored {restored_count} reels to the database!")
    else:
        print("All existing MP4 files are already in the database.")

if __name__ == "__main__":
    restore_reels()
