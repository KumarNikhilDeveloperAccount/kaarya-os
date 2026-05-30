from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        print("Launching browser...")
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        page.on("console", lambda msg: print(f"PAGE LOG: {msg.text}"))
        page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}"))
        
        def handle_res(res):
            print(f"NETWORK RESPONSE: {res.status} {res.url}")
        page.on("response", handle_res)
        
        def handle_req(req):
            print(f"NETWORK REQUEST: {req.method} {req.url}")
        page.on("request", handle_req)

        print("Navigating to https://kaarya-os.vercel.app/signup...")
        page.goto("https://kaarya-os.vercel.app/signup")
        
        # Wait for hydration
        page.wait_for_timeout(3000)
        
        print("Testing Hamburger Menu...")
        menu_button = page.locator("button", has=page.locator("svg.lucide-menu"))
        if menu_button.count() > 0:
            print("Clicking hamburger menu...")
            menu_button.click()
            page.wait_for_timeout(1000)
        else:
            print("No hamburger menu found on desktop view. (expected)")

        print("Testing Google Sign In...")
        google_btn = page.locator("button:has-text('Google')")
        if google_btn.count() > 0:
            google_btn.click()
            print("Clicked Google Sign In.")
            page.wait_for_timeout(2000)
        else:
            print("Google Sign In button not found.")
            
        print("Testing Email OTP...")
        email_btn = page.locator("button:has-text('Email')")
        if email_btn.count() > 0:
            email_btn.click()
            print("Clicked Email.")
            page.wait_for_timeout(1000)
            
            # Find email input
            email_input = page.locator("input[type='email']")
            if email_input.count() > 0:
                email_input.fill("testlocal@kaarya.os")
                print("Filled email.")
                
                # Full name
                name_input = page.locator("input[placeholder='Jane Doe']").first
                if name_input.count() > 0:
                    name_input.fill("Local Test")
                
                page.fill("input[placeholder='Jane Doe']", "Nikhil Kashyap")
                print("Filled name.")
                
                send_otp_btn = page.locator("button:has-text('SEND OTP')")
                if send_otp_btn.count() > 0:
                    send_otp_btn.click()
                    print("Clicked SEND OTP.")
                    page.wait_for_timeout(6000)
                    
                    # See if OTP input appeared
                    otp_input = page.locator("input[placeholder='000000']")
                    if otp_input.count() > 0:
                        print("OTP input appeared. Filling dummy OTP 123456...")
                        otp_input.fill("123456")
                        
                        verify_btn = page.locator("button:has-text('Verify & Continue')")
                        if verify_btn.count() > 0:
                            verify_btn.click()
                            print("Clicked Verify & Continue.")
                            page.wait_for_timeout(3000)
                        else:
                            print("Verify button not found.")
                    else:
                        print("OTP input did not appear!")
                else:
                    print("SEND OTP button not found.")
        
        print("Test finished.")
        browser.close()

if __name__ == "__main__":
    run()
