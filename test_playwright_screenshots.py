from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # Log all console and network to trace exactly what is failing
        page.on("console", lambda msg: print(f"PAGE LOG: {msg.text}"))
        page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}"))
        page.on("request", lambda req: print(f"REQ: {req.method} {req.url}") if 'api' in req.url else None)
        page.on("response", lambda res: print(f"RES: {res.status} {res.url}") if 'api' in res.url else None)
        
        print("Navigating to https://kaarya-os.vercel.app/signup...")
        page.goto("https://kaarya-os.vercel.app/signup")
        page.wait_for_timeout(2000)
        
        print("Testing Email OTP Flow...")
        email_tab = page.locator("button:has-text('Email OTP')")
        if email_tab.count() > 0:
            email_tab.click()
            print("Clicked Email OTP tab.")
        
        page.wait_for_timeout(2000)
        page.screenshot(path="screenshot_before_send.png")
        print("Saved screenshot_before_send.png")
        
        page.locator("input[placeholder='name@company.com']").fill("test_user_999@kaarya.os")
        page.locator("input[placeholder='Jane Doe']").fill("Test User")
        
        send_btn = page.locator("button:has-text('Send OTP')").first
        if send_btn.count() > 0:
            send_btn.click()
            print("Clicked Send OTP.")
            
            # Wait for backend response (up to 10 seconds for cold start)
            page.wait_for_timeout(6000)
            
            # Take screenshot to see what user sees
            page.screenshot(path="screenshot_after_send.png")
            print("Saved screenshot_after_send.png")
            
            otp_input = page.locator("input[placeholder='000000']")
            if otp_input.count() > 0:
                print("OTP input IS VISIBLE!")
                
                # Wait for the debug_code to be filled automatically
                page.wait_for_timeout(2000)
                
                # Check for verify button by getting the submit button of the form
                verify_btn = page.locator("button[type='submit']").first
                if verify_btn.count() > 0:
                    verify_btn.click()
                    print("Clicked Verify OTP.")
                    page.wait_for_timeout(5000)
                    page.screenshot(path="screenshot_after_verify.png")
                    print("Saved screenshot_after_verify.png")
                else:
                    print("ERROR: Verify OTP button not found.")
            else:
                print("ERROR: OTP input NOT VISIBLE.")
        else:
            print("ERROR: Send OTP button not found.")
            
        browser.close()

if __name__ == "__main__":
    run()
