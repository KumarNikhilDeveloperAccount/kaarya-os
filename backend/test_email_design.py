from app.services.email_service import send_ticket_updated_email
import asyncio

def test():
    # Sending test ticket updated email
    send_ticket_updated_email(
        "nkashyapnikhilnk@gmail.com",
        "TKT-TESTUI",
        "This is a test of the new amazing, sleek, and animated email UI for Kaarya OS!",
        "In Progress"
    )
    print("Test email sent!")

if __name__ == "__main__":
    test()
