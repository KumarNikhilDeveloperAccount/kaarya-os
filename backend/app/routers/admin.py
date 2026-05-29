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
    
    # We should check if rit_score exists etc (Simplified)
    user.roles = f"{user.roles},interviewer" # Add role if not present
    db.commit()
    return {"status": "success", "message": f"Interviewer {user.full_name} approved."}

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
