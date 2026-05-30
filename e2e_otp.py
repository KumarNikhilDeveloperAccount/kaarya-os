from playwright.sync_api import sync_playwright
import time
import uuid
import json

URL = "https://kaarya-os.vercel.app"

def test_otp():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        
        test_email = f"test_{uuid.uuid4().hex[:6]}@kaarya.os"
        
        try:
            print("--- Testing OTP Login ---")
            page.goto(f"{URL}/login")
            
            # Click Email OTP mode
            page.click('button:has-text("Email OTP")')
            page.wait_for_timeout(1000)
            
            page.fill('input[placeholder="name@organization.com"]', test_email)
            
            # Set up network interception to catch the debug_code
            debug_code = None
            
            with page.expect_response("**/api/auth/otp/request") as response_info:
                page.click('button:has-text("Request Access Code")')
            
            response = response_info.value
            if response.status == 200:
                body = response.json()
                debug_code = body.get("debug_code")
                print(f"Intercepted OTP: {debug_code}")
            else:
                print(f"OTP Request Failed: {response.status}")
                return
                
            if not debug_code:
                print("No debug code found!")
                return
                
            page.wait_for_timeout(2000)
            page.screenshot(path="otp_input_screen.png")
            
            page.fill('input[placeholder="000000"]', debug_code)
            page.click('button:has-text("Verify & Enter")')
            
            page.wait_for_timeout(5000)
            print(f"URL after OTP verification: {page.url}")
            page.screenshot(path="otp_success.png")
            
        except Exception as e:
            print(f"Test Failed: {e}")
            page.screenshot(path="error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    test_otp()
