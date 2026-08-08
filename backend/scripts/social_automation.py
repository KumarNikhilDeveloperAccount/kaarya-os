import os
import time
import random
import datetime
import logging
import schedule
from pathlib import Path
import google.generativeai as genai
from dotenv import load_dotenv

# Import our new Video Generator
from video_generator import generate_kaarya_video

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
    genai.configure(api_key=GEMINI_API_KEY)
    ai_client = genai.GenerativeModel("gemini-1.5-flash")
else:
    logger.warning("GEMINI_API_KEY not found in .env. AI Content generation will use fallbacks.")
    ai_client = None

# Social API Keys
TWITTER_API_KEY = os.getenv("TWITTER_API_KEY")
TWITTER_API_SECRET = os.getenv("TWITTER_API_SECRET")
TWITTER_ACCESS_TOKEN = os.getenv("TWITTER_ACCESS_TOKEN")
TWITTER_ACCESS_SECRET = os.getenv("TWITTER_ACCESS_SECRET")
FACEBOOK_PAGE_TOKEN = os.getenv("FACEBOOK_PAGE_TOKEN") # Used for both FB Page and linked IG Business Account
LINKEDIN_ACCESS_TOKEN = os.getenv("LINKEDIN_ACCESS_TOKEN")
LINKEDIN_URN = os.getenv("LINKEDIN_URN")

# Paths for Assets
ASSETS_DIR = Path(os.path.dirname(__file__)).parent / "assets" / "social_media"
IMAGES_DIR = ASSETS_DIR / "images"
VIDEOS_DIR = ASSETS_DIR / "videos"

def generate_social_post(media_type="text"):
    """Uses Gemini to generate an engaging social media post."""
    prompt = f"""
    You are the social media manager for Kaarya.OS, an intelligent AI-powered hiring ecosystem.
    Write a short, engaging, highly professional social media post (under 280 characters).
    This post will be accompanied by a {media_type}.
    Topics can include: the future of hiring, AI in recruitment, breaking down silos in career growth, or a motivational quote for job seekers and recruiters.
    Include 2-3 relevant hashtags (e.g., #KaaryaOS, #FutureOfWork, #AIHiring).
    Do NOT include quotes surrounding the text. Keep it natural and punchy.
    """
    try:
        response = ai_client.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        logger.error(f"Failed to generate content via Gemini: {e}")
        return "The future of hiring is intelligent, connected, and transparent. Discover how Kaarya.OS is changing the ecosystem. #KaaryaOS #FutureOfWork"

def generate_ad_image(prompt: str) -> str:
    """Generates a new ad image using Pollinations AI (free, no key required)."""
    import urllib.parse
    logger.info(f"Generating new ad image for prompt: {prompt}")
    
    # Clean up the prompt for the URL
    safe_prompt = urllib.parse.quote(prompt)
    url = f"https://image.pollinations.ai/prompt/{safe_prompt}?width=1080&height=1080&nologo=true"
    
    try:
        import requests
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        # Save to assets folder
        timestamp = datetime.datetime.now().strftime("%Y%md_%H%M%S")
        filepath = IMAGES_DIR / f"generated_ad_{timestamp}.jpg"
        
        with open(filepath, 'wb') as f:
            f.write(response.content)
            
        logger.info(f"Successfully generated and saved new image: {filepath}")
        return str(filepath)
    except Exception as e:
        logger.error(f"Failed to generate image: {e}")
        return None

def get_random_media(media_type):
    """Generates a new image or falls back to existing assets."""
    if media_type == "image":
        # Generate a prompt for the image
        img_prompt = "A high quality, modern, sleek advertisement background for a B2B SaaS product called Kaarya OS. Minimalist, professional, corporate blue and white colors, 4k resolution."
        generated_path = generate_ad_image(img_prompt)
        
        if generated_path:
            return generated_path
            
        # Fallback to local files if API fails
        media_files = list(IMAGES_DIR.glob("*.*"))
        if media_files:
            return str(random.choice(media_files))
    elif media_type == "video":
        media_files = list(VIDEOS_DIR.glob("*.*"))
        if media_files:
            return str(random.choice(media_files))
    return None

def post_to_twitter(text, media_path=None):
    if not all([TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET]):
        logger.warning("[Twitter] Skipping - Missing API Keys in .env")
        return False
        
    try:
        import tweepy
        client = tweepy.Client(
            consumer_key=TWITTER_API_KEY, consumer_secret=TWITTER_API_SECRET,
            access_token=TWITTER_ACCESS_TOKEN, access_token_secret=TWITTER_ACCESS_SECRET
        )
        
        # Note: Media upload requires API v1.1
        if media_path:
            auth = tweepy.OAuth1UserHandler(TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET)
            api = tweepy.API(auth)
            media = api.media_upload(media_path)
            client.create_tweet(text=text, media_ids=[media.media_id])
            logger.info(f"[Twitter] Successfully posted with media: {media_path}")
        else:
            client.create_tweet(text=text)
            logger.info("[Twitter] Successfully posted text only.")
        return True
    except Exception as e:
        logger.error(f"[Twitter] Failed to post: {e}")
        return False

def post_to_facebook(text, media_path=None, media_type="text"):
    """
    Because Meta's Developer API permanently locked the required permissions, 
    we use Playwright to simulate a human user logging in and posting.
    """
    META_USERNAME = os.getenv("META_USERNAME")
    META_PASSWORD = os.getenv("META_PASSWORD")
    
    if not META_USERNAME or not META_PASSWORD:
        logger.warning("[Facebook/Instagram Playwright] Skipping - Missing META_USERNAME or META_PASSWORD in .env")
        return False
        
    try:
        from playwright.sync_api import sync_playwright
        
        with sync_playwright() as p:
            # Launch headless browser (set headless=False for debugging 2FA)
            browser = p.chromium.launch(headless=True)
            
            # Use a persistent context to save cookies and bypass 2FA on future runs
            context_dir = os.path.join(os.path.dirname(__file__), "playwright_session")
            context = p.chromium.launch_persistent_context(
                user_data_dir=context_dir,
                headless=False,
                viewport={'width': 1280, 'height': 800}
            )
            
            page = context.new_page()
            
            # Navigate to Facebook Login
            page.goto("https://www.facebook.com/")
            
            # Check if already logged in by looking for the email input
            if page.locator("input[name='email']").is_visible():
                logger.info("[Facebook Playwright] Not logged in. Authenticating...")
                page.fill("input[name='email']", META_USERNAME)
                page.fill("input[name='pass']", META_PASSWORD)
                # Bypassing brittle login button locators by simply pressing Enter
                page.keyboard.press('Enter')
                page.wait_for_load_state("networkidle")
                
                # Check for 2FA or login failure
                if page.locator("input[name='email']").is_visible():
                    logger.error("[Facebook Playwright] Login failed. Check credentials or 2FA.")
                    context.close()
                    return False
            
            logger.info("[Facebook Playwright] Authentication successful. Navigating to Page...")
            
            # Navigate directly to the Kaarya OS page to post
            page.goto("https://www.facebook.com/kaaryaos")
            page.wait_for_load_state("networkidle")
            
            logger.info("[Facebook Playwright] Creating post...")
            
            # Click "Create post" or similar UI element (using generic locators for stability)
            try:
                page.locator("div[role='button']:has-text('What\\'s on your mind')").first.click(timeout=3000)
            except:
                # Force click the composer via javascript to bypass Playwright's strict visibility checks on FB's complex overlays
                page.evaluate("""
                    () => {
                        const elements = Array.from(document.querySelectorAll('div, span, [role="button"]'));
                        const target = elements.find(el => 
                            (el.innerText && (el.innerText.includes("What's on your mind") || el.innerText.includes("Write something") || el.innerText.includes("Create post")))
                        );
                        if (target) { target.click(); }
                    }
                """)
            
            page.wait_for_timeout(3000) # wait for modal to open
            
            # Type the text (using insert_text bypasses complex draft.js/lexical DOM nodes)
            page.keyboard.insert_text(text)
            
            # Upload media if present
            if media_path:
                logger.info(f"[Facebook Playwright] Uploading {media_type}...")
                try:
                    # Attempt direct file input injection (fastest, bypasses UI)
                    page.locator("input[type='file']").first.set_input_files(media_path, timeout=5000)
                except:
                    # Fallback to UI click via JS
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
                page.wait_for_timeout(5000) # Wait for upload preview
                
            # Click Post
            page.evaluate("""
                () => {
                    const elements = Array.from(document.querySelectorAll('div, span, [role="button"], button'));
                    const target = elements.find(el => 
                        (el.getAttribute('aria-label') === 'Post' || (el.innerText && el.innerText.trim() === 'Post'))
                    );
                    if (target) { target.click(); }
                }
            """)
            page.wait_for_timeout(8000) # Wait for confirmation toast
            
            logger.info("[Facebook Playwright] Successfully posted via browser automation!")
            context.close()
            return True
            
    except Exception as e:
        logger.error(f"[Facebook Playwright] Exception during automation: {e}")
        return False

def post_to_linkedin(text, media_path=None):
    if not all([LINKEDIN_ACCESS_TOKEN, LINKEDIN_URN]):
        logger.warning("[LinkedIn] Skipping - Missing credentials in .env")
        return False
        
    try:
        import requests
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
            if reg_res.status_code == 200:
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
        logger.error(f"[LinkedIn] Failed to post: {e}")
        return False

def post_to_instagram(text, media_path, is_story=False):
    from instagrapi import Client
    META_USERNAME = os.getenv("META_USERNAME")
    META_PASSWORD = os.getenv("META_PASSWORD")
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

def execute_broadcast():
    """Selects a random media type and broadcasts to all connected networks."""
    logger.info("=== Starting Social Media Broadcast Cycle ===")
    
    # 20% chance Video, 40% chance Image, 40% chance Text
    rand_choice = random.random()
    media_type = "video" if rand_choice < 0.2 else "image" if rand_choice < 0.6 else "text"
    
    media_path = get_random_media(media_type) if media_type != "text" else None
    
    if media_type != "text" and not media_path:
        logger.info(f"Wanted to post {media_type} but no assets found in {ASSETS_DIR}. Falling back to text.")
        media_type = "text"
        
    # Generate unique content for each platform
    platforms = ["LinkedIn", "Instagram (Feed)", "Instagram (Story)", "Facebook", "X (Twitter)"]
    generated_posts = {}
    
    artifact_content = f"# Kaarya.OS Live Social Broadcast\n\n**Generated at:** {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n**Media Type:** {media_type.capitalize()}\n**Asset Loaded:** {Path(media_path).name if media_path else 'None'}\n\n"
    
    for platform in platforms:
        prompt = f"You are the social media manager for Kaarya.OS. Write a highly engaging, professional post tailored specifically for {platform}. It will be accompanied by a {media_type}. Include relevant hashtags. Do not use quotes."
        try:
            response = ai_client.generate_content(prompt)
            content = response.text.strip()
        except:
            content = f"The future of hiring is here. Kaarya.OS is changing the game on {platform}. #KaaryaOS #AI"
            
        generated_posts[platform] = content
        
        artifact_content += f"## 📱 {platform} Post\n"
        artifact_content += f"> {content}\n\n"
        if media_path:
            # We use absolute paths for the markdown artifact
            ext = str(media_path).split('.')[-1].lower()
            if ext in ['png', 'jpg', 'jpeg']:
                artifact_content += f"![{platform} Asset]({media_path})\n\n"
            else:
                artifact_content += f"![{platform} Video]({media_path})\n*(Video asset attached)*\n\n"
        
        artifact_content += "---\n"
        
    # Save the artifact for the user to review
    artifact_path = r"C:\Users\nkash\.gemini\antigravity\brain\696e0031-fd0c-4506-90a5-5281b13775a4\live_social_broadcast.md"
    with open(artifact_path, "w", encoding="utf-8") as f:
        f.write(artifact_content)
    
    logger.info(f"Saved LIVE preview to artifact: {artifact_path}")
    
    # Attempt real broadcast (will skip if API keys are missing)
    post_to_twitter(generated_posts["X (Twitter)"], media_path)
    post_to_facebook(generated_posts["Facebook"], media_path, media_type)
    post_to_linkedin(generated_posts["LinkedIn"], media_path)
    
    if media_path and media_type == "image":
        post_to_instagram(generated_posts["Instagram (Feed)"], media_path, is_story=False)
        post_to_instagram("", media_path, is_story=True)
    
    logger.info("=== Broadcast Cycle Complete ===")
    
    schedule_next_run()

def schedule_next_run():
    """Calculates the next runtime and sleeps."""
    # The user requested 8-10 hours
    hours_to_wait = random.uniform(8.0, 10.0)
    seconds_to_wait = int(hours_to_wait * 3600)
    next_run_time = datetime.datetime.now() + datetime.timedelta(seconds=seconds_to_wait)
    
    logger.info(f"Next broadcast scheduled in {hours_to_wait:.2f} hours (at {next_run_time.strftime('%Y-%m-%d %H:%M:%S')})")
    
    time.sleep(seconds_to_wait)


if __name__ == "__main__":
    logger.info("Kaarya.OS Autonomous Social Engine Started.")
    logger.info("The system is programmed to post across all linked handles every 8 to 10 hours.")
    logger.info(f"Please ensure images and videos are placed in: {ASSETS_DIR}")
    
    # Ensure directories exist
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    VIDEOS_DIR.mkdir(parents=True, exist_ok=True)
    
    # Run forever
    while True:
        execute_broadcast()
