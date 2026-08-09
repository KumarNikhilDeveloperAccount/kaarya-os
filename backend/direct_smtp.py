import smtplib
from email.message import EmailMessage

def send_direct():
    msg = EmailMessage()
    msg['Subject'] = 'Test Email from Kaarya OS Support'
    msg['From'] = 'Kaarya OS Support <kaarya.support@gmail.com>'
    msg['To'] = 'nkashyapnikhilnk@gmail.com'
    msg.set_content('This is a test email sent directly to the MX server to bypass SMTP auth.')

    # Google's primary MX server for gmail.com
    mx_server = 'gmail-smtp-in.l.google.com'
    try:
        with smtplib.SMTP(mx_server, 25) as server:
            server.set_debuglevel(1)
            server.send_message(msg)
            print("Direct MX delivery successful!")
    except Exception as e:
        print(f"Direct delivery failed: {e}")

if __name__ == '__main__':
    send_direct()
