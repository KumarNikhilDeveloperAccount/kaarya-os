from playwright.sync_api import sync_playwright
import time
import os

URL = "https://kaarya-os.vercel.app"

def run_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        
        print("1. Testing Homepage")
        page.goto(URL)
        time.sleep(3)
        page.screenshot(path="screenshot_homepage.png")
        
        print("2. Testing Signup")
        page.goto(f"{URL}/signup")
        time.sleep(3)
        
        # Test Password Signup
        test_email = f"test_e2e_{int(time.time())}@kaarya.os"
        
        # In the signup page:
        # Full Name placeholder "Jane Doe"
        # Email Address placeholder "name@company.com"
        # Access Key placeholder "        "
        page.get_by_placeholder("Jane Doe").fill("E2E Tester")
        page.get_by_placeholder("name@company.com").fill(test_email)
        page.get_by_placeholder("        ").fill("Password123!")
        
        page.screenshot(path="screenshot_signup_filled.png")
        page.get_by_text("Create Secure Account").click()
        time.sleep(5)
        
        page.screenshot(path="screenshot_signup_result.png")
        
        print("3. Testing Login")
        page.goto(f"{URL}/login")
        time.sleep(3)
        page.get_by_placeholder("name@organization.com").fill(test_email)
        page.get_by_placeholder("        ").fill("Password123!")
        
        page.get_by_text("Access Dashboard").click()
        time.sleep(5)
        page.screenshot(path="screenshot_login_result.png")
        
        print("4. Testing Resume Generator")
        page.goto(f"{URL}/resume")
        time.sleep(5)
        page.screenshot(path="screenshot_resume.png")
        
        print("5. Testing Interview Module")
        page.goto(f"{URL}/interview")
        time.sleep(5)
        page.screenshot(path="screenshot_interview.png")

        print("Tests Completed. Screenshots saved.")
        browser.close()

if __name__ == "__main__":
    run_tests()
