import time
import logging
import uuid
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.database import engine, Base, SessionLocal
from app.models import User
from app.routers import auth, jobs, sandbox, interviews, payments, admin, support, ai, dashboard, boomi

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# In a real production deployment, you'd use Alembic. 
# Here we'll ensure tables are created on startup if they don't exist for simplicity in early phases.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Kaarya.OS API", description="Hiring, decided.")

# Global Exception Handler disabled for debugging

# Logging Middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    request_id = str(uuid.uuid4())
    start_time = time.time()
    
    # Store request_id in request state for downstream use
    request.state.request_id = request_id
    
    response = await call_next(request)
    duration = time.time() - start_time
    
    # Add request_id to response headers
    response.headers["X-Request-ID"] = request_id
    
    logger.info(f"RID: {request_id} | Method: {request.method} | Path: {request.url.path} | Status: {response.status_code} | Duration: {duration:.4f}s")
    return response

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "Kaarya.OS API is running"}

import os

# Build origins list dynamically
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "https://kaarya-os.vercel.app",
    "https://www.kaarya-os.vercel.app",
    "https://frontend-two-steel-22.vercel.app"
]
frontend_url = os.environ.get("FRONTEND_BASE_URL")
if frontend_url:
    origins.append(frontend_url.rstrip('/'))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["jobs"])
app.include_router(sandbox.router, prefix="/api/sandbox", tags=["sandbox"])
app.include_router(interviews.router, prefix="/api/interviews", tags=["interviews"])
app.include_router(payments.router, prefix="/api/payments", tags=["payments"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(support.router, prefix="/api/support", tags=["support"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(boomi.router, prefix="/api/boomi", tags=["boomi"])

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Welcome to Kaarya.OS API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.on_event("startup")
def startup_db_migration():
    """Migrate existing emails to lowercase to prevent duplicates and login issues."""
    try:
        db = SessionLocal()
        users_list = db.query(User).all()
        migrated_count = 0
        for u in users_list:
            if u.email and u.email != u.email.lower().strip():
                u.email = u.email.lower().strip()
                migrated_count += 1
        db.commit()
        db.close()
        logger.info(f"Successfully migrated {migrated_count} emails to lowercase.")
    except Exception as e:
        logger.error(f"Migration error: {e}")
