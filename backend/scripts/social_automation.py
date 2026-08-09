import os
import time
import json
import random
import datetime
import logging
import smtplib
from email.message import EmailMessage
from pathlib import Path
from dotenv import load_dotenv
from google import genai



# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("social_automation.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Configure Gemini for content generation
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    ai_client = genai.Client(api_key=GEMINI_API_KEY)
else:
    logger.warning("GEMINI_API_KEY not found in .env. AI Content generation will use fallbacks.")
    ai_client = None

# Social API Keys
TWITTER_API_KEY = os.getenv("TWITTER_API_KEY")
TWITTER_API_SECRET = os.getenv("TWITTER_API_SECRET")
TWITTER_ACCESS_TOKEN = os.getenv("TWITTER_ACCESS_TOKEN")
TWITTER_ACCESS_SECRET = os.getenv("TWITTER_ACCESS_SECRET")
FACEBOOK_PAGE_TOKEN = os.getenv("FACEBOOK_PAGE_TOKEN") 
LINKEDIN_ACCESS_TOKEN = os.getenv("LINKEDIN_ACCESS_TOKEN")
LINKEDIN_URN = os.getenv("LINKEDIN_URN")
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

# Paths for Assets & State
ASSETS_DIR = Path(os.path.dirname(__file__)).parent / "assets" / "social_media"
IMAGES_DIR = ASSETS_DIR / "images"
VIDEOS_DIR = ASSETS_DIR / "videos"
STATE_FILE = Path(os.path.dirname(__file__)) / "social_state.json"

def get_state():
    if STATE_FILE.exists():
        try:
            with open(STATE_FILE, "r") as f:
                return json.load(f)
        except Exception:
            pass
    return {"consecutive_images": 0}

def save_state(state):
    with open(STATE_FILE, "w") as f:
        json.dump(state, f)

def send_notification(subject, body):
    if not SMTP_USER or not SMTP_PASSWORD:
        logger.warning("SMTP credentials missing. Cannot send email notification.")
        return
    try:
        msg = EmailMessage()
        msg['Subject'] = subject
        msg['From'] = f"Kaarya OS Automations <{SMTP_USER}>"
        msg['To'] = SMTP_USER
        msg.set_content(body)

        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        logger.info(f"Notification sent: {subject}")
    except Exception as e:
        logger.error(f"Failed to send email notification: {e}")

def generate_ad_image(prompt: str) -> str:
    """Generates a high-quality branded ad image using Pillow instead of AI."""
    from PIL import Image, ImageDraw, ImageFont
    import textwrap
    logger.info("Generating new branded ad image...")
    
    try:
        # Create a 1080x1080 canvas with brand background (Kaarya Purple to Dark Blue gradient style)
        # For simplicity in PIL, we'll use a solid deep background
        img = Image.new('RGB', (1080, 1080), color=(17, 24, 39)) # Tailwind gray-900
        draw = ImageDraw.Draw(img)
        
        # Load and paste the logo
        logo_path = Path(__file__).parent.parent.parent / "public" / "kaarya-logo-final.png"
        if logo_path.exists():
            logo = Image.open(logo_path).convert("RGBA")
            # Resize logo
            logo.thumbnail((300, 300))
            # Center horizontally, near top
            logo_x = (1080 - logo.width) // 2
            img.paste(logo, (logo_x, 150), logo)
            
        # Write the text
        try:
            # Try to load a nice font if available, fallback to default
            font = ImageFont.truetype("arial.ttf", 60)
        except:
            font = ImageFont.load_default()
            
        # Clean up prompt text (remove quotes if any)
        text = prompt.replace('"', '').strip()
        
        # Wrap text
        lines = textwrap.wrap(text, width=35)
        
        # Calculate total height of text block
        y_text = 500
        for line in lines:
            # Approximate height for PIL default or arial
            draw.text((100, y_text), line, font=font, fill=(255, 255, 255))
            y_text += 80
            
        timestamp = datetime.datetime.now().strftime("%Y%md_%H%M%S")
        filepath = IMAGES_DIR / f"generated_ad_{timestamp}.jpg"
        
        img.save(filepath, quality=95)
        logger.info(f"Successfully generated and saved branded HD image: {filepath}")
        return str(filepath)
    except Exception as e:
        logger.error(f"Failed to generate branded image: {e}")
        return None

def get_media_for_run(media_type):
    """Generates a new image or falls back to existing assets."""
    if media_type == "image":
        if ai_client:
            try:
                # Ask Gemini to generate a short, punchy marketing phrase
                prompt = "Write a very short, punchy, 1-sentence marketing quote (max 15 words) for a B2B SaaS hiring platform named Kaarya.OS. Do not include hashtags. Just the quote."
                res = ai_client.models.generate_content(model="gemini-3.5-flash", contents=prompt)
                img_prompt = res.text.strip()
            except:
                img_prompt = "Hiring, decided. Smarter, faster, validated."
        else:
            img_prompt = "Hiring, decided. Smarter, faster, validated."
            
        generated_path = generate_ad_image(img_prompt)
        if generated_path:
            return generated_path
        media_files = list(IMAGES_DIR.glob("*.*"))
        if media_files:
            return str(random.choice(media_files))
    elif media_type == "video":
        media_files = list(VIDEOS_DIR.glob("*.*"))
        if media_files:
            return str(random.choice(media_files))
        # Fallback to image if no videos
        return get_media_for_run("image")
    return None

def post_to_twitter(text, media_path=None):
    if not all([TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET]):
        logger.warning("[Twitter] Skipping - Missing API Keys in .env")
        return True # Graceful skip
        
    try:
        import tweepy
        client = tweepy.Client(
            consumer_key=TWITTER_API_KEY, consumer_secret=TWITTER_API_SECRET,
            access_token=TWITTER_ACCESS_TOKEN, access_token_secret=TWITTER_ACCESS_SECRET
        )
        if media_path:
            auth = tweepy.OAuth1UserHandler(TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET)
            api = tweepy.API(auth)
            media = api.media_upload(media_path)
            client.create_tweet(text=text, media_ids=[media.media_id])
        else:
            client.create_tweet(text=text)
        logger.info("[Twitter] Successfully posted.")
        return True
    except Exception as e:
        if "402" in str(e):
            logger.warning("[Twitter] Gracefully skipping due to 402 Payment Required.")
            return True
        logger.error(f"[Twitter] Failed to post: {e}")
        return False

def post_to_linkedin(text, media_path=None):
    if not all([LINKEDIN_ACCESS_TOKEN, LINKEDIN_URN]):
        return True
    try:
        import requests
        headers = {"Authorization": f"Bearer {LINKEDIN_ACCESS_TOKEN}", "X-Restli-Protocol-Version": "2.0.0"}
        asset = None
        if media_path:
            register_url = "https://api.linkedin.com/v2/assets?action=registerUpload"
            is_video = str(media_path).endswith('.mp4')
            recipe = "urn:li:digitalmediaRecipe:feedshare-video" if is_video else "urn:li:digitalmediaRecipe:feedshare-image"
            
            reg_data = {
                "registerUploadRequest": {
                    "recipes": [recipe],
                    "owner": f"urn:li:organization:{LINKEDIN_URN}",
                    "serviceRelationships": [{"relationshipType": "OWNER", "identifier": "urn:li:userGeneratedContent"}]
                }
            }
            reg_res = requests.post(register_url, headers={**headers, "Content-Type": "application/json"}, json=reg_data)
            if reg_res.status_code == 200:
                reg_json = reg_res.json()
                upload_url = reg_json['value']['uploadMechanism']['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']['uploadUrl']
                asset = reg_json['value']['asset']
                with open(media_path, 'rb') as f:
                    image_data = f.read()
                upload_res = requests.put(upload_url, headers={"Authorization": f"Bearer {LINKEDIN_ACCESS_TOKEN}", "Content-Type": "application/octet-stream"}, data=image_data)
                upload_res.raise_for_status()

        post_url = "https://api.linkedin.com/v2/ugcPosts"
        media_cat = "VIDEO" if is_video else "IMAGE"
        post_data = {
            "author": f"urn:li:organization:{LINKEDIN_URN}",
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {"text": text},
                    "shareMediaCategory": media_cat if asset else "NONE",
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
        if "DUPLICATE_POST" in str(e):
            logger.warning("[LinkedIn] Gracefully skipping due to DUPLICATE_POST.")
            return True # Don't block retries for this
        logger.error(f"[LinkedIn] Failed: {e}")
        return False

def post_to_facebook(text, media_path=None, media_type="image"):
    META_USERNAME = os.getenv("META_USERNAME")
    META_PASSWORD = os.getenv("META_PASSWORD")
    if not META_USERNAME or not META_PASSWORD:
        logger.warning("[Facebook Playwright] Skipping - Missing Credentials")
        return True
        
    try:
        from playwright.sync_api import sync_playwright
        import os
        debug_dir = os.path.join(os.path.dirname(__file__), "debug")
        os.makedirs(debug_dir, exist_ok=True)
        
        with sync_playwright() as p:
            context_dir = os.path.join(os.path.dirname(__file__), "playwright_session")
            context = p.chromium.launch_persistent_context(
                user_data_dir=context_dir, headless=True, viewport={'width': 1280, 'height': 800}
            )
            page = context.new_page()
            page.goto("https://www.facebook.com/")
            page.wait_for_timeout(3000)
            
            if page.locator("input[name='email']").is_visible():
                page.fill("input[name='email']", META_USERNAME)
                page.fill("input[name='pass']", META_PASSWORD)
                page.locator("button[name='login']").click()
                page.wait_for_timeout(8000)
                
            page.screenshot(path=os.path.join(debug_dir, "fb_after_login.png"))
            
            # Navigate to Page
            page.goto("https://www.facebook.com/kaaryaos")
            page.wait_for_timeout(5000)
            
            # Switch to Page Context if prompted
            if page.locator("div[aria-label='Switch now']").is_visible():
                page.locator("div[aria-label='Switch now']").click()
                page.wait_for_timeout(5000)
                page.goto("https://www.facebook.com/kaaryaos")
                page.wait_for_timeout(5000)
                
            page.screenshot(path=os.path.join(debug_dir, "fb_on_page.png"))
            
            # Click "Photo/video" button
            try:
                page.evaluate("() => { const spans = Array.from(document.querySelectorAll('span')); const photoSpan = spans.find(s => s.textContent.includes('Photo/video')); if(photoSpan) photoSpan.click(); else { const divs = Array.from(document.querySelectorAll('div')); const createPost = divs.find(d => d.getAttribute('aria-label') && d.getAttribute('aria-label').includes('Create a post')); if(createPost) createPost.click(); } }")
            except:
                pass
                
            page.wait_for_timeout(5000)
            page.screenshot(path=os.path.join(debug_dir, "fb_post_modal.png"))
            
            # File upload
            if media_path:
                try:
                    page.locator("input[type='file']").first.set_input_files(media_path)
                except Exception as e:
                    logger.error(f"[FB] File input failed: {e}")
                    page.screenshot(path=os.path.join(debug_dir, "fb_file_input_fail.png"))
                page.wait_for_timeout(5000)
                
            # Caption
            try:
                page.evaluate(f"() => {{ document.execCommand('insertText', false, '{text}'); }}")
            except:
                page.keyboard.insert_text(text)
                
            page.wait_for_timeout(3000)
            page.screenshot(path=os.path.join(debug_dir, "fb_before_post.png"))
            
            # Post
            try:
                page.locator("div[aria-label='Post']").first.click(timeout=10000)
            except:
                page.evaluate("() => { const el = document.querySelector('div[aria-label=\"Post\"]'); if(el) el.click(); }")
                
            page.wait_for_timeout(10000)
            logger.info("[Facebook] Successfully posted via Desktop automation!")
            context.close()
            return True
    except Exception as e:
        logger.error(f"[Facebook desktop error] {e}")
        return False

def post_to_instagram(text, media_path, is_story=False):
    META_USERNAME = os.getenv("META_USERNAME")
    META_PASSWORD = os.getenv("META_PASSWORD")
    if not META_USERNAME or not META_PASSWORD:
        logger.warning("[Instagram Playwright] Skipping - Missing Credentials")
        return True
        
    try:
        from playwright.sync_api import sync_playwright
        import os
        debug_dir = os.path.join(os.path.dirname(__file__), "debug")
        os.makedirs(debug_dir, exist_ok=True)
        
        with sync_playwright() as p:
            context_dir = os.path.join(os.path.dirname(__file__), "playwright_session")
            context = p.chromium.launch_persistent_context(
                user_data_dir=context_dir, headless=True, viewport={'width': 1280, 'height': 800}
            )
            page = context.new_page()
            page.goto("https://www.instagram.com/")
            page.wait_for_timeout(5000)
            
            if page.locator("input[name='username']").is_visible():
                page.fill("input[name='username']", META_USERNAME)
                page.fill("input[name='password']", META_PASSWORD)
                page.locator("button[type='submit']").click()
                page.wait_for_timeout(10000)
                
            page.screenshot(path=os.path.join(debug_dir, "ig_after_login.png"))
            
            if page.locator("button:has-text('Not Now')").is_visible():
                page.locator("button:has-text('Not Now')").first.click()
                page.wait_for_timeout(3000)
            if page.locator("button:has-text('Not Now')").is_visible():
                page.locator("button:has-text('Not Now')").first.click()
                page.wait_for_timeout(3000)
                
            if "challenge" in page.url:
                logger.error("[Instagram] Web challenge triggered.")
                page.screenshot(path=os.path.join(debug_dir, "ig_challenge.png"))
                context.close()
                return False

            if is_story:
                logger.warning("[Instagram] Playwright Story upload skipped on desktop.")
                context.close()
                return True
                
            # Desktop sidebar New Post
            try:
                page.evaluate("() => { const els = Array.from(document.querySelectorAll('svg')); const create = els.find(e => e.getAttribute('aria-label') === 'New post' || e.getAttribute('aria-label') === 'New Post'); if(create) { const btn = create.closest('a, div[role=\"button\"], button'); if(btn) btn.click(); } }")
            except:
                pass
            
            page.wait_for_timeout(5000)
            page.screenshot(path=os.path.join(debug_dir, "ig_post_modal.png"))
            
            # File upload
            try:
                file_input = page.locator("input[type='file']").first
                if file_input:
                    file_input.set_input_files(media_path, timeout=5000)
            except Exception as e:
                logger.error(f"[IG] File input failed: {e}")
                page.screenshot(path=os.path.join(debug_dir, "ig_file_input_fail.png"))
                
            page.wait_for_timeout(5000)
            
            # Next -> Next
            try:
                page.evaluate("() => { Array.from(document.querySelectorAll('div[role=\"button\"]')).filter(e => e.textContent === 'Next').forEach(e => e.click()); }")
                page.wait_for_timeout(2000)
                page.evaluate("() => { Array.from(document.querySelectorAll('div[role=\"button\"]')).filter(e => e.textContent === 'Next').forEach(e => e.click()); }")
                page.wait_for_timeout(2000)
            except:
                pass
            
            # Fill caption
            try:
                page.evaluate(f"() => {{ document.execCommand('insertText', false, '{text}'); }}")
            except:
                page.keyboard.insert_text(text)
                
            page.wait_for_timeout(3000)
            page.screenshot(path=os.path.join(debug_dir, "ig_before_share.png"))
            
            # Share
            try:
                page.evaluate("() => { const btns = Array.from(document.querySelectorAll('div[role=\"button\"]')).filter(e => e.textContent === 'Share'); if(btns.length > 0) btns[0].click(); }")
            except:
                pass
                
            page.wait_for_timeout(15000)
            logger.info("[Instagram] Successfully posted via Desktop web automation!")
            context.close()
            return True
    except Exception as e:
        logger.error(f"[Instagram desktop upload error] {e}")
        return False

def execute_broadcast():
    logger.info("=== Starting Social Media Broadcast Cycle ===")
    
    state = get_state()
    consecutive_images = state.get("consecutive_images", 0)
    
    # Enforce 2:1 ratio rule (after 2 images, force video)
    if consecutive_images >= 2:
        logger.info("Ratio Rule Enforced: 2 consecutive images posted. Forcing VIDEO broadcast.")
        media_type = "video"
    else:
        logger.info(f"Ratio State: {consecutive_images} consecutive images. Proceeding with IMAGE broadcast.")
        media_type = "image"
        
    media_path = get_media_for_run(media_type)
    if not media_path:
        logger.warning(f"CRITICAL: No {media_type} asset found! Aborting this cycle.")
        return False

    platforms = ["LinkedIn", "Instagram (Feed)", "Facebook", "X (Twitter)"]
    generated_posts = {}
    
    for platform in platforms:
        prompt = f"You are the social media manager for Kaarya.OS, an intelligent AI-powered hiring ecosystem. Write a highly interactive, engaging, professional post for {platform}. Ask a thought-provoking question to the audience. Keep it punchy. Include relevant hashtags."
        try:
            if ai_client:
                response = ai_client.models.generate_content(model="gemini-3.5-flash", contents=prompt)
                content = response.text.strip()
            else:
                raise Exception("AI Client not initialized")
        except:
            content = f"Are you still relying on resumes? The future of hiring is intelligent and validated. Discover how Kaarya.OS is changing the game on {platform}. {random.randint(1000, 9999)} #KaaryaOS #AI #FutureOfWork"
            
        generated_posts[platform] = content
    
    # Retry Loop Logic
    max_retries = 3
    success_states = {"LinkedIn": False, "Facebook": False, "X (Twitter)": False, "Instagram (Feed)": False, "Instagram (Story)": False}
    
    for attempt in range(max_retries):
        logger.info(f"--- Broadcast Attempt {attempt + 1}/{max_retries} ---")
        
        if not success_states["X (Twitter)"]:
            success_states["X (Twitter)"] = post_to_twitter(generated_posts["X (Twitter)"], media_path)
            
        if not success_states["Facebook"]:
            success_states["Facebook"] = post_to_facebook(generated_posts["Facebook"], media_path, media_type)
            
        if not success_states["LinkedIn"]:
            success_states["LinkedIn"] = post_to_linkedin(generated_posts["LinkedIn"], media_path)
            
        if not success_states["Instagram (Feed)"]:
            success_states["Instagram (Feed)"] = post_to_instagram(generated_posts["Instagram (Feed)"], media_path, is_story=False)
            
        if not success_states["Instagram (Story)"]:
            success_states["Instagram (Story)"] = post_to_instagram("", media_path, is_story=True)
            
        if all(success_states.values()):
            logger.info("✅ All platforms posted successfully!")
            break
        else:
            failed = [k for k, v in success_states.items() if not v]
            logger.warning(f"❌ Failed platforms: {failed}. Retrying in 60s...")
            time.sleep(60)
            
    # Verification Notification & State Update
    if all(success_states.values()):
        send_notification("✅ Kaarya OS Social Engine - Broadcast SUCCESS", f"Successfully posted {media_type} to all configured platforms.")
        # Update state
        if media_type == "image":
            state["consecutive_images"] = consecutive_images + 1
        else:
            state["consecutive_images"] = 0
        save_state(state)
    else:
        failed = [k for k, v in success_states.items() if not v]
        send_notification("❌ Kaarya OS Social Engine - Broadcast FAILED", f"Failed to post {media_type} to: {failed} after {max_retries} attempts.")
        
if __name__ == "__main__":
    logger.info("Kaarya.OS Autonomous Social Engine Started.")
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    VIDEOS_DIR.mkdir(parents=True, exist_ok=True)
    
    execute_broadcast()
