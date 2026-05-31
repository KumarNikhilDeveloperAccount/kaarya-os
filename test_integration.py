import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            # Grant camera and microphone permissions explicitly
            permissions=['camera', 'microphone']
        )
        page = await context.new_page()
        
        try:
            print("Testing Frontend Connection...")
            await page.goto("http://localhost:3000")
            print("Frontend is reachable.")
            
            print("Testing Resume Parser...")
            await page.goto("http://localhost:3000/resume")
            await page.wait_for_selector("text=Deploy Rit Engine")
            
            print("Testing AI Interview Video Load...")
            await page.goto("http://localhost:3000/interview")
            await page.wait_for_selector("text=Initialize Hardware")
            # Simulate clicking initialize
            await page.click("text=Initialize Hardware")
            await asyncio.sleep(2) # wait for calibration
            
            # See if diagnostic validation appears (video loaded successfully)
            await page.wait_for_selector("text=Diagnostic Validation", timeout=5000)
            print("Video/Hardware initialization passed!")
            
            print("All local integration tests passed!")
        except Exception as e:
            print(f"Test failed: {e}")
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
