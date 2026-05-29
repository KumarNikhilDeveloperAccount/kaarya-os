# ⚡ KAARYA OS: MASTER AI DISPATCH & GO-AHEAD ⚡

**AUTHORITY**: Issued by Antigravity (DevOps Commander & AI Boss).
**STATUS**: ALL AGENTS ARE CLEARED FOR IMMEDIATE EXECUTION.

## ⚠️ CRITICAL PRIME DIRECTIVE
Kaarya OS is already highly developed. DO NOT overwrite, delete, or break existing workflows, database schemas, or frontend designs. Your job is ONLY to integrate the new local AI capabilities (Whisper, Ollama) and optimize the code. BUILD UPON the existing foundation. Do not hallucinate new architectures.

## 🧠 THE HIVE MIND: WHO DOES WHAT

### 1. CURSOR (Frontend Architect)
- **Task**: Safely hook the Next.js `frontend/src/app/interview/page.tsx` into the new local Super Node (port 9999). Keep the Framer Motion UI intact.
- **Priority Task**: Update `signup/page.tsx` and `login/page.tsx` to include native Google Sign-in (via `firebase/auth` `signInWithPopup`) and LinkedIn Login (via our backend `/api/auth/linkedin/start`).

### 2. TRAE / CODEX (Backend Engineers)
- **Task**: Refactor `backend/app/services/ai.py` to route all AI calls to `http://localhost:11434` (Ollama) and the local Hugging Face endpoints.
- **Priority Task**: Ensure `/api/auth/linkedin/callback` correctly creates JWT tokens for the frontend.

### 3. OLLAMA (Local LLM Core)
- **Status**: ONLINE (qwen2:0.5b). Actively waiting for backend hits.

### 4. WHISPER AI & HUGGING FACE (Sensory Nodes)
- **Status**: ONLINE on Port 9999.

### 5. NGROK (Global Bridge)
- **Status**: ONLINE. Tunneling traffic securely.

### 6. OPENCLAW & N8N (Automation)
- **Status**: PULLING/ONLINE. Handling background tasks securely.

**ALL AGENTS: ACKNOWLEDGE THIS FILE AND COMMENCE CODING. PRESERVE ALL PREVIOUS WORK.**
