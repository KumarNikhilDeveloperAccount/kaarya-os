# Kaarya.OS Development Manifesto & Context Injection Guide

> [!IMPORTANT]
> This document is designed to be the "source of truth" for AI development assistants (Codex, Cursor, GPT-4o, etc.). 
> TO OTHER AGENTS: Read this entire file before suggesting or implementing any changes. ADHERE TO THE ARCHITECTURE.

## 1. Project Vision & Identity
- **Name**: Kaarya.OS
- **Tagline**: "Hiring, decided."
- **Core Purpose**: A forensic, AI-powered hiring platform that eliminates guesswork through high-fidelity candidate evaluations (Rit.ai) and sandboxed engineering simulations.
- **Aesthetic**: "Premium Cyber-OS" (Deep dark modes, high-contrast accents, framer-motion micro-animations, glassmorphism).

---

## 2. Tech Stack Matrix

### Backend (Python/FastAPI)
- **Framework**: FastAPI (Asynchronous)
- **Database**: SQLite (local dev `backend/kaarya_os.db`). *Note: Replaced Postgres/Redis for local stability.*
- **ORM**: SQLAlchemy 2.0+
- **AI Engine**: Google Gemini 1.5 Pro (via `google-generativeai` SDK).
- **Payment Gateway**: Razorpay (India-centric).
- **Email/Auth**: Passwordless OTP (mocked in dev).

### Frontend (Next.js/React)
- **Framework**: Next.js 16.2.1 (App Router + Turbopack)
- **Styling**: Tailwind CSS v4 (Custom config in `src/index.css`)
- **Animation**: Framer Motion 12+
- **UI Components**: Lucide-React icons, Sonner toast, Radix-based primitives.
- **Theme**: `next-themes` (Dark/Classic switch).
- **Client API**: Custom Axios instance in `src/lib/api.ts`.

---

## 3. Global Directory Map

```text
c:\kaarya-os
??? frontend (Next.js App)
?   ??? src
?   ?   ??? app (Routes)
?   ?   ?   ??? interview        # Live AI Interview Simulator
?   ?   ?   ??? resume           # Rit.ai Resume Forensic Parser
?   ?   ?   ??? role-selection   # Unified Persona Switcher
?   ?   ?   ??? admin            # Multi-dashboard monitoring
?   ?   ??? components 
?   ?   ?   ??? layout           # Topbar, Sidebar, Nav
?   ?   ?   ??? rit              # Rit.ai UI Overlays/Panels
?   ?   ?   ??? dashboard        # Company, Interviewer, College specialized dash
?   ?   ??? contexts             # AuthContext (Role persistence)
?   ??? backend (FastAPI App)
?   ?   ??? app
?   ?   ?   ??? routers          # auth, jobs, sandbox, interviews, pmts, ai
?   ?   ?   ??? models           # SQLAlchemy database entities
?   ?   ?   ??? services         # ai.py (Rit.ai logic), payment.py (80/20 split)
?   ?   ?   ??? schemas.py       # Pydantic validation
?   ?   ?   ??? worker.py        # Celery-ready logic (currently direct execution)
?   ?   ??? kaarya_os.db         # The "Live" master database
?   ??? infra                    # Deployment & Docker configurations
?   ??? scratch                  # Workspace for Rit.ai Standalone site
```

---

## 4. Core Implementation Metadata

### The Authentication Loop
- **Flow**: User enters email -> OTP sent -> Validates JWT -> Redirects to `/role-selection` (if first time) -> Landing Dashboard.
- **Roles**: `candidate`, `company`, `trainer` (Interviewer), `college`.
- **Context**: `AuthContext.tsx` maintains the `active_persona`.

### The Rit.ai Engine (Apex Intelligence)
- **Integration**: `backend/app/services/ai.py`
- **Model**: `gemini-1.5-pro-latest`
- **Prompting**: Forensic, ruthless evaluation standards. Zero flattery policy.
- **Output**: Strict JSON requirement for parsing.

### Financial Loop (Razorpay)
- **Logic**: 80/20 split between Interviewer/Platform.
- **Verification**: Cryptographic signature verification implemented in `payments.py`.
- **Asynchronicity**: Razorpay Webhook handlers implemented to fulfill logic even if browser is closed.

---

## 5. "Red Lines" (CRITICAL - DO NOT MODIFY WITHOUT CAUTION)

1.  **Naming Convention**: All references to the AI engine MUST be **Rit.ai**. Do not use "Yukti" or generic "AI Agent".
2.  **Hydration Policy**: Next.js App Router must use `mounted` hooks for client-only components (e.g., `SettingsPage`, `Topbar`) to prevent theme-flicker or SSG crashes. 
3.  **Database Configuration**: `backend/app/database.py` is configured for **SQLite** dev. Do not switch back to Postgres unless explicit cloud migration is requested.
4.  **Aesthetics**: Do not use standard HTML buttons. Every interactive element should have a `whileHover={{ scale: 1.02 }}` or equivalent premium shadow treatment.

---

## 6. Current Backlog & Recommended Tasks (FIX NEXT)

1.  **[BUG] Mobile Sidebar**: Collision with the Crisp chat widget on small screens. Needs offset.
2.  **[FEATURE] Real-time Transcripts**: The `interview/page.tsx` needs a fallback for browsers not supporting `webkitSpeechRecognition`.
3.  **[SECURITY] API Keys**: Ensure all keys are moved to `backend/.env` and accessed via `settings` pydantic config.
4.  **[SCALE] Postgres Migration**: Prepare the `docker-compose.yml` for production scaling.

---

## 7. Context Injection for Other AI Tools

**When starting a new session in Cursor/Codex, paste the following:**
> "I am working on Kaarya.OS. Technologies: FastAPI + Next.js 16 + SQLite. The AI engine is Rit.ai (Gemini 1.5 Pro). Locate global config in README.md and DEVELOPMENT_MANIFESTO.md. Always maintain the premium cyber-OS aesthetic. I have authorized access to Boomi, AWS, GCP, and Google AI Studio on this machine."

---
*Signed, Your Agentic Lead.*

## 8. Master Change Log (Recent)
- **2026-04-19**: Unified Rebranding. Shifted all indices from "Yukti" to "Rit.ai".
- **2026-04-19**: AI Engine Wiring. Dynamic Gemini 1.5 Pro integration finalized for the Interview simulator.
- **2026-04-19**: Context Handbook. Generated `DEVELOPMENT_MANIFESTO.md` for cross-tool synergy.
- **2026-04-19**: Production Build Test. Verified 0 build errors in frontend/backend pipelines.
- **2026-03-31**: Monetization. Razorpay order/verify loop cryptographic verification finalized.
- **2026-03-30**: Admin Tools. Verification and transaction dashboards connected to real API routes.

