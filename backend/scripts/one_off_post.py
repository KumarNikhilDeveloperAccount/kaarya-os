import os
import sys
import logging
import requests
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

# Load .env
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Environment variables
META_USERNAME = os.environ.get("META_USERNAME")
META_PASSWORD = os.environ.get("META_PASSWORD")
LINKEDIN_ACCESS_TOKEN = os.environ.get("LINKEDIN_ACCESS_TOKEN")
LINKEDIN_URN = os.environ.get("LINKEDIN_URN")

def post_to_linkedin(text, media_path=None):
    if not all([LINKEDIN_ACCESS_TOKEN, LINKEDIN_URN]):
        logger.warning("[LinkedIn] Missing credentials")
        return False
        
    try:
        headers = {
            "Authorization": f"Bearer {LINKEDIN_ACCESS_TOKEN}",
            "X-Restli-Protocol-Version": "2.0.0"
        }
        
        asset = None
        if media_path:
            # 1. Register Upload
            register_url = "https://api.linkedin.com/v2/assets?action=registerUpload"
            reg_headers = {**headers, "Content-Type": "application/json"}
            reg_data = {
                "registerUploadRequest": {
                    "recipes": ["urn:li:digitalmediaRecipe:feedshare-image"],
                    "owner": f"urn:li:organization:{LINKEDIN_URN}",
                    "serviceRelationships": [{"relationshipType": "OWNER", "identifier": "urn:li:userGeneratedContent"}]
                }
            }
            reg_res = requests.post(register_url, headers=reg_headers, json=reg_data)
            reg_res.raise_for_status()
            reg_json = reg_res.json()
            upload_url = reg_json['value']['uploadMechanism']['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']['uploadUrl']
            asset = reg_json['value']['asset']
            
            # 2. Upload Image
            with open(media_path, 'rb') as f:
                image_data = f.read()
            upload_res = requests.put(upload_url, headers={"Authorization": f"Bearer {LINKEDIN_ACCESS_TOKEN}", "Content-Type": "application/octet-stream"}, data=image_data)
            upload_res.raise_for_status()

        # 3. Post
        post_url = "https://api.linkedin.com/v2/ugcPosts"
        post_data = {
            "author": f"urn:li:organization:{LINKEDIN_URN}",
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {"text": text},
                    "shareMediaCategory": "IMAGE" if asset else "NONE",
                    "media": [{"status": "READY", "media": asset}] if asset else []
                }
            },
            "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"}
        }
        res = requests.post(post_url, headers={**headers, "Content-Type": "application/json"}, json=post_data)
        res.raise_for_status()
        logger.info("[LinkedIn] Successfully posted.")
        return True
    except Exception as e:
        logger.error(f"[LinkedIn] Failed: {e}")
        return False

def post_to_facebook(text, media_path=None):
    from playwright.sync_api import sync_playwright
    if not all([META_USERNAME, META_PASSWORD]):
        logger.warning("[Facebook] Missing credentials")
        return False
        
    try:
        with sync_playwright() as p:
            # We must use headless=False so it works like a real browser to bypass anti-bot
            browser = p.chromium.launch(headless=False)
            context = browser.new_context()
            page = context.new_page()
            
            page.goto("https://www.facebook.com/")
            page.wait_for_load_state("networkidle")
            
            if page.locator("input[name='email']").is_visible():
                logger.info("[Facebook Playwright] Authenticating...")
                page.fill("input[name='email']", META_USERNAME)
                page.fill("input[name='pass']", META_PASSWORD)
                page.keyboard.press('Enter')
                page.wait_for_load_state("networkidle")
                
            logger.info("[Facebook Playwright] Navigating to Page...")
            page.goto("https://www.facebook.com/kaaryaos")
            page.wait_for_load_state("networkidle")
            
            logger.info("[Facebook Playwright] Creating post...")
            try:
                page.locator("div[role='button']:has-text('What\\'s on your mind')").first.click(timeout=3000)
            except:
                page.evaluate("""
                    () => {
                        const elements = Array.from(document.querySelectorAll('div, span, [role="button"]'));
                        const target = elements.find(el => 
                            (el.innerText && (el.innerText.includes("What's on your mind") || el.innerText.includes("Write something") || el.innerText.includes("Create post")))
                        );
                        if (target) { target.click(); }
                    }
                """)
            
            page.wait_for_timeout(3000)
            page.keyboard.insert_text(text)
            
            if media_path:
                logger.info("[Facebook Playwright] Uploading image...")
                try:
                    page.locator("input[type='file']").first.set_input_files(media_path, timeout=5000)
                except:
                    with page.expect_file_chooser(timeout=10000) as fc_info:
                        page.evaluate("""
                            () => {
                                const elements = Array.from(document.querySelectorAll('div, span, [aria-label]'));
                                const target = elements.find(el => 
                                    (el.getAttribute('aria-label') && (el.getAttribute('aria-label').includes("Photo/video") || el.getAttribute('aria-label').includes("Photo")))
                                );
                                if (target) { target.click(); }
                            }
                        """)
                    file_chooser = fc_info.value
                    file_chooser.set_files(media_path)
                page.wait_for_timeout(5000)
                
            page.evaluate("""
                () => {
                    const elements = Array.from(document.querySelectorAll('div, span, [role="button"], button'));
                    const target = elements.find(el => 
                        (el.getAttribute('aria-label') === 'Post' || (el.innerText && el.innerText.trim() === 'Post'))
                    );
                    if (target) { target.click(); }
                }
            """)
            page.wait_for_timeout(8000)
            
            logger.info("[Facebook Playwright] Successfully posted via browser automation!")
            context.close()
            return True
            
    except Exception as e:
        logger.error(f"[Facebook Playwright] Exception: {e}")
        return False

def post_to_instagram(text, media_path, is_story=False):
    from instagrapi import Client
    if not all([META_USERNAME, META_PASSWORD]):
        logger.warning("[Instagram] Missing credentials")
        return False
        
    cl = Client()
    try:
        session_file = os.path.join(os.path.dirname(__file__), "ig_session.json")
        if os.path.exists(session_file):
            cl.load_settings(session_file)
        
        cl.login(META_USERNAME, META_PASSWORD)
        cl.dump_settings(session_file)
        
        if is_story:
            logger.info("[Instagram] Uploading Story...")
            cl.photo_upload_to_story(media_path)
            logger.info("[Instagram] Successfully posted story.")
        else:
            logger.info("[Instagram] Uploading Feed Post...")
            cl.photo_upload(media_path, text)
            logger.info("[Instagram] Successfully posted to feed.")
        return True
    except Exception as e:
        logger.error(f"[Instagram] Exception: {e}")
        return False

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", required=True)
    parser.add_argument("--caption", required=True)
    args = parser.parse_args()
    
    image_path = os.path.abspath(args.image)
    
    # 1. Instagram Story
    logger.info("=== Posting to Instagram Story ===")
    post_to_instagram("", image_path, is_story=True)
    
    # 2. Instagram Feed
    logger.info("=== Posting to Instagram Feed ===")
    post_to_instagram(args.caption, image_path, is_story=False)
    
    # 3. LinkedIn
    logger.info("=== Posting to LinkedIn ===")
    post_to_linkedin(args.caption, media_path=image_path)
    
    # 4. Facebook
    logger.info("=== Posting to Facebook ===")
    post_to_facebook(args.caption, media_path=image_path)
