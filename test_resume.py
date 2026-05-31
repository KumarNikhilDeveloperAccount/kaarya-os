from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.on("console", lambda msg: print(f"PAGE LOG: {msg.text}"))
        page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}"))
        print("Navigating to http://localhost:3000/resume...")
        page.goto("http://localhost:3000/resume")
        page.wait_for_timeout(2000)
        print(f"URL: {page.url}")
        content = page.content()
        if "This page couldn" in content:
            print("FAILED: Page crashed")
        else:
            print("SUCCESS: Page loaded")
        browser.close()

if __name__ == "__main__":
    run()
