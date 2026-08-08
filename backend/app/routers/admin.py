from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app import database, auth, models, schemas, deps
from app.services.ai import conduct_interview_turn # Assuming this exists or will be built

router = APIRouter()

@router.post("/approve-interviewer/{user_id}")
def approve_interviewer(
    user_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(deps.get_current_admin_user)
):
    """
    Step 2 of the verification flow: Admin manual approval.
    Only accessible AFTER Rit.ai has vetted the user.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Set identity verified flag
    user.is_identity_verified = True
    db.commit()
    return {"status": "success", "message": f"Interviewer {user.full_name} approved."}

@router.post("/verify-entity/{user_id}")
def verify_entity(
    user_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(deps.get_current_admin_user)
):
    """
    Manually verify a company or college.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_identity_verified = True
    db.commit()
    return {"status": "success", "message": f"{user.full_name} has been verified."}

@router.get("/applications", response_model=list[schemas.ApplicationOut])
def get_applications(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(deps.get_current_admin_user)
):
    """
    Fetch all applications for Admin dashboard.
    """
    apps = db.query(models.Application).all()
    # Format dates as strings for the schema (Simplification)
    for a in apps:
        a.created_at = a.created_at.isoformat()
    return apps

@router.get("/unverified-entities")
def get_unverified_entities(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(deps.get_current_admin_user)
):
    """
    Fetch all companies and colleges that are pending verification.
    """
    users = db.query(models.User).filter(
        models.User.is_identity_verified == False,
        models.User.primary_role.in_(["company", "college"])
    ).all()
    
    return [
        {
            "id": u.id,
            "name": u.full_name,
            "role": u.primary_role,
            "email": u.email,
            "resume_url": u.resume_url,
            "created_at": u.created_at.isoformat() if u.created_at else None
        } for u in users
    ]

@router.get("/monitoring/transactions")
def get_all_transactions(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(deps.get_current_admin_user)
):
    """
    Monitoring tool for Admins to track all platform revenue.
    Returns both the list and summary metrics.
    """
    transactions = db.query(models.Transaction).all()
    
    total_revenue = sum(t.amount for t in transactions if t.status == "success")
    platform_cut = total_revenue * 0.20
    
    return {
        "transactions": transactions,
        "metrics": {
            "total_revenue": total_revenue,
            "platform_cut": platform_cut,
            "count": len(transactions)
        }
    }

@router.post("/refund/{transaction_id}")
def process_manual_refund(
    transaction_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(deps.get_current_admin_user)
):
    """
    Manual refund tool as requested. Requires careful oversight.
    """
    tx = db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Call Razorpay Refund API (Simplified logic)
    tx.status = "refunded"
    db.commit()
    return {"status": "success", "message": "Manual refund processed successfully."}

@router.get("/users")
def get_all_users(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(deps.get_current_admin_user)
):
    """ Fetch all users for Admin to manage roles. """
    users = db.query(models.User).all()
    return [{"id": u.id, "email": u.email, "full_name": u.full_name, "is_admin": u.is_admin, "primary_role": u.primary_role} for u in users]

@router.put("/users/{user_id}/role")
def toggle_admin_role(
    user_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(deps.get_current_admin_user)
):
    """ Toggle admin privileges for a user. """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent removing own admin rights
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot remove your own admin rights.")
        
    user.is_admin = not user.is_admin
    db.commit()
    return {"status": "success", "is_admin": user.is_admin}
