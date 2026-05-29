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
    if settings.EMAIL_MODE.lower() == "console":
        print(f"\n[EMAIL OTP - CONSOLE MODE] To: {email} | OTP: {otp}\n")
        return

    if settings.EMAIL_MODE.lower() != "smtp":
        raise RuntimeError(f"Unsupported EMAIL_MODE: {settings.EMAIL_MODE}")

    if not all([settings.SMTP_HOST, settings.SMTP_PORT, settings.SMTP_USER, settings.SMTP_PASSWORD]):
        raise RuntimeError("SMTP is not configured (missing SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASSWORD)")
    
    msg = MIMEMultipart()
    msg["From"] = settings.SMTP_FROM or settings.SMTP_USER
    msg['To'] = email
    msg['Subject'] = "Kaarya.OS High-Security Verify"
    
    body = f"Your OTP is {otp}. Do not share this with anyone."
    msg.attach(MIMEText(body, 'plain'))
    
    try:
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=20)
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        text = msg.as_string()
        server.sendmail(msg["From"], email, text)
        server.quit()
        print(f"OTP email sent to {email}")
    except Exception as e:
        raise RuntimeError(f"Failed to send email via SMTP: {e}") from e

def generate_otp(length: int = 6) -> str:
    """ Generates a numeric OTP. """
    return ''.join(random.choices(string.digits, k=length))
