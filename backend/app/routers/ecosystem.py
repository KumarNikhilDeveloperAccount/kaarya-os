from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from app import database, models, deps
from app.models.ecosystem import Post, Reel, Connection, Endorsement
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

# --- Pydantic Schemas ---
class UserBasic(BaseModel):
    id: int
    full_name: Optional[str]
    email: Optional[str]
    profile_picture: Optional[str]

    class Config:
        orm_mode = True

class PostResponse(BaseModel):
    id: int
    content: str
    media_url: Optional[str]
    post_type: str
    likes_count: int
    comments_count: int
    created_at: datetime
    author: UserBasic

    class Config:
        orm_mode = True

class ReelResponse(BaseModel):
    id: int
    video_url: str
    thumbnail_url: Optional[str]
    caption: Optional[str]
    tags: Optional[str]
    likes_count: int
    views_count: int
    created_at: datetime
    author: UserBasic

    class Config:
        orm_mode = True

# --- Endpoints ---

@router.get("/feed", response_model=List[PostResponse])
def get_feed(
    skip: int = 0, 
    limit: int = 50, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(deps.get_current_user_optional)
):
    """
    Get the professional social feed. 
    In a real app, this would be tailored to the user's connections.
    """
    posts = db.query(Post).order_by(Post.created_at.desc()).offset(skip).limit(limit).all()
    
    # If the feed is empty (initial DB), generate some mock data for the ecosystem
    if not posts:
        mock_user = db.query(models.User).filter(models.User.email == "system@kaarya.os").first()
        if not mock_user:
            mock_user = models.User(
                email="system@kaarya.os", 
                full_name="Kaarya Network", 
                hashed_password="mock",
                profile_picture="/kaarya-logo-final.png"
            )
            db.add(mock_user)
            db.commit()
            db.refresh(mock_user)
            
        demo_post = Post(
            author_id=mock_user.id,
            content="Welcome to the Kaarya.OS Next-Generation Professional Network. Your career graph starts here.",
            post_type="update"
        )
        db.add(demo_post)
        db.commit()
        
        posts = db.query(Post).order_by(Post.created_at.desc()).offset(skip).limit(limit).all()

    return posts


@router.post("/feed", response_model=PostResponse)
def create_post(
    content: str = Body(..., embed=True),
    media_url: Optional[str] = Body(None, embed=True),
    post_type: str = Body("update", embed=True),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Create a new post in the feed.
    """
    new_post = Post(
        author_id=current_user.id,
        content=content,
        media_url=media_url,
        post_type=post_type
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return new_post


@router.get("/reels", response_model=List[ReelResponse])
def get_reels(
    skip: int = 0, 
    limit: int = 20, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(deps.get_current_user_optional)
):
    """
    Get the vertical video talent reels.
    """
    reels = db.query(Reel).order_by(Reel.created_at.desc()).offset(skip).limit(limit).all()
    
    # Mock data for demonstration
    if not reels:
        mock_user = db.query(models.User).filter(models.User.email == "system@kaarya.os").first()
        if mock_user:
            demo_reel = Reel(
                author_id=mock_user.id,
                video_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                caption="Breaking down the new system architecture for Kaarya.OS Phase 2.",
                tags="Engineering,Architecture"
            )
            db.add(demo_reel)
            db.commit()
            reels = db.query(Reel).order_by(Reel.created_at.desc()).offset(skip).limit(limit).all()
            
    return reels


@router.post("/reels", response_model=ReelResponse)
def create_reel(
    video_url: str = Body(..., embed=True),
    caption: Optional[str] = Body(None, embed=True),
    tags: Optional[str] = Body(None, embed=True),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Create a new talent reel.
    """
    new_reel = Reel(
        author_id=current_user.id,
        video_url=video_url,
        caption=caption,
        tags=tags
    )
    db.add(new_reel)
    db.commit()
    db.refresh(new_reel)
    return new_reel
