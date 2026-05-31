import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        # Listen for console events
        page.on("console", lambda msg: print(f"Browser Console ({msg.type}): {msg.text}"))
        page.on("pageerror", lambda err: print(f"Browser Error: {err.message}"))
        
        print("Navigating to http://localhost:3000/onboarding/company ...")
        await page.goto("http://localhost:3000/onboarding/company", wait_until="networkidle")
        
        print("Navigating to http://localhost:3000/interview ...")
        await page.goto("http://localhost:3000/interview", wait_until="networkidle")
        
        print("Navigating to http://localhost:3000/reels ...")
        await page.goto("http://localhost:3000/reels", wait_until="networkidle")
        
        print("Navigating to http://localhost:3000/resume ...")
        await page.goto("http://localhost:3000/resume", wait_until="networkidle")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
