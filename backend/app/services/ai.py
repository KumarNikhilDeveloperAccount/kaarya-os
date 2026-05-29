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

# Refactor to route AI calls to Ollama and Hugging Face endpoints
OLLAMA_URL = "http://localhost:11434"
HUGGING_FACE_URL = "http://localhost:9999"

def route_to_ollama(payload: dict) -> dict:
    """Route AI calls to Ollama."""
    try:
        response = requests.post(f"{OLLAMA_URL}/api/v1/generate", json=payload)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        logger.error(f"Ollama request failed: {e}")
        return {"error": "Ollama request failed."}

def route_to_hugging_face(payload: dict) -> dict:
    """Route AI calls to Hugging Face."""
    try:
        response = requests.post(f"{HUGGING_FACE_URL}/api/v1/analyze", json=payload)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        logger.error(f"Hugging Face request failed: {e}")
        return {"error": "Hugging Face request failed."}

def evaluate_resume(resume_text: str, job_description: str) -> dict:
    """
    Evaluates a candidate's resume against a job description with extreme accuracy.
    Returns a structured dictionary with score, feedback, and skill alignments.
    """
    if not client:
        return {
            "score": 0, 
            "feedback": "Rit.ai engine is currently offline. Verify API configuration.", 
            "matched_skills": [], 
            "missing_skills": [],
            "seniority_alignment": "Unknown",
            "hire_recommendation": "No"
        }
        
    payload = {
        "resume_text": resume_text,
        "job_description": job_description
    }
    return route_to_ollama(payload)

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
    payload = {
        "job_description": job_description,
        "candidate_resume": candidate_resume,
        "history": history
    }
    return route_to_hugging_face(payload)
