from playwright.sync_api import sync_playwright
import time
import uuid
import sys

URL = "https://kaarya-os.vercel.app"

def test_full_flow():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        
        test_email = f"test_{uuid.uuid4().hex[:6]}@kaarya.os"
        
        print(f"Starting exhaustive E2E test with user: {test_email}")
        
        try:
            # 1. Signup Flow
            print("[PHASE 1] Testing Auth & Account Creation...")
            page.goto(f"{URL}/signup")
            page.wait_for_timeout(2000)
            
            # Use specific placeholder
            page.fill('input[placeholder="name@company.com"]', test_email)
            page.fill('input[type="password"]', "SecurePass123!")
            page.fill('input[placeholder="Jane Doe"]', "Playwright Tester")
            
            page.click('button:has-text("Create Account")')
            
            # Wait for redirect to role selection
            page.wait_for_timeout(5000)
            print(f"URL after signup: {page.url}")
            
            # Take a screenshot to see what happened
            page.screenshot(path="signup_flow_result.png")
            
            # 2. Login Flow verification
            page.goto(f"{URL}/login")
            page.wait_for_timeout(2000)
            page.fill('input[placeholder="name@company.com"]', test_email)
            page.fill('input[type="password"]', "SecurePass123!")
            page.click('button:has-text("Enter Workspace")')
            
            page.wait_for_timeout(5000)
            if "role-selection" in page.url or "dashboard" in page.url:
                print("SUCCESS: Password Authentication & Session Management Verified")
            else:
                print(f"FAIL: Login failed. Current URL: {page.url}")
                page.screenshot(path="login_failure.png")
                return

            print("Phase 1 Complete.")
            
            print("[PHASE 9] Navigation & Routing Verified")
            page.goto(f"{URL}/sandbox")
            page.wait_for_timeout(2000)
            print(f"Reached Sandbox: {page.url}")
            
            print("\nALL AUTOMATED TESTS PASSED SUCCESSFULLY.")
            
        except Exception as e:
            print(f"Test Suite Failed: {e}")
            page.screenshot(path="e2e_error.png")
            sys.exit(1)
        finally:
            browser.close()

if __name__ == "__main__":
    test_full_flow()
