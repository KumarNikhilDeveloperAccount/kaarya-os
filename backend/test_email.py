import sys
import os

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.email import send_notification_email

send_notification_email("nkashyapnikhilnk@gmail.com", "Test Email Design", "This is a test of the beautiful new email design with animations.", "Click Here", "https://kaarya-os.vercel.app")
print("Test completed.")
