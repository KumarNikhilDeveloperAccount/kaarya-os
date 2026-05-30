from PIL import Image
import os

img_path = r"c:\Users\nkash\Downloads\ChatGPT Image May 30, 2026, 02_47_22 AM.png"
img = Image.open(img_path)

# Let's crop the top section (dark background logo with text)
# The image is 1024x1024 typically from ChatGPT (or similar aspect ratio)
width, height = img.size

# Assuming it's a grid, the top dark section is roughly the top 40%
dark_logo = img.crop((0, 0, width, int(height * 0.40)))
dark_logo.save(r"c:\kaarya-os\public\logo-dark.png")

# The light logo is below it, roughly from 40% to 60%, but let's check
light_logo = img.crop((0, int(height * 0.45), int(width * 0.6), int(height * 0.65)))
light_logo.save(r"c:\kaarya-os\public\logo-light.png")

print(f"Original size: {width}x{height}")
print("Saved cropped logos.")
