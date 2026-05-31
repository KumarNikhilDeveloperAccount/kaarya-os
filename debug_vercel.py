import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        errors = []
        page.on("pageerror", lambda err: errors.append(f"Page Error: {err.message}"))
        page.on("console", lambda msg: errors.append(f"Console {msg.type}: {msg.text}") if msg.type == 'error' else None)
        
        print("Navigating to https://kaarya-os.vercel.app ...")
        await page.goto("https://kaarya-os.vercel.app", wait_until="networkidle")
        
        print("Errors captured on Vercel:")
        for e in errors:
            print(e)
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
