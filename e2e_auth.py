from playwright.sync_api import sync_playwright
import time
import uuid

URL = "https://kaarya-os.vercel.app"

def test_auth():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        
        test_email = f"test_{uuid.uuid4().hex[:6]}@kaarya.os"
        test_password = "Password123!"
        
        try:
            print("--- Testing Password Signup ---")
            page.goto(f"{URL}/signup")
            page.wait_for_selector('input[placeholder="name@company.com"]')
            
            page.fill('input[placeholder="Jane Doe"]', "E2E Tester")
            page.fill('input[placeholder="name@company.com"]', test_email)
            # The password placeholder is "        " (8 spaces)
            page.fill('input[type="password"]', test_password)
            
            page.click('button:has-text("Create Account")')
            
            # Wait for redirect to login or success message
            page.wait_for_timeout(5000)
            print(f"Current URL after signup: {page.url}")
            page.screenshot(path="signup_result.png")

            print("\n--- Testing Login with Password ---")
            page.goto(f"{URL}/login")
            page.wait_for_selector('input[placeholder="name@organization.com"]')
            page.fill('input[placeholder="name@organization.com"]', test_email)
            page.fill('input[type="password"]', test_password)
            page.click('button:has-text("Enter Workspace")')
            
            page.wait_for_timeout(5000)
            print(f"Current URL after password login: {page.url}")
            page.screenshot(path="login_password_result.png")

            print("\n--- Testing OTP Login ---")
            # Sign out first (assume we can clear cookies or just go back to login)
            context = browser.new_context()
            page2 = context.new_page()
            page2.goto(f"{URL}/login")
            
            # Click Email OTP mode
            page2.click('button:has-text("Email OTP")')
            page2.wait_for_timeout(1000)
            
            page2.fill('input[placeholder="name@organization.com"]', test_email)
            page2.click('button:has-text("Request Access Code")')
            
            print("Requested OTP...")
            page2.wait_for_timeout(3000)
            
            # Since the email contains @kaarya.os, the API responds with debug_code
            # Playwright intercept response:
            # We can't easily intercept retroactively without setup. Let's just hardcode 682474? No, it changes.
            # I will just write a python script using httpx to test the OTP flow end-to-end to ensure it's not a backend issue.
            page2.screenshot(path="otp_requested.png")
            
        except Exception as e:
            print(f"Test Failed: {e}")
            page.screenshot(path="error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    test_auth()
