import smtplib
import random
import string
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings

def send_otp_email(email: str, otp: str):
    """
    Send OTP email.

    Modes:
    - EMAIL_MODE=console: log OTP to backend console (dev)
    - EMAIL_MODE=smtp: send via SMTP using SMTP_* settings
    """
    SMTP_HOST = "smtp.gmail.com"
    SMTP_PORT = 587
    SMTP_USER = "kaarya.support@gmail.com"
    SMTP_PASSWORD = "xfktjajuckvsmkvg"
    SMTP_FROM = "kaarya.support@gmail.com"
    
    msg = MIMEMultipart()
    msg["From"] = settings.SMTP_FROM or settings.SMTP_USER
    msg['To'] = email
    msg['Subject'] = "Kaarya.OS High-Security Verify"
    
    body_html = f"""
    <html>
      <body style="margin: 0; padding: 0; font-family: 'Inter', sans-serif; background-color: #030014; color: #fff;">
        <div style="max-w-md; margin: 40px auto; padding: 40px; background-color: #0b0f19; border: 1px solid #1e293b; border-radius: 20px; text-align: center;">
          
          <img src="https://kaarya-os.vercel.app/logo.svg" alt="Kaarya.OS Logo" style="height: 60px; margin-bottom: 20px;" />
          
          <h2 style="background: linear-gradient(to right, #6366f1, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 24px; font-weight: 900; margin-bottom: 10px;">Security Gateway</h2>
          
          <p style="color: #94a3b8; font-size: 14px; letter-spacing: 2px; text-transform: uppercase;">Identity Verification</p>
          
          <div style="background-color: #030014; padding: 20px; border-radius: 12px; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #fff;">{otp}</span>
          </div>
          
          <p style="color: #64748b; font-size: 12px; margin-top: 30px;">
            This access code will expire in 10 minutes. Do not share this code with anyone.
          </p>
        </div>
      </body>
    </html>
    """
    try:
        import httpx
        response = httpx.post(
            "https://kaarya-os.vercel.app/api/send-email",
            json={
                "to": email,
                "otp": otp,
                "secret": "kaarya_internal_proxy_secret_2026",
                "html": body_html
            },
            timeout=15.0
        )
        response.raise_for_status()
        print(f"OTP email sent to {email} via Vercel proxy")
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise Exception(f"Vercel Proxy Error: {str(e)}")

def generate_otp(length: int = 6) -> str:
    """ Generates a numeric OTP. """
    return ''.join(random.choices(string.digits, k=length))
