import os
import json
import fitz  # PyMuPDF
import google.generativeai as genai
import logging
from pydantic import BaseModel
from typing import List, Optional

logger = logging.getLogger(__name__)

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    ai_client = genai.GenerativeModel("gemini-1.5-flash")
else:
    logger.warning("GEMINI_API_KEY not set. AI Resume Parser will fail.")
    ai_client = None

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extracts raw text from PDF bytes using PyMuPDF."""
    text = ""
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        for page in doc:
            text += page.get_text("text") + "\n"
        doc.close()
        return text.strip()
    except Exception as e:
        logger.error(f"Failed to extract text from PDF: {e}")
        raise ValueError("Invalid or corrupted PDF file.")

def parse_resume_with_ai(resume_text: str) -> dict:
    """Uses Gemini 1.5 to convert raw resume text into structured JSON."""
    if not ai_client:
        raise RuntimeError("AI service is not configured (missing API key).")
        
    prompt = f"""
    You are an expert technical recruiter and data extractor for Kaarya.OS, an intelligent hiring ecosystem.
    Your task is to extract all relevant professional information from the following resume text and format it STRICTLY as a JSON object.
    Do not include markdown blocks, backticks, or conversational text. Output ONLY raw JSON.

    Use the following JSON schema structure:
    {{
      "personal_info": {{
        "name": "Full Name",
        "email": "Email Address",
        "phone": "Phone Number",
        "location": "City, Country"
      }},
      "summary": "A 2-3 sentence professional summary",
      "skills": ["Skill 1", "Skill 2", "Skill 3"],
      "experience": [
        {{
          "title": "Job Title",
          "company": "Company Name",
          "start_date": "MM/YYYY",
          "end_date": "MM/YYYY or Present",
          "description": "Short description of responsibilities and achievements"
        }}
      ],
      "education": [
        {{
          "degree": "Degree Name",
          "institution": "University Name",
          "graduation_year": "YYYY"
        }}
      ]
    }}

    RESUME TEXT:
    {resume_text}
    """
    
    try:
        response = ai_client.generate_content(prompt)
        raw_json = response.text.strip()
        
        # Clean up possible markdown fences
        if raw_json.startswith("```json"):
            raw_json = raw_json[7:]
        if raw_json.startswith("```"):
            raw_json = raw_json[3:]
        if raw_json.endswith("```"):
            raw_json = raw_json[:-3]
            
        parsed_data = json.loads(raw_json.strip())
        return parsed_data
    except Exception as e:
        logger.error(f"Failed to parse resume via Gemini: {e}")
        # Fallback empty structure
        return {
            "personal_info": {"name": "", "email": "", "phone": "", "location": ""},
            "summary": "Could not parse summary.",
            "skills": [],
            "experience": [],
            "education": []
        }
