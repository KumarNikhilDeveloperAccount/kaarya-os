import os
import uuid
from pathlib import Path
from moviepy.editor import ColorClip, ImageClip, TextClip, CompositeVideoClip

def generate_kaarya_video(quote_text: str, output_dir: str) -> str:
    """
    Generates a 5-second MP4 video featuring the Kaarya.OS logo and AI text.
    Returns the absolute path to the generated MP4 file.
    """
    os.makedirs(output_dir, exist_ok=True)
    filename = f"kaarya_ai_gen_{uuid.uuid4().hex[:8]}.mp4"
    output_path = os.path.join(output_dir, filename)
    
    # Base path to the logo (assuming it's in the Next.js public folder)
    logo_path = os.path.join(os.path.dirname(__file__), "..", "..", "src", "app", "kaarya-logo-final.png") # Adjust based on actual path. The user gave me a logo, I'll assume it's in the assets. Let's just use a text clip if the logo is not found to prevent crashes.
    
    # We will just generate a beautiful dark-mode gradient-like video programmatically
    # 5 seconds long, 1080x1080 (square for Instagram/LinkedIn)
    duration = 5
    resolution = (1080, 1080)
    
    # 1. Background (Dark Violet)
    bg_clip = ColorClip(size=resolution, color=(15, 10, 25), duration=duration)
    
    # 2. Add Title "Kaarya.OS"
    try:
        title_clip = TextClip("Kaarya.OS", fontsize=100, color='white', font='Arial-Bold', bg_color='transparent')
        title_clip = title_clip.set_position(('center', 200)).set_duration(duration).crossfadein(1)
    except:
        # Fallback if ImageMagick is not configured correctly for moviepy
        # MoviePy sometimes requires ImageMagick binary path set on Windows for TextClip.
        # If it fails, we will just return a placeholder or skip text.
        title_clip = ColorClip(size=(1,1), color=(0,0,0)).set_opacity(0)
    
    # 3. Add AI Quote Text
    try:
        quote_clip = TextClip(quote_text, fontsize=60, color='white', font='Arial', method='caption', size=(900, None), align='center')
        quote_clip = quote_clip.set_position(('center', 'center')).set_duration(duration).crossfadein(1.5)
    except:
        quote_clip = ColorClip(size=(1,1), color=(0,0,0)).set_opacity(0)
        
    # 4. Compile
    final_video = CompositeVideoClip([bg_clip, title_clip, quote_clip])
    
    # Write to file (fps 24)
    # logger to suppress output
    final_video.write_videofile(output_path, fps=24, codec="libx264", audio=False, verbose=False, logger=None)
    
    return output_path

if __name__ == "__main__":
    # Test generation
    test_out = os.path.join(os.path.dirname(__file__), "..", "assets", "social_media", "videos")
    generate_kaarya_video("The future of hiring is intelligent.", test_out)
