from playwright.sync_api import sync_playwright
import time
import random

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        page.on("console", lambda msg: print(f"PAGE LOG: {msg.text}"))
        page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}"))
        
        print("Navigating to https://kaarya-os.vercel.app/signup...")
        page.goto("https://kaarya-os.vercel.app/signup")
        page.wait_for_timeout(2000)
        
        email = f"nikhil_new_{random.randint(1000, 9999)}@kaarya.os"
        print(f"Testing Password Signup with email: {email}")
        
        page.locator("button:has-text('Password')").click()
        page.wait_for_timeout(1000)
        
        page.locator("input[placeholder='Jane Doe']").fill("Nikhil Test")
        page.locator("input[placeholder='name@company.com']").fill(email)
        page.locator("input[type='password']").fill("SuperSecret123!")
        
        page.locator("button[type='submit']").click()
        print("Clicked Create Account.")
        
        page.wait_for_timeout(5000)
        page.screenshot(path="screenshot_password_signup.png")
        print("Saved screenshot_password_signup.png")
        
        # Check if we landed on role selection
        if "/role-selection" in page.url:
            print("SUCCESS! Transitioned to role selection.")
        else:
            print(f"FAILED. Current URL is: {page.url}")
            
        browser.close()

if __name__ == "__main__":
    run()
