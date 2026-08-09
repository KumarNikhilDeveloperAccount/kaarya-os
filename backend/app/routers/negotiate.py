from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os
import re
from app.services.ai import negotiate_salary
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Constants for the role
TARGET_SALARY = 120000
MAX_SALARY = 145000

class ChatMessage(BaseModel):
    role: str
    parts: list[str]

class NegotiateRequest(BaseModel):
    history: list[ChatMessage]
    
class NegotiateResponse(BaseModel):
    response: str
    status: str # "negotiating", "accepted", "rejected"
    agreed_salary: int = None

@router.post("/chat", response_model=NegotiateResponse)
async def negotiate_chat(request: NegotiateRequest):
    try:
        # Convert Pydantic history to dict for AI
        history_dicts = [{"role": msg.role, "parts": msg.parts} for msg in request.history]
        
        ai_response = negotiate_salary(history_dicts, TARGET_SALARY, MAX_SALARY)
        
        status = "negotiating"
        agreed_salary = None
        
        # Parse for special tags
        if "[OFFER_ACCEPTED" in ai_response:
            status = "accepted"
            # Extract number
            match = re.search(r'\[OFFER_ACCEPTED:\s*\$?([\d,]+)\]', ai_response)
            if match:
                salary_str = match.group(1).replace(",", "")
                agreed_salary = int(salary_str)
            else:
                agreed_salary = TARGET_SALARY # Fallback
                
            # Clean the tag from the user-facing text
            ai_response = re.sub(r'\[OFFER_ACCEPTED:.*?\]', '', ai_response).strip()
            
        elif "[OFFER_REJECTED]" in ai_response:
            status = "rejected"
            ai_response = ai_response.replace("[OFFER_REJECTED]", "").strip()
            
        return NegotiateResponse(
            response=ai_response,
            status=status,
            agreed_salary=agreed_salary
        )
    except Exception as e:
        logger.error(f"Error in negotiation chat: {e}")
        raise HTTPException(status_code=500, detail="Negotiation failed")


@router.get("/offer/{salary}/{candidate_name}")
async def generate_offer_letter(salary: int, candidate_name: str):
    """Generates an official PDF Offer Letter dynamically."""
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
        from reportlab.lib import colors
        
        # Ensure directory exists
        reports_dir = os.path.join(os.getcwd(), "temp_offers")
        os.makedirs(reports_dir, exist_ok=True)
        
        file_path = os.path.join(reports_dir, f"Offer_{candidate_name.replace(' ', '_')}.pdf")
        
        c = canvas.Canvas(file_path, pagesize=letter)
        width, height = letter
        
        # Header
        c.setFillColor(colors.HexColor("#0a0a0c"))
        c.rect(0, height - 100, width, 100, fill=1)
        
        c.setFillColor(colors.white)
        c.setFont("Helvetica-Bold", 24)
        c.drawString(40, height - 60, "Kaarya.OS")
        
        c.setFont("Helvetica", 12)
        c.drawString(width - 150, height - 60, "OFFICIAL OFFER LETTER")
        
        # Content
        c.setFillColor(colors.black)
        c.setFont("Helvetica", 12)
        
        y = height - 150
        c.drawString(40, y, f"Date: {__import__('datetime').date.today().strftime('%B %d, %Y')}")
        y -= 30
        c.drawString(40, y, f"Dear {candidate_name},")
        y -= 30
        c.drawString(40, y, "We are thrilled to officially offer you the position of Senior Software Engineer")
        y -= 20
        c.drawString(40, y, "at Kaarya.OS.")
        y -= 40
        
        c.setFont("Helvetica-Bold", 14)
        c.drawString(40, y, "Compensation & Benefits")
        y -= 30
        c.setFont("Helvetica", 12)
        c.drawString(40, y, f"Base Salary: ${salary:,.2f} USD per year.")
        y -= 20
        c.drawString(40, y, "Signing Bonus: $10,000.00 USD (Paid on first check).")
        y -= 20
        c.drawString(40, y, "Equity: 0.1% RSU vesting over 4 years.")
        
        y -= 60
        c.drawString(40, y, "This offer was negotiated and generated autonomously by Rit.ai on behalf of")
        y -= 20
        c.drawString(40, y, "the Kaarya.OS executive team.")
        
        y -= 60
        c.setFont("Helvetica-Bold", 12)
        c.drawString(40, y, "_______________________")
        y -= 20
        c.drawString(40, y, "Kumar Nikhil")
        y -= 15
        c.setFont("Helvetica", 10)
        c.drawString(40, y, "Founder & CEO, Kaarya.OS")
        
        c.save()
        
        return FileResponse(
            path=file_path, 
            filename=f"Offer_{candidate_name.replace(' ', '_')}.pdf",
            media_type="application/pdf"
        )
    except Exception as e:
        logger.error(f"Failed to generate PDF: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate offer letter")
