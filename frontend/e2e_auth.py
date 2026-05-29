import asyncio
from playwright.async_api import async_playwright

async def run_tests():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context()
        
        # Test LinkedIn
        print("Testing LinkedIn Auth...")
        page = await context.new_page()
        await page.goto("http://localhost:3000/signup")
        await page.click("text=LinkedIn Professional")
        await page.wait_for_url("**/login**")
        print(f"LinkedIn success! Redirected to: {page.url}")
        await page.close()
        
        # Test Email OTP
        print("Testing Email OTP...")
        page = await context.new_page()
        await page.goto("http://localhost:3000/signup")
        await page.click("text=Email OTP")
        
        # We need to fill the form
        await page.fill("input[placeholder='Jane Doe']", "Test User")
        await page.fill("input[placeholder='name@company.com']", "nkashyapnikhilnk@gmail.com")
        await page.click("text=Send OTP")
        
        # Get OTP from backend DB since we are running locally, or better yet, read the toast text for debug code
        # Wait for the debug toast
        toast = await page.wait_for_selector("text=/Debug: OTP is/")
        toast_text = await toast.inner_text()
        print(f"Toast text: {toast_text}")
        
        # Extract 6 digit code
        import re
        m = re.search(r'\d{6}', toast_text)
        if m:
            code = m.group(0)
            print(f"Extracted code: {code}")
            await page.fill("input[placeholder='000000']", code)
            await page.click("text=Verify OTP")
            await page.wait_for_url("**/role-selection**", timeout=10000)
            print("Email OTP success!")
        else:
            print("Could not extract OTP")
            
        await page.close()
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run_tests())
