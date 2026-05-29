import os
import re
import json
import uvicorn
from typing import Any, Dict, List

import httpx
import whisper
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import warnings

warnings.filterwarnings("ignore")

app = FastAPI(title="Kaarya OS Super AI Node")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("=> Loading Hugging Face Embeddings Engine (all-MiniLM-L6-v2)...")
embedder = SentenceTransformer("all-MiniLM-L6-v2")

print("=> Loading Whisper AI Audio Engine (tiny)...")
whisper_model = whisper.load_model("tiny")

class AssessInterviewBody(BaseModel):
    job_description: str
    candidate_resume: str
    history: List[Dict[str, Any]]


def _parse_interview_json(raw: str) -> Dict[str, Any]:
    text = (raw or "").strip()
    if text.startswith("```"):
        lines = text.split("\n")
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{[\s\S]*\}", text)
        if match:
            return json.loads(match.group(0))
        raise


@app.post("/api/ai/assess-interview")
async def assess_interview(body: AssessInterviewBody) -> Dict[str, Any]:
    """
    Interview turn evaluation + next question via local Ollama (same contract as main API).
    """
    prompt = f"""You are Rit.ai conducting a rigorous engineering interview for Kaarya.OS.
Job Description: {body.job_description}
Resume Analysis: {body.candidate_resume}

Chat History:
{body.history}

Instructions:
1. Assess the candidate's last answer for technical depth, accuracy, and communication.
2. If the interview has reached a natural conclusion (e.g., 5+ solid turns), set is_complete to true.
3. Otherwise ask one sharp follow-up question.

Reply with ONLY a valid JSON object (no markdown), exactly these keys:
{{"evaluation_of_last_answer": "string", "next_question": "string", "is_complete": false, "forensic_evaluation": {{"technical_depth": 5, "communication": 5, "overall_assessment": "string"}}, "final_score": null}}
Use final_score as a number 0-100 only when is_complete is true; otherwise null.
"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "qwen2:0.5b",
                    "prompt": prompt,
                    "stream": False,
                },
                timeout=120.0,
            )
            response.raise_for_status()
            data = response.json()
            text = data.get("response", "") if isinstance(data, dict) else ""
            parsed = _parse_interview_json(text)
            nq = (parsed.get("next_question") or "").strip()
            if not nq:
                nq = (
                    "Go deeper: what failure modes did you account for, "
                    "and how would you observe them in production?"
                )
            parsed["next_question"] = nq
            parsed.setdefault("is_complete", False)
            parsed.setdefault("evaluation_of_last_answer", "")
            parsed.setdefault(
                "forensic_evaluation",
                {
                    "technical_depth": 5,
                    "communication": 5,
                    "overall_assessment": "OK",
                },
            )
            return parsed
        except Exception as e:
            return {
                "evaluation_of_last_answer": f"Model error: {e!s}",
                "next_question": "Walk through how you would design a resilient API for high traffic.",
                "is_complete": False,
                "forensic_evaluation": {
                    "technical_depth": 5,
                    "communication": 5,
                    "overall_assessment": "Fallback",
                },
            }


@app.post("/api/super-ai/chat")
async def chat_with_ollama(prompt: str):
    """Hits the local Ollama instance securely."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "http://localhost:11434/api/generate",
                json={"model": "qwen2:0.5b", "prompt": prompt, "stream": False},
                timeout=30.0
            )
            return response.json()
        except Exception as e:
            return {"error": "Ollama is down or model not loaded.", "details": str(e)}

@app.post("/api/super-ai/embed")
async def generate_embeddings(text: str):
    """Converts resume/job description to mathematical vectors using Hugging Face."""
    vector = embedder.encode([text])[0].tolist()
    return {"text": text, "vector_length": len(vector), "sample": vector[:5]}

@app.post("/api/super-ai/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """Uses Whisper AI to transcribe offline interview audio."""
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as f:
        f.write(await file.read())
    
    result = whisper_model.transcribe(temp_path)
    os.remove(temp_path)
    return {"transcription": result["text"]}

@app.get("/")
def health():
    return {"status": "Super Node is ONLINE. All agents autonomous."}

if __name__ == "__main__":
    print("=> SUPER NODE ONLINE. Routing Ollama, Whisper, and Hugging Face.")
    uvicorn.run(app, host="0.0.0.0", port=9999)
