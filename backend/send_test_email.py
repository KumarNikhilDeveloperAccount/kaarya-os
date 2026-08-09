from app.services.email_service import send_email_sync
import sys

def test_email():
    try:
        content = """
        <h2>Test Email from Kaarya OS</h2>
        <p>This is a test email to verify that the sender address and logo are displaying correctly.</p>
        <p>Please note: If the 'From' address says nkashyapnikhilnk@gmail.com, it is because Google strictly rewrites the address to prevent spoofing.</p>
        <p>However, we have set the <b>Reply-To</b> address to kaarya.support@gmail.com. If you click reply, it will go to the correct support address.</p>
        """
        send_email_sync(
            "nkashyapnikhilnk@gmail.com", 
            "Test Email from Kaarya OS Support", 
            content
        )
        print("Test email sent successfully!")
    except Exception as e:
        print(f"Error sending email: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_email()
