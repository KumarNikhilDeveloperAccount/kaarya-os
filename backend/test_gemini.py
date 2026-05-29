import sys
import os
from dotenv import load_dotenv
import google.generativeai as genai
from app.config import settings

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
load_dotenv()

def test_gemini():
    api_key = os.getenv("GEMINI_API_KEY") or settings.GEMINI_API_KEY
    assert api_key, "GEMINI_API_KEY not found in .env or settings."

    genai.configure(api_key=api_key)
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content("Hello! Are you alive?")
        assert response.text, "No response from Gemini."
    except Exception as e:
        assert False, f"Gemini Error: {str(e)}"

if __name__ == "__main__":
    test_gemini()
