from app.services.email_service import send_email_sync, get_base_html
import random
import string

def send_otp_email(email: str, otp: str):
    content = f"""
    <div style="text-align: center;">
      <h2 style="background: linear-gradient(to right, #6366f1, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 24px; font-weight: 900; margin-bottom: 10px;">Security Gateway</h2>
      <p style="color: #94a3b8; font-size: 14px; letter-spacing: 2px; text-transform: uppercase;">Identity Verification</p>
      <div style="background-color: #030014; padding: 20px; border-radius: 12px; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #fff;">{otp}</span>
      </div>
      <p style="color: #64748b; font-size: 12px; margin-top: 30px;">
        This access code will expire in 10 minutes. Do not share this code with anyone.
      </p>
    </div>
    """
    send_email_sync(email, "Kaarya.OS High-Security Verify", get_base_html(content))

def generate_otp(length: int = 6) -> str:
    """ Generates a numeric OTP. """
    return ''.join(random.choices(string.digits, k=length))

def send_notification_email(email: str, subject: str, body: str, button_text: str, button_url: str):
    content = f"""
    <h2 style="font-size: 20px; font-weight: 900; margin-bottom: 10px; color: #fff;">{subject}</h2>
    <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
      {body}
    </p>
    <div style="margin-top: 30px; text-align: center;">
      <a href="{button_url}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">
        {button_text}
      </a>
    </div>
    """
    send_email_sync(email, subject, get_base_html(content))
