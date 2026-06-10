import asyncio
from playwright.async_api import async_playwright

async def verify_local_pages():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        base_url = "http://localhost:3000"
        routes_to_check = [
            "/analytics",
            "/batches",
            "/billing",
            "/placements",
            "/feedback",
            "/interviews/requests",
            "/resume",
            "/interview"
        ]
        
        print("Starting comprehensive localhost verification...")
        
        results = []
        for route in routes_to_check:
            url = f"{base_url}{route}"
            print(f"Testing {url}...")
            try:
                response = await page.goto(url, wait_until="networkidle")
                content = await page.content()
                
                # Check for critical errors or placeholders
                if "An unexpected error has occurred" in content or "Internal Server Error" in content:
                    status = "CRITICAL ERROR"
                elif "Module staging" in content:
                    status = "STUB_FOUND"
                else:
                    status = f"OK ({response.status})"
                    
                print(f" -> {status}")
                results.append((route, status))
            except Exception as e:
                print(f" -> EXCEPTION: {e}")
                results.append((route, "EXCEPTION"))
                
        await browser.close()
        
        print("\n--- LOCALHOST VERIFICATION SUMMARY ---")
        all_passed = True
        for route, status in results:
            print(f"{route.ljust(25)}: {status}")
            if "OK" not in status:
                all_passed = False
                
        if all_passed:
            print("ALL FIXES VERIFIED SUCCESSFULLY ON LOCALHOST!")
        else:
            print("SOME ROUTES FAILED VERIFICATION ON LOCALHOST.")

if __name__ == "__main__":
    asyncio.run(verify_local_pages())
