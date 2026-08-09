import smtplib
from email.message import EmailMessage
from app.config import settings

def get_base_html(content: str) -> str:
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap');
      
      body {{
        margin: 0; padding: 0; font-family: 'Outfit', sans-serif; background-color: #030014; color: #ffffff;
        -webkit-font-smoothing: antialiased;
      }}
      
      .email-container {{
        max-width: 600px; margin: 40px auto; padding: 0; background-color: #0b0f19; 
        border: 1px solid #1e293b; border-radius: 24px; text-align: left; overflow: hidden;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }}

      .header-area {{
        background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
        padding: 40px 20px; text-align: center; position: relative;
        overflow: hidden;
      }}
      
      .logo {{
        height: 40px;
        animation: pulseLogo 3s infinite alternate;
        filter: drop-shadow(0 0 10px rgba(255,255,255,0.3));
      }}

      .content-area {{
        padding: 40px;
        background-color: #0b0f19;
      }}

      .inner-card {{
        background-color: #111827;
        border: 1px solid #374151;
        border-radius: 16px;
        padding: 30px;
        color: #e2e8f0;
        line-height: 1.7;
        box-shadow: inset 0 2px 4px 0 rgba(255, 255, 255, 0.05);
      }}

      h2 {{
        color: #ffffff; margin-top: 0; font-weight: 800; font-size: 24px;
        background: -webkit-linear-gradient(#fff, #94a3b8);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      }}

      .btn {{
        display: inline-block; padding: 14px 28px; 
        background: linear-gradient(90deg, #3b82f6, #6366f1);
        color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: 600;
        box-shadow: 0 4px 14px 0 rgba(99, 102, 241, 0.39);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }}

      .footer-area {{
        padding: 30px; text-align: center; color: #64748b; font-size: 13px;
        background-color: #050811; border-top: 1px solid #1e293b;
      }}

      @keyframes slideUp {{
        0% {{ opacity: 0; transform: translateY(30px); }}
        100% {{ opacity: 1; transform: translateY(0); }}
      }}
      
      @keyframes pulseLogo {{
        0% {{ transform: scale(1); }}
        100% {{ transform: scale(1.05); }}
      }}
    </style>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Outfit', sans-serif; background-color: #030014; color: #ffffff;">
      <div class="email-container" style="max-width: 600px; margin: 40px auto; background-color: #0b0f19; border: 1px solid #1e293b; border-radius: 24px; overflow: hidden;">
        <div class="header-area" style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 20px; text-align: center;">
          <img src="https://iili.io/CRK8Uan.png" alt="Kaarya OS Logo" class="logo" style="height: 40px;" />
        </div>
        <div class="content-area" style="padding: 40px;">
          <div class="inner-card" style="background-color: #111827; border: 1px solid #374151; border-radius: 16px; padding: 30px; color: #e2e8f0; line-height: 1.7;">
            {content}
          </div>
        </div>
        <div class="footer-area" style="padding: 30px; text-align: center; color: #64748b; font-size: 13px; background-color: #050811; border-top: 1px solid #1e293b;">
          &copy; 2026 Kaarya OS. Built with ❤️ for the future of work.<br/>
          <span style="opacity: 0.7;">Automated message from Kaarya Support Desk</span>
        </div>
      </div>
    </body>
    </html>
    """

def send_email_sync(to_email: str, subject: str, html_content: str):
    try:
        msg = EmailMessage()
        msg['Subject'] = subject
        msg['From'] = settings.SMTP_FROM
        msg['Reply-To'] = "kaarya.support@gmail.com"
        msg['To'] = to_email
        msg.add_alternative(html_content, subtype='html')

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
            print(f"[Email] Sent to {to_email}: {subject}")
    except Exception as e:
        print(f"[Email] Failed to send email to {to_email}. Error: {e}")

def send_ticket_created_email_to_user(user_email: str, reference_number: str, subject: str):
    content = f"""
    <h2>Support Ticket Raised 🎉</h2>
    <p>Hi there,</p>
    <p>We've successfully received your support request. Our team of experts is already on it!</p>
    
    <div style="background: rgba(59, 130, 246, 0.1); border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
        <p style="margin: 0 0 8px 0;"><strong style="color: #60a5fa;">Reference Number:</strong> <span style="font-family: monospace; font-size: 16px;">{reference_number}</span></p>
        <p style="margin: 0;"><strong style="color: #60a5fa;">Subject:</strong> {subject}</p>
    </div>
    
    <p>Sit back and relax. Every time your ticket is updated, we will notify you right here with the latest work notes.</p>
    <br/>
    <p>Best regards,<br/><strong style="color: #818cf8;">Kaarya OS Support Team</strong></p>
    """
    send_email_sync(user_email, f"Support Ticket {reference_number} Created", get_base_html(content))

def send_ticket_created_email_to_support(reference_number: str, subject: str, content: str, category: str, sub_category: str):
    html_content = f"""
    <h2>New Ticket Alert: {reference_number} 🚨</h2>
    <p>A new support ticket requires your attention on the Kaarya Support Desk.</p>
    
    <div style="background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
        <p style="margin: 0 0 8px 0;"><strong style="color: #f87171;">Category:</strong> {category} &gt; {sub_category}</p>
        <p style="margin: 0 0 8px 0;"><strong style="color: #f87171;">Subject:</strong> {subject}</p>
        <p style="margin: 0;"><strong style="color: #f87171;">Description:</strong></p>
        <p style="margin: 8px 0 0 0; color: #cbd5e1; font-style: italic;">"{content}"</p>
    </div>
    
    <p>Log in to the support portal to take action immediately.</p>
    <br/>
    <a href="http://localhost:3001" class="btn" style="display: inline-block; padding: 14px 28px; background: linear-gradient(90deg, #3b82f6, #6366f1); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600;">Open Support Desk</a>
    """
    send_email_sync("kaarya.support@gmail.com", f"NEW TICKET: {reference_number} - {subject}", get_base_html(html_content))

def send_ticket_updated_email(user_email: str, reference_number: str, worknotes: str, status: str):
    content = f"""
    <h2>Update on Ticket {reference_number} 🚀</h2>
    <p>Great news! Our support agents have added a new update to your ticket.</p>
    
    <div style="background: rgba(16, 185, 129, 0.1); border-left: 4px solid #10b981; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
        <p style="margin: 0 0 8px 0;"><strong style="color: #34d399;">Current Status:</strong> <span style="background: #064e3b; color: #34d399; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;">{status}</span></p>
        <p style="margin: 0;"><strong style="color: #34d399;">Latest Worknotes:</strong></p>
        <p style="margin: 8px 0 0 0; color: #cbd5e1; font-style: italic;">"{worknotes}"</p>
    </div>
    
    <p>If you have any further questions or need to <strong>provide more information</strong>, simply click the button below to reply directly on your portal.</p>
    <br/>
    <center>
      <a href="http://localhost:3000/settings" class="btn" style="display: inline-block; padding: 14px 28px; background: linear-gradient(90deg, #3b82f6, #6366f1); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600;">Provide More Information</a>
    </center>
    <br/>
    <p>Best regards,<br/><strong style="color: #818cf8;">Kaarya OS Support Team</strong></p>
    """
    send_email_sync(user_email, f"Update on Ticket {reference_number}", get_base_html(content))

def send_ticket_closed_email(user_email: str, reference_number: str, worknotes: str):
    content = f"""
    <h2>Ticket Resolved & Closed 🌟</h2>
    <p>Hi there,</p>
    <p>We are delighted to let you know that your support ticket has been marked as <strong>Resolved</strong> by our team!</p>
    
    <div style="background: rgba(139, 92, 246, 0.1); border-left: 4px solid #8b5cf6; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
        <p style="margin: 0 0 8px 0;"><strong style="color: #a78bfa;">Resolution Notes:</strong></p>
        <p style="margin: 8px 0 0 0; color: #e2e8f0; font-style: italic;">"{worknotes}"</p>
    </div>
    
    <p>We hope we were able to completely solve your issue today. If you still need help with this specific request, you can easily reopen the ticket by clicking the link below.</p>
    <br/>
    <center>
      <a href="http://localhost:3000/settings?reopen={reference_number}" class="btn" style="display: inline-block; padding: 12px 24px; background: linear-gradient(90deg, #6b7280, #4b5563); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; margin-right: 10px;">Reopen Ticket</a>
      <a href="http://localhost:3000/feedback?ticket={reference_number}" class="btn" style="display: inline-block; padding: 12px 24px; background: linear-gradient(90deg, #ec4899, #f43f5e); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600;">Leave Feedback</a>
    </center>
    <br/>
    <p>Thank you for choosing us!<br/><strong style="color: #818cf8;">Kaarya OS Support Team</strong></p>
    """
    send_email_sync(user_email, f"Ticket Resolved: {reference_number}", get_base_html(content))
