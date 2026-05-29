import asyncio
import os
import sys
from playwright.async_api import async_playwright
import urllib.request
import urllib.parse
import json
import sqlite3

async def run_e2e():
    print("Starting E2E Visual Verification...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False, slow_mo=700)
        context = await browser.new_context()
        page = await context.new_page()
        
        try:
            print("1. Testing Registration/Login Page...")
            await page.goto("http://localhost:3000/login", timeout=60000)
            
            await page.click("text=Email OTP")
            email = "visualtest@kaarya.os"
            await page.fill("input[type='email']", email)
            await page.click("text=Request Access Code")
            
            await page.wait_for_selector("input[placeholder='6-digit code']", timeout=15000)
            
            # Fetch OTP from SQLite db
            db_path = "kaarya_os.db"
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT otp_code FROM users WHERE email=? ORDER BY id DESC LIMIT 1", (email,))
            row = cursor.fetchone()
            conn.close()
            
            if not row:
                raise Exception("OTP not found in database!")
            
            otp_code = row[0]
            print(f"Retrieved OTP: {otp_code}")
            
            await page.fill("input[placeholder='6-digit code']", otp_code)
            await page.click("text=Verify & Enter")
            
            print("2. Testing Role Selection UI...")
            # Should auto redirect to role-selection if no roles
            await page.wait_for_selector("h3:has-text('Candidate')", timeout=15000)
            await page.click("h3:has-text('Candidate')")
            await page.click("text=Confirm Selection")
            
            print("3. Visual Check of Sandbox Dashboard...")
            await page.goto("http://localhost:3000/coding", timeout=15000)
            await page.wait_for_selector("text=Engineering Lab v4.0")
            
            print("4. Executing Sandbox Code...")
            await page.click("text=Execute Lab")
            await page.wait_for_selector("text=Candidate Score: 89.9", timeout=15000)
            
            print("5. Visual Check of Support Center...")
            await page.goto("http://localhost:3000/support", timeout=15000)
            await page.wait_for_selector("text=Support Command Center")
            
            print("E2E UI Visual Check passed! Everything renders smoothly.")
            
        except Exception as e:
            print(f"Error during E2E test: {e}")
            
        finally:
            print("Closing browser in 5 seconds so you can see the final state...")
            await asyncio.sleep(5)
            await browser.close()

if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    asyncio.run(run_e2e())
