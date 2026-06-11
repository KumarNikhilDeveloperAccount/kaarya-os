import time
import logging
import uuid
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.database import engine, Base, SessionLocal
from app.models import User
from app.routers import auth, jobs, sandbox, interviews, payments, admin, support, ai, dashboard, boomi, ecosystem, upload, coding
from fastapi.staticfiles import StaticFiles

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

from app.routers import auth, jobs, sandbox, interviews, payments, admin, support, ai, dashboard, boomi, ecosystem, upload, coding, payment

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
app.include_router(ecosystem.router, prefix="/api/ecosystem", tags=["ecosystem"])
app.include_router(upload.router, prefix="/api/upload", tags=["upload"])
app.include_router(coding.router, prefix="/api/coding", tags=["coding"])
app.include_router(payment.router, prefix="/api/payment", tags=["payment"])

# Mount uploads directory to serve static files
import os
os.makedirs("uploads", exist_ok=True)
app.mount("/api/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Welcome to Kaarya.OS API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/api/force-wipe-db")
def force_wipe():
    logger.info("Manual force wipe requested via API.")
    try:
        import os
        if str(engine.url).startswith("sqlite"):
            db_path = str(engine.url).split("sqlite:///")[-1]
            if os.path.exists(db_path):
                # force close connections maybe?
                pass
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        return {"status": "Database wiped and recreated."}
    except Exception as e:
        return {"status": "error", "detail": str(e)}

@app.on_event("startup")
def startup_db_migration():
    """Migrate existing emails to lowercase to prevent duplicates and login issues."""
    try:
        db = SessionLocal()
        # Test if the new columns exist by querying
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
        logger.error(f"Migration error (Schema Mismatch?): {e}")
        # Wipe the database tables if schema is mismatched (Requested by user: "wipe the existing mock database")
        try:
            logger.info("Wiping database and recreating schema to resolve mismatch...")
            Base.metadata.drop_all(bind=engine)
            Base.metadata.create_all(bind=engine)
            logger.info("Database wiped and recreated successfully.")
        except Exception as e2:
            logger.error(f"Failed to wipe and recreate: {e2}")
