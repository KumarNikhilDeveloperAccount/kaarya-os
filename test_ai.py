import sys
import os

# Add backend directory to sys.path so 'app' can be imported
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.services.ai import evaluate_resume

try:
    print("Testing evaluate_resume...")
    res = evaluate_resume("Kumar Nikhil. Founded NikVerse AI.", "Senior Software Engineer")
    print(res)
except Exception as e:
    import traceback
    print("Error:", e)
    traceback.print_exc()
