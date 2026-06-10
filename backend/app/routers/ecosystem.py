from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from app import database, models, deps
from app.models.ecosystem import Post, Reel, Connection, Endorsement, Message, Feedback, Batch
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

# --- Pydantic Schemas ---
class UserBasic(BaseModel):
    id: int
    full_name: Optional[str]
    email: Optional[str]
    profile_picture: Optional[str]
    active_persona: Optional[str]

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

class MessageResponse(BaseModel):
    id: int
    content: str
    is_read: bool
    created_at: datetime
    sender: UserBasic
    receiver: UserBasic

    class Config:
        orm_mode = True

class PostCreate(BaseModel):
    content: str
    media_url: Optional[str] = None
    post_type: str = "update"

class ReelCreate(BaseModel):
    video_url: str
    caption: Optional[str] = None
    tags: Optional[str] = None

# --- Endpoints ---

@router.get("/messages", response_model=List[MessageResponse])
def get_messages(
    skip: int = 0, 
    limit: int = 50, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """Get inbox for current user"""
    from sqlalchemy import or_
    messages = db.query(Message).filter(
        or_(Message.sender_id == current_user.id, Message.receiver_id == current_user.id)
    ).order_by(Message.created_at.desc()).offset(skip).limit(limit).all()
    return messages

@router.post("/messages", response_model=MessageResponse)
def send_message(
    receiver_id: int = Body(..., embed=True),
    content: str = Body(..., embed=True),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    new_message = Message(
        sender_id=current_user.id,
        receiver_id=receiver_id,
        content=content
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    
    # Trigger real email notification
    receiver = db.query(models.User).filter(models.User.id == receiver_id).first()
    if receiver and receiver.email:
        from app.services.email import send_notification_email
        import threading
        
        subject = f"A recruiter from {current_user.full_name} wants to connect with you on Kaarya.OS"
        email_body = f"Hello {receiver.full_name},<br><br>{current_user.full_name} reviewed your profile and is reaching out about a potential role.<br><br><b>Message Preview:</b><br>\"{content[:100]}{'...' if len(content) > 100 else ''}\""
        
        # Run email sending in a background thread to not block the API
        threading.Thread(target=send_notification_email, args=(
            receiver.email,
            subject,
            email_body,
            "Open Conversation on Kaarya.OS",
            f"http://localhost:3000/messages?thread_id={current_user.id}"
        )).start()
        
    return new_message

@router.patch("/messages/{user_id}/read")
def mark_messages_read(user_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(deps.get_current_user)):
    # Mark messages from user_id to current_user as read
    db.query(Message).filter(Message.sender_id == user_id, Message.receiver_id == current_user.id, Message.is_read == False).update({"is_read": True})
    db.commit()
    return {"status": "success"}

@router.post("/messages/trigger-reminders")
def trigger_unread_reminders(db: Session = Depends(database.get_db)):
    from app.services.email import send_notification_email
    import threading
    
    unread = db.query(Message).filter(Message.is_read == False).all()
    
    reminders_sent = 0
    grouped = {}
    for m in unread:
        if m.receiver_id not in grouped:
            grouped[m.receiver_id] = []
        grouped[m.receiver_id].append(m)
        
    for receiver_id, msgs in grouped.items():
        receiver = db.query(models.User).filter(models.User.id == receiver_id).first()
        if receiver and receiver.email:
            senders = list(set([m.sender.full_name for m in msgs]))
            senders_str = ", ".join(senders)
            subject = f"You have {len(msgs)} unread messages on Kaarya.OS"
            body = f"Hello {receiver.full_name},<br><br>You have unread messages waiting for you from {senders_str}. Please log in to reply."
            
            threading.Thread(target=send_notification_email, args=(
                receiver.email,
                subject,
                body,
                "View Messages",
                "http://localhost:3000/messages"
            )).start()
            reminders_sent += 1
            
    return {"status": "success", "reminders_sent": reminders_sent}

@router.get("/reels", response_model=List[ReelResponse])
def get_reels(
    skip: int = 0, 
    limit: int = 20, 
    db: Session = Depends(database.get_db)
):
    """Get the video reels feed"""
    reels = db.query(Reel).order_by(Reel.created_at.desc()).offset(skip).limit(limit).all()
    # If no reels exist in DB, return some dummy high-quality video links for testing the UI
    if not reels:
        return [
            {
                "id": 1,
                "video_url": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                "thumbnail_url": None,
                "caption": "Building scalable microservices with Kaarya.OS 🔥",
                "tags": "#engineering #backend",
                "likes_count": 1205,
                "views_count": 45000,
                "created_at": datetime.utcnow(),
                "author": {"id": 0, "full_name": "System Demo", "email": "", "profile_picture": None, "active_persona": "candidate"}
            },
            {
                "id": 2,
                "video_url": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
                "thumbnail_url": None,
                "caption": "Why culture fit is just as important as technical skills 🤝",
                "tags": "#hiring #culture",
                "likes_count": 890,
                "views_count": 21000,
                "created_at": datetime.utcnow(),
                "author": {"id": 0, "full_name": "HR Expert", "email": "", "profile_picture": None, "active_persona": "company"}
            }
        ]
    return reels

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
    post: PostCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(deps.get_current_user_optional)
):
    """
    Create a new post in the feed.
    """
    author_id = current_user.id if current_user else 1
    new_post = Post(
        author_id=author_id,
        content=post.content,
        media_url=post.media_url,
        post_type=post.post_type
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    
    # Since we need to return the author, refresh to load the relationship
    return new_post


@router.get("/reels")
def get_reels(
    skip: int = 0, 
    limit: int = 50, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(deps.get_current_user_optional)
):
    reels = db.query(Reel).order_by(Reel.created_at.desc()).offset(skip).limit(limit).all()
    
    if not reels:
        mock_user = db.query(models.User).filter(models.User.email == "system@kaarya.os").first()
        if mock_user:
            demo_reels = [
                Reel(author_id=mock_user.id, video_url="/reels/A_playful_cinematic_startup_ad.mp4", caption="A playful cinematic startup ad showcasing Kaarya.OS capabilities.", tags="Startup,KaaryaOS"),
                Reel(author_id=mock_user.id, video_url="/reels/Cinematic_emotional_advertisem.mp4", caption="Cinematic emotional advertisement for Kaarya.", tags="Emotional,Ad"),
                Reel(author_id=mock_user.id, video_url="/reels/Futuristic_dark_SaaS_advertise.mp4", caption="Futuristic dark SaaS advertisement.", tags="SaaS,Futuristic"),
                Reel(author_id=mock_user.id, video_url="/reels/Make_a_thirty_second_video_thi.mp4", caption="A thirty-second video about the hiring revolution.", tags="Hiring,Revolution"),
                Reel(author_id=mock_user.id, video_url="/reels/make_more_videos_not_landscap.mp4", caption="Make more videos - vertical format preferred.", tags="Vertical,Video"),
                Reel(author_id=mock_user.id, video_url="/reels/tagline_is_Hiring_Decided_.mp4", caption="Hiring, Decided. The new way to hire.", tags="Hiring,Decided"),
                Reel(author_id=mock_user.id, video_url="/reels/A_playful_cinematic_startup_ad.mp4", caption="Inside look: How we built Kaarya.OS Phase 2.", tags="Engineering,InsideLook"),
                Reel(author_id=mock_user.id, video_url="/reels/Cinematic_emotional_advertisem.mp4", caption="The future of professional networking is here.", tags="Networking,Future"),
                Reel(author_id=mock_user.id, video_url="/reels/Futuristic_dark_SaaS_advertise.mp4", caption="Deep dive into our AI capabilities.", tags="AI,DeepDive"),
                Reel(author_id=mock_user.id, video_url="/reels/Make_a_thirty_second_video_thi.mp4", caption="Why we chose Next.js for Kaarya.OS.", tags="NextJS,Frontend")
            ]
            db.add_all(demo_reels)
            db.commit()
            reels = db.query(Reel).order_by(Reel.created_at.desc()).offset(skip).limit(limit).all()
            
    result = []
    for r in reels:
        result.append({
            "id": r.id,
            "video_url": r.video_url,
            "thumbnail_url": r.thumbnail_url,
            "caption": r.caption,
            "tags": r.tags,
            "likes_count": r.likes_count,
            "views_count": r.views_count,
            "created_at": r.created_at,
            "author": r.author
        })
    return result


@router.post("/reels", response_model=ReelResponse)
def create_reel(
    reel: ReelCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Create a new talent reel.
    """
    new_reel = Reel(
        author_id=current_user.id,
        video_url=reel.video_url,
        caption=reel.caption,
        tags=reel.tags
    )
    db.add(new_reel)
    db.commit()
    db.refresh(new_reel)
    return new_reel

@router.post("/reels/{reel_id}/like")
def like_reel(reel_id: int, db: Session = Depends(database.get_db)):
    reel = db.query(Reel).filter(Reel.id == reel_id).first()
    if reel:
        reel.likes_count += 1
        db.commit()
        return {"status": "success", "likes_count": reel.likes_count}
    raise HTTPException(status_code=404, detail="Reel not found")

@router.get("/candidates")
def get_candidates(db: Session = Depends(database.get_db)):
    """
    Get users with candidate persona or skills.
    """
    users = db.query(models.User).filter(models.User.active_persona == "candidate").all()
    return [
        {
            "id": u.id,
            "fullName": u.full_name,
            "jobTitle": "Candidate",
            "location": "Remote",
            "skills": u.skills.split(",") if u.skills else ["React", "Python"],
            "bio": u.bio or "Ready for work.",
            "hireability": 95,
            "profilePic": u.profile_picture,
            "resumeUrl": u.resume_data.get("resume_url") if isinstance(u.resume_data, dict) else None
        } for u in users
    ]

@router.get("/companies")
def get_companies(db: Session = Depends(database.get_db)):
    """
    Get users with company persona.
    """
    users = db.query(models.User).filter(models.User.active_persona == "company").all()
    return [
        {
            "id": u.id,
            "companyName": u.full_name,
            "industry": "Technology",
            "location": "Remote",
            "techStack": u.skills.split(",") if u.skills else ["Python", "Cloud"],
            "bio": u.bio or "A great company to work for.",
            "companySize": "11-50",
            "logo": u.profile_picture
        } for u in users
    ]

@router.get("/feedbacks")
def get_feedbacks(db: Session = Depends(database.get_db)):
    feedbacks = db.query(Feedback).all()
    return [
        {
            "id": f.id,
            "candidate": f.candidate.full_name if f.candidate else "Unknown",
            "role": f.role,
            "score": f.score,
            "feedback": f.feedback_text,
            "rating": f.rating,
            "date": f.created_at.strftime("%Y-%m-%d")
        } for f in feedbacks
    ]

@router.get("/invoices")
def get_invoices(db: Session = Depends(database.get_db)):
    from app.models.payment import Transaction
    txs = db.query(Transaction).all()
    return [
        {
            "id": f"INV-{t.id:04d}",
            "date": t.created_at.strftime("%Y-%m-%d"),
            "amount": f"${t.amount:,.2f}",
            "status": t.status.capitalize()
        } for t in txs
    ]

@router.get("/interviews")
def get_interviews(db: Session = Depends(database.get_db)):
    from app.models.interview import Interview
    interviews = db.query(Interview).all()
    return [
        {
            "id": str(i.id),
            "candidate": i.candidate.full_name if i.candidate else "Unknown",
            "role": i.job.title if i.job else "Unknown Role",
            "date": i.created_at.strftime("%Y-%m-%d"),
            "time": i.created_at.strftime("%H:%M EST"),
            "status": i.status.capitalize()
        } for i in interviews
    ]

@router.get("/batches")
def get_batches(db: Session = Depends(database.get_db)):
    batches = db.query(Batch).all()
    return [
        {
            "id": b.id,
            "name": b.name,
            "students": b.students_count,
            "avgScore": b.avg_score,
            "placed": b.placed_count,
            "status": b.status
        } for b in batches
    ]

class BatchCreate(BaseModel):
    id: str
    name: str
    students: int = 0
    avgScore: int = 0
    placed: int = 0
    status: str = "Active"

@router.post("/batches")
def create_batch(batch: BatchCreate, db: Session = Depends(database.get_db)):
    new_batch = Batch(
        id=batch.id,
        name=batch.name,
        students_count=batch.students,
        avg_score=batch.avgScore,
        placed_count=batch.placed,
        status=batch.status
    )
    db.add(new_batch)
    db.commit()
    db.refresh(new_batch)
    return new_batch

@router.patch("/interviews/{req_id}/status")
def update_interview_status(req_id: str, payload: dict = Body(...), db: Session = Depends(database.get_db)):
    status = payload.get("status")
    if not status:
        raise HTTPException(status_code=400, detail="Status is required")
        
    try:
        req_id_int = int(req_id)
        from app.models.interview import Interview
        interview = db.query(Interview).filter(Interview.id == req_id_int).first()
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")
        interview.status = status.lower()
        db.commit()
        db.refresh(interview)
        return {"status": "success", "new_status": interview.status}
    except ValueError:
        # Fallback for mock IDs like REQ-001
        return {"status": "success", "new_status": status}
