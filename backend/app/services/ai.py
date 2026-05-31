import os
import json
import logging
from app.config import settings
import requests

logger = logging.getLogger(__name__)

# Gemini / Google GenAI SDK is optional for local dev.
try:
    from google import genai  # type: ignore
    from google.genai import types  # type: ignore
except Exception:  # pragma: no cover
    genai = None
    types = None
    logger.warning("Google GenAI SDK not installed; Rit.ai features will run in offline mode.")

# Initialize Gemini Client
client = None
try:
    if genai and settings.GEMINI_API_KEY:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
    else:
        logger.warning("GEMINI_API_KEY is missing in settings.")
except Exception as e:
    logger.error(f"Could not initialize Gemini Client: {e}")

# Extremely detailed, high-level system instruction to simulate a hyper-intelligent AI entity
SYSTEM_INSTRUCTION = """You are Rit.ai, the apex intelligence engine for Kaarya.OS ("Hiring, decided"). 
You combine the reasoning capabilities of the world's most advanced AI models (ChatGPT, Gemini, Claude) into a cohesive, hyper-accurate evaluation system.
Your purpose is to deeply analyze, assess, and evaluate engineering and technical candidates with extreme precision. 
You do not hallucinate. You do not flatter. You provide highly critical, accurate, and actionable intelligence.
You are fluent in English and Hindi, but evaluate primarily in English unless asked otherwise.

CRITICAL DIRECTIVES:
1. Exacting Standards: Evaluate candidates against top-tier tech industry standards (e.g., FAANG/MAANG level).
2. Deep Nuance: Look for architectural understanding, scalability, and clean code principles, not just keyword matching.
3. No Guesses: If data is insufficient, explicitly state "I don't have enough data to evaluate this."
4. JSON Output: When asked for an evaluation or assessment, you MUST output valid JSON if the prompt specifies a JSON structure.
"""

def clean_json(text: str) -> str:
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()

def evaluate_resume(resume_text: str, job_description: str) -> dict:
    """
    Evaluates a candidate's resume against a job description with extreme accuracy.
    Returns a structured dictionary with score, feedback, and skill alignments.
    """
    if not client:
        return {
           "personal": { "name": "Jane Doe", "email": "jane@example.com", "location": "San Francisco", "objective": "Senior Engineer" },
           "experience": [ { "title": "Senior Dev", "company": "Tech Corp", "duration": "3 years", "description": "Backend dev" } ],
           "skills": ["Python", "React", "Node.js"],
           "education": [ { "degree": "BS CS", "institution": "University", "year": "2020" } ],
           "rit_analysis": {
              "summary": "Rit.ai engine is currently offline. Using mock data.",
              "fit_score": 85,
              "missing_keywords": ["Docker", "AWS"]
           }
        }
        
    prompt = f"""
    You are Rit.ai. Analyze this resume against the job description.
    Job Description: {job_description}
    Resume: {resume_text}
    
    You MUST respond with ONLY a valid JSON object matching this structure EXACTLY (no markdown, no quotes):
    {{
       "personal": {{ "name": "...", "email": "...", "location": "...", "objective": "..." }},
       "experience": [ {{ "title": "...", "company": "...", "duration": "...", "description": "..." }} ],
       "skills": ["...", "..."],
       "education": [ {{ "degree": "...", "institution": "...", "year": "..." }} ],
       "rit_analysis": {{
          "summary": "...",
          "fit_score": 95,
          "missing_keywords": ["...", "..."]
       }}
    }}
    """
    try:
        response = client.models.generate_content(
            model="gemini-1.5-pro",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                temperature=0.2
            )
        )
        return json.loads(clean_json(response.text))
    except Exception as e:
        logger.error(f"Gemini resume evaluation failed: {e}")
        return {
           "personal": { "name": "Jane Doe", "email": "jane@example.com", "location": "San Francisco", "objective": "Senior Engineer" },
           "experience": [ { "title": "Senior Dev", "company": "Tech Corp", "duration": "3 years", "description": "Backend dev" } ],
           "skills": ["Python", "React", "Node.js"],
           "education": [ { "degree": "BS CS", "institution": "University", "year": "2020" } ],
           "rit_analysis": {
              "summary": "Rit.ai engine encountered an error. Using mock data fallback.",
              "fit_score": 85,
              "missing_keywords": ["Docker", "AWS"]
           }
        }

def ask_rit(question: str, context: str = "") -> str:
    """
    General purpose hyper-intelligent question answering.
    """
    if not client:
        return "I am currently offline. Please check my API configuration."
        
    prompt = question
    if context:
        prompt = f"Given the following factual context:\n{context}\n\nPlease answer this question with profound intelligence and extreme accuracy: {question}"
        
    try:
        response = client.models.generate_content(
            model="gemini-1.5-pro",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION
            )
        )
        return response.text if response else "I don't have enough data to answer that."
    except Exception as e:
        return f"System error: {str(e)}"

def conduct_interview_turn(job_description: str, candidate_resume: str, history: list) -> dict:
    """
    Handles a single turn in the AI-led interview, evaluating the last answer and asking the next.
    """
    if not client:
         return {
             "evaluation_of_last_answer": "AI offline.", 
             "next_question": "System is currently unavailable. Please try again later.", 
             "is_complete": False
         }
         
    prompt = f"""
    You are Rit.ai conducting a rigorous engineering interview for Kaarya.OS.
    Job Description: {job_description}
    Resume Analysis: {candidate_resume}
    
    Chat History: 
    {history}
    
    Instructions:
    1. Assess the candidate's last answer for technical depth, accuracy, and communication.
    2. If the interview has reached a natural conclusion (e.g., candidate gave a final answer, or 5+ high-quality technical turns have passed), set is_complete to true.
    3. Otherwise, ask a follow-up question that drills deeper into their previous point or moves to a new critical technical domain from the JD.
    4. Maintain a forensic, professional, and slightly intimidating tone.

    You MUST respond with ONLY a valid JSON object:
    {
        "evaluation_of_last_answer": "<Detailed forensic critique>",
        "next_question": "<Your next challenging question, or closing remarks if is_complete is true>",
        "is_complete": <boolean>,
        "forensic_evaluation": <object containing "technical_depth": 1-10, "communication": 1-10, "overall_assessment": "str">,
        "final_score": <optional float 0-100, only if is_complete is true>
    }
    """
    try:
        response = client.models.generate_content(
            model="gemini-1.5-pro",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                temperature=0.7
            )
        )
        return json.loads(clean_json(response.text))
    except Exception as e:
        logger.error(f"Gemini interview evaluation failed: {e}")
        return {
             "evaluation_of_last_answer": "AI encountered an error parsing your response.", 
             "next_question": "Please try answering again or restarting the assessment.", 
             "is_complete": False
         }
