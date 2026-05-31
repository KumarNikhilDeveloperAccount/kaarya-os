import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        # Capture console logs
        page.on("console", lambda msg: print(f"Browser Console: {msg.type} {msg.text}"))
        page.on("pageerror", lambda err: print(f"Browser Page Error: {err}"))
        
        try:
            print("Navigating to http://localhost:3000")
            await page.goto("http://localhost:3000", timeout=15000)
            await page.wait_for_load_state("networkidle", timeout=10000)
            
            content = await page.content()
            if "<div id=\"__next\"></div>" in content or "<body></body>" in content:
                print("Warning: Page appears empty.")
            else:
                print("Page loaded successfully.")
                
            await page.screenshot(path="screenshot_3000.png")
            print("Screenshot saved to screenshot_3000.png")
            
        except Exception as e:
            print(f"Failed to load port 3000: {e}")
            
        try:
            print("\nNavigating to http://localhost:3001")
            await page.goto("http://localhost:3001", timeout=15000)
            await page.wait_for_load_state("networkidle", timeout=10000)
            await page.screenshot(path="screenshot_3001.png")
            print("Screenshot saved to screenshot_3001.png")
        except Exception as e:
            print(f"Failed to load port 3001: {e}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
