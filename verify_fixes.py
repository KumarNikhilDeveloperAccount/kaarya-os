import asyncio
from playwright.async_api import async_playwright
import os

# Create screenshots directory
os.makedirs("C:/Users/nkash/.gemini/antigravity/brain/696e0031-fd0c-4506-90a5-5281b13775a4/artifacts_tests", exist_ok=True)
base_path = "C:/Users/nkash/.gemini/antigravity/brain/696e0031-fd0c-4506-90a5-5281b13775a4/artifacts_tests"

async def test_reels(page):
    print("Testing Reels Feed...")
    await page.goto("http://localhost:3000/reels")
    await page.wait_for_timeout(2000)
    
    # Click + button to upload
    await page.locator("button:has(svg)").first.click(force=True)
    await page.wait_for_selector("text=Upload Talent Reel")
    
    # Type caption
    await page.fill("textarea", "Automated UI Test Reel", force=True)
    
    # Click Publish
    await page.click("button:has-text('Publish')", force=True)
    
    # Wait for the modal to close and the post to appear
    await page.wait_for_selector("text=Automated UI Test Reel")
    await page.screenshot(path=f"{base_path}/reels_publish_success.png")
    print("Reels publish successful.")

async def test_candidate_onboarding(page):
    print("Testing Candidate Onboarding...")
    await page.goto("http://localhost:3000/onboarding/candidate")
    await page.wait_for_timeout(2000)
    
    # Step 1
    await page.fill("input[placeholder='John Doe']", "Test Candidate", force=True)
    await page.fill("input[type='date']", "1995-01-01", force=True)
    await page.click("button:has-text('Next Step')", force=True)
    await page.wait_for_timeout(1000)
    
    # Step 2
    await page.wait_for_selector("text=Academic & Professional Background")
    await page.fill("input:below(:text('College / University Name'))", "Test University", force=True)
    await page.click("button:has-text('Next Step')", force=True)
    
    # Step 3 - try to skip resume
    await page.wait_for_timeout(1000)
    await page.click("button:has-text('Next Step')", force=True)
    
    # Wait for Toast error
    await page.wait_for_selector("text=Resume upload is mandatory.")
    await page.screenshot(path=f"{base_path}/candidate_resume_blocked.png")
    print("Candidate resume validation works.")

async def test_company_onboarding(page):
    print("Testing Company Onboarding...")
    await page.goto("http://localhost:3000/onboarding/company")
    await page.wait_for_timeout(2000)
    
    # Step 1
    await page.fill("input[placeholder='Acme Corp']", "Test Company", force=True)
    await page.click("button:has-text('Next Step')", force=True)
    await page.wait_for_timeout(1000)
    
    # Step 2
    await page.select_option("select:below(:text('Industry'))", "tech", force=True)
    await page.select_option("select:below(:text('Company Size'))", "11-50", force=True)
    await page.click("button:has-text('Next Step')", force=True)
    
    # Step 3
    await page.wait_for_timeout(1000)
    # Click complete without entering roles
    await page.click("button:has-text('Complete Setup')", force=True)
    await page.wait_for_selector("text=Please specify at least one role you hire for")
    
    # Add a role
    await page.fill("input[placeholder*='Frontend Engineer']", "Backend Engineer", force=True)
    await page.keyboard.press("Enter")
    
    # Now complete setup
    await page.click("button:has-text('Complete Setup')", force=True)
    await page.wait_for_selector("text=Company profile created successfully!")
    await page.screenshot(path=f"{base_path}/company_onboarding_success.png")
    print("Company onboarding validation works.")

async def test_ai_interview(page):
    print("Testing AI Interview...")
    await page.goto("http://localhost:3000/interview")
    await page.wait_for_timeout(2000)
    
    # Initialize Hardware
    try:
        await page.click("button:has-text('Initialize Hardware')", force=True)
    except:
        print("Hardware already initialized or button not found")
        pass
    
    # Wait for calibration page
    await page.wait_for_selector("text=Diagnostic Validation")
    
    # The Start Assessment button should be disabled initially
    btn = page.locator("button:has-text('Start Assessment')")
    is_disabled = await btn.is_disabled()
    if is_disabled:
        print("Start Assessment is disabled initially, waiting for bypass...")
    
    # Wait for 5 seconds for bypass to trigger
    await asyncio.sleep(5)
    
    # Button should now be enabled
    is_disabled_now = await btn.is_disabled()
    await page.screenshot(path=f"{base_path}/interview_bypass_enabled.png")
    print(f"Is Start Assessment disabled after bypass? {is_disabled_now}")
    if not is_disabled_now:
        print("AI Interview bypass functionality works.")

async def main():
    print("Launching visible browser for manual testing...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False, slow_mo=500, args=['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'])
        context = await browser.new_context(permissions=['camera', 'microphone'])
        page = await context.new_page()
        
        try:
            await test_reels(page)
        except Exception as e:
            print(f"Reels test failed: {e}")
            
        try:
            await test_candidate_onboarding(page)
        except Exception as e:
            print(f"Candidate onboarding test failed: {e}")
            
        try:
            await test_company_onboarding(page)
        except Exception as e:
            print(f"Company onboarding test failed: {e}")
            
        try:
            await test_ai_interview(page)
        except Exception as e:
            print(f"AI Interview test failed: {e}")
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
