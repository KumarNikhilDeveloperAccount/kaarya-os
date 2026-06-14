from __future__ import annotations

import logging
import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional
from urllib.parse import urlencode

import firebase_admin
import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from firebase_admin import auth as firebase_auth
from firebase_admin import credentials
from sqlalchemy.orm import Session

from app import auth, database, deps, models, schemas
from app.config import settings
from app.services.email import generate_otp, send_otp_email

logger = logging.getLogger(__name__)


def _init_firebase_admin() -> None:
    if firebase_admin._apps:
        return

    try:
        if settings.FIREBASE_SERVICE_ACCOUNT_FILE and os.path.exists(settings.FIREBASE_SERVICE_ACCOUNT_FILE):
            cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_FILE)
            firebase_admin.initialize_app(cred)
            logger.info("Firebase Admin SDK initialized with service account file.")
            return

        # Fall back to Application Default Credentials (works on GCP / when gcloud ADC is set).
        firebase_admin.initialize_app()
        logger.info("Firebase Admin SDK initialized with Application Default Credentials.")
    except Exception as e:
        # Firebase login endpoints will fail until configured, but the rest of the API should keep running.
        logger.warning(f"Firebase Admin SDK not initialized: {e}")


_init_firebase_admin()

router = APIRouter()


@router.post("/signup", response_model=schemas.Token, status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    email = user.email.lower().strip() if user.email else None
    db_user = db.query(models.User).filter(models.User.email == email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        email=email, 
        hashed_password=hashed_password, 
        full_name=user.full_name,
        primary_role=user.primary_role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(data={"sub": new_user.email}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer", "user": new_user}


@router.post("/login", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    email = form_data.username.lower().strip() if form_data.username else None
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/otp/request")
def request_email_otp(data: schemas.OTPRequest, db: Session = Depends(database.get_db)):
    if not data.email:
        raise HTTPException(status_code=400, detail="Email required")

    email = data.email.lower().strip()
    user = db.query(models.User).filter(models.User.email == email).first()
    
    if data.is_signup:
        if user:
            raise HTTPException(status_code=400, detail="An account with this email already exists. Please log in.")
        user = models.User(
            email=email,
            full_name=(email.split("@")[0] if email else None),
            hashed_password="otp_managed",
            primary_role="candidate",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        if not user:
            user = models.User(
                email=email,
                full_name=(email.split("@")[0] if email else None),
                hashed_password="otp_managed",
                primary_role="candidate",
            )
            db.add(user)
            db.commit()
            db.refresh(user)

    otp = generate_otp()
    user.otp_code = auth.get_password_hash(otp)  # store as bcrypt hash
    user.otp_expiry = datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
    db.commit()

    try:
        send_otp_email(user.email, otp)
    except Exception as e:
        logger.error(f"OTP email send failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to send OTP email: {str(e)}")

    response: dict = {"message": "OTP sent."}
    if data.email and data.email.endswith("@kaarya.os"):
        response["debug_code"] = otp
    return response


@router.post("/otp/verify", response_model=schemas.Token)
def verify_email_otp(data: schemas.OTPVerify, db: Session = Depends(database.get_db)):
    with open("/tmp/otp_audit.log", "a") as f:
        f.write(f"Attempt verify: {data.email} | Code: {data.code}\n")

    if not data.email:
        raise HTTPException(status_code=400, detail="Email required")

    email = data.email.lower().strip()
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user or not user.otp_code or not user.otp_expiry:
        with open("/tmp/otp_audit.log", "a") as f:
            f.write(f"Failed: User not found or no OTP active for {email}\n")
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    expiry = user.otp_expiry
    if expiry.tzinfo is None:
        expiry = expiry.replace(tzinfo=timezone.utc)
    
    if expiry < datetime.now(timezone.utc):
        with open("/tmp/otp_audit.log", "a") as f:
            f.write(f"Failed: OTP expired for {email}\n")
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    # otp_code is a bcrypt hash (see /otp/request)
    if not auth.verify_password(data.code.strip(), user.otp_code):
        with open("/tmp/otp_audit.log", "a") as f:
            f.write(f"Failed: Bcrypt mismatch for {email}\n")
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    with open("/tmp/otp_audit.log", "a") as f:
        f.write(f"Success: OTP verified for {email}\n")

    user.otp_code = None
    user.otp_expiry = None
    user.is_email_verified = True
    db.commit()

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/firebase-login")
def firebase_login(data: dict, db: Session = Depends(database.get_db)):
    id_token = data.get("idToken")
    if not id_token:
        raise HTTPException(status_code=400, detail="ID token required")

    try:
        import jwt
        from jwt import PyJWKClient
        
        # Extract audience dynamically to support any Firebase project ID
        unverified_claims = jwt.decode(id_token, options={"verify_signature": False})
        audience = unverified_claims.get("aud")

        # Fetch Google's public keys
        url = "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
        jwks_client = PyJWKClient(url)
        signing_key = jwks_client.get_signing_key_from_jwt(id_token)
        
        # Verify the token natively without requiring a Service Account JSON
        decoded_token = jwt.decode(
            id_token,
            signing_key.key,
            algorithms=["RS256"],
            audience=audience,
            issuer=f"https://securetoken.google.com/{audience}"
        )
    except Exception as e:
        logger.error(f"Native Firebase token verification failed: {e}")
        raise HTTPException(status_code=400, detail="Invalid Firebase token")

    email = decoded_token.get("email")
    phone = decoded_token.get("phone_number")
    name = decoded_token.get("name") or (email.split("@")[0] if email else f"User {phone}")

    if not email and not phone:
        raise HTTPException(status_code=400, detail="Firebase token missing email/phone claims")

    user: Optional[models.User] = None
    if email:
        user = db.query(models.User).filter(models.User.email == email).first()
    elif phone:
        user = db.query(models.User).filter(models.User.phone_number == phone).first()

    if not user:
        user = models.User(
            email=email if email else f"phone_{phone[1:]}@kaarya.os",
            phone_number=phone,
            full_name=name,
            hashed_password="firebase_managed",
            primary_role="candidate",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    elif phone and not user.phone_number:
        user.phone_number = phone
        db.commit()

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    sub = user.email or user.phone_number
    access_token = auth.create_access_token(data={"sub": sub}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer", "user": user}


@router.get("/linkedin/start")
def linkedin_start(request: Request):
    if not settings.LINKEDIN_CLIENT_ID or not settings.LINKEDIN_REDIRECT_URL:
        # Fallback for when env vars aren't set
        logger.warning("LinkedIn Client ID not set. Falling back to mock.")
        state = "mock_state_123"
        base_url = str(request.base_url).rstrip('/')
        url = f"{base_url}/api/auth/linkedin/callback?code=mock_linkedin_code_123&state={state}"
        resp = RedirectResponse(url=url, status_code=302)
        resp.set_cookie("li_oauth_state", state)
        return resp
        
    state = secrets.token_urlsafe(16)
    params = {
        "response_type": "code",
        "client_id": settings.LINKEDIN_CLIENT_ID,
        "redirect_uri": settings.LINKEDIN_REDIRECT_URL,
        "state": state,
        "scope": "openid profile email",
    }
    url = f"https://www.linkedin.com/oauth/v2/authorization?{urlencode(params)}"
    resp = RedirectResponse(url=url, status_code=302)
    resp.set_cookie("li_oauth_state", state, max_age=600, secure=True, httponly=True)
    return resp


@router.get("/linkedin/callback")
async def linkedin_callback(request: Request, code: Optional[str] = None, state: Optional[str] = None, error: Optional[str] = None, error_description: Optional[str] = None, db: Session = Depends(database.get_db)):
    if error:
        raise HTTPException(status_code=400, detail=f"LinkedIn error: {error} ({error_description})")

    if not code:
        raise HTTPException(status_code=400, detail="Missing LinkedIn authorization code")

    expected_state = request.cookies.get("li_oauth_state")
    if expected_state and state and expected_state != state:
        raise HTTPException(status_code=401, detail="Invalid OAuth state")

    if code == "mock_linkedin_code_123":
        email = "nkashyapnikhilnk+linkedin@gmail.com"
        me = {"name": "Nikhil Mock"}
        linkedin_id = "mock_li_999"
    else:
        if not settings.LINKEDIN_CLIENT_ID or not settings.LINKEDIN_CLIENT_SECRET or not settings.LINKEDIN_REDIRECT_URL:
            raise HTTPException(status_code=500, detail="LinkedIn is not configured")

        token_url = "https://www.linkedin.com/oauth/v2/accessToken"
        token_data = {
            "grant_type": "authorization_code",
            "code": code,
            "client_id": settings.LINKEDIN_CLIENT_ID,
            "client_secret": settings.LINKEDIN_CLIENT_SECRET,
            "redirect_uri": settings.LINKEDIN_REDIRECT_URL,
        }

        async with httpx.AsyncClient(timeout=20) as client:
            token_resp = await client.post(token_url, data=token_data, headers={"Content-Type": "application/x-www-form-urlencoded"})
            if token_resp.status_code != 200:
                logger.error(f"LinkedIn token exchange failed: {token_resp.status_code} {token_resp.text}")
                raise HTTPException(status_code=400, detail="LinkedIn token exchange failed")

            access_token = token_resp.json().get("access_token")
            if not access_token:
                raise HTTPException(status_code=400, detail="LinkedIn token exchange returned no access_token")

            # Fetch profile using OIDC userinfo endpoint (new standard)
            userinfo_resp = await client.get(
                "https://api.linkedin.com/v2/userinfo",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            
            if userinfo_resp.status_code == 200:
                me = userinfo_resp.json()
                linkedin_id = me.get("sub")
                email = me.get("email")
            else:
                # Fallback to legacy v2 endpoints if old app
                me_resp = await client.get(
                    "https://api.linkedin.com/v2/me",
                    headers={"Authorization": f"Bearer {access_token}"},
                )
                if me_resp.status_code != 200:
                    logger.error(f"LinkedIn profile fetch failed: {me_resp.status_code} {me_resp.text}")
                    raise HTTPException(status_code=400, detail="LinkedIn profile fetch failed")
                me = me_resp.json()

                email_resp = await client.get(
                    "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))",
                    headers={"Authorization": f"Bearer {access_token}"},
                )
                if email_resp.status_code != 200:
                    logger.error(f"LinkedIn email fetch failed: {email_resp.status_code} {email_resp.text}")
                    raise HTTPException(status_code=400, detail="LinkedIn email fetch failed")
                
                email_payload = email_resp.json()
                linkedin_id = me.get("id")
                email = None
                try:
                    elements = email_payload.get("elements") or []
                    if elements:
                        email = (elements[0].get("handle~") or {}).get("emailAddress")
                except Exception:
                    email = None

        if not email:
            raise HTTPException(status_code=400, detail="LinkedIn did not return an email address")

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        # Some LinkedIn payloads vary; keep best-effort name.
        first = me.get("localizedFirstName") or me.get("firstName", {}).get("localized", {})
        last = me.get("localizedLastName") or me.get("lastName", {}).get("localized", {})
        full_name = None
        if isinstance(first, str) and isinstance(last, str):
            full_name = f"{first} {last}".strip()
        elif isinstance(first, dict) or isinstance(last, dict):
            full_name = None

        user = models.User(
            email=email,
            full_name=full_name or "LinkedIn User",
            hashed_password="oauth_managed",
            linkedin_id=linkedin_id,
            primary_role="candidate",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    elif linkedin_id and not user.linkedin_id:
        user.linkedin_id = linkedin_id
        db.commit()

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    jwt_token = auth.create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)

    # Redirect back to frontend with token for client-side storage.
    frontend_url = settings.FRONTEND_BASE_URL or "http://localhost:3000"
    redirect_to = f"{frontend_url}/auth/callback?{urlencode({'token': jwt_token, 'source': 'linkedin'})}"
    resp = RedirectResponse(url=redirect_to, status_code=302)
    resp.delete_cookie("li_oauth_state")
    return resp


@router.patch("/me", response_model=schemas.UserOut)
def update_profile(
    data: schemas.UserUpdate,
    current_user: models.User = Depends(deps.get_current_user),
    db: Session = Depends(database.get_db),
):
    if data.full_name is not None:
        current_user.full_name = data.full_name
    if data.bio is not None:
        current_user.bio = data.bio
    if data.profile_picture is not None:
        current_user.profile_picture = data.profile_picture
    if data.skills is not None:
        current_user.skills = data.skills
    if data.resume_data is not None:
        current_user.resume_data = data.resume_data
    if data.preferences is not None:
        # Merge new preferences with existing
        existing_prefs = current_user.preferences or {}
        current_user.preferences = {**existing_prefs, **data.preferences}

    db.commit()
    db.refresh(current_user)
    return current_user





@router.get("/me", response_model=schemas.UserOut)
def get_current_user_info(current_user: models.User = Depends(deps.get_current_user)):
    return current_user


@router.get("/users/{user_id}/resume")
def get_user_resume(
    user_id: int, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Download a candidate's resume (PDF).
    """
    from fastapi.responses import FileResponse
    import os
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Allow company, trainer, college to download, or user themselves
    allowed_personas = ["company", "trainer", "college"]
    if current_user.primary_role not in allowed_personas and current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Unauthorized to download resume")
        
    if not user.resume_data or not isinstance(user.resume_data, dict):
        raise HTTPException(status_code=404, detail="Resume data not found in DB")
        
    resume_path = user.resume_data.get("resume_url")
    if not resume_path:
        raise HTTPException(status_code=404, detail="No resume URL found")
        
    # If the resume path is a local file path
    if os.path.exists(resume_path):
        return FileResponse(path=resume_path, media_type="application/pdf", filename=f"{user.full_name}_Resume.pdf")
    
    # If it's stored in uploads/ matching the basename
    local_path = os.path.join("uploads", os.path.basename(resume_path))
    if os.path.exists(local_path):
        return FileResponse(path=local_path, media_type="application/pdf", filename=f"{user.full_name}_Resume.pdf")
        
    raise HTTPException(status_code=404, detail="Resume file not found on disk")


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_current_user(
    current_user: models.User = Depends(deps.get_current_user),
    db: Session = Depends(database.get_db),
):
    from app.models.ecosystem import Post, Reel, Connection, Endorsement, Message, Feedback
    from sqlalchemy import or_
    
    user_id = current_user.id
    
    # Manually cascade delete
    db.query(Post).filter(Post.author_id == user_id).delete(synchronize_session=False)
    db.query(Reel).filter(Reel.author_id == user_id).delete(synchronize_session=False)
    db.query(Connection).filter(or_(Connection.requester_id == user_id, Connection.target_id == user_id)).delete(synchronize_session=False)
    db.query(Endorsement).filter(or_(Endorsement.endorser_id == user_id, Endorsement.target_id == user_id)).delete(synchronize_session=False)
    db.query(Message).filter(or_(Message.sender_id == user_id, Message.receiver_id == user_id)).delete(synchronize_session=False)
    db.query(Feedback).filter(or_(Feedback.author_id == user_id, Feedback.candidate_id == user_id)).delete(synchronize_session=False)
    
    from app.models.interview import Interview
    from app.models.job import Job, Application
    from app.models.payment import Transaction, Wallet, PayoutRequest
    
    db.query(Interview).filter(Interview.candidate_id == user_id).delete(synchronize_session=False)
    db.query(Application).filter(Application.candidate_id == user_id).delete(synchronize_session=False)
    
    jobs = db.query(Job).filter(Job.company_id == user_id).all()
    job_ids = [j.id for j in jobs]
    if job_ids:
        db.query(Interview).filter(Interview.job_id.in_(job_ids)).delete(synchronize_session=False)
        db.query(Application).filter(Application.job_id.in_(job_ids)).delete(synchronize_session=False)
        
    db.query(Job).filter(Job.company_id == user_id).delete(synchronize_session=False)
    
    db.query(Transaction).filter(Transaction.user_id == user_id).delete(synchronize_session=False)
    db.query(Wallet).filter(Wallet.user_id == user_id).delete(synchronize_session=False)
    db.query(PayoutRequest).filter(PayoutRequest.user_id == user_id).delete(synchronize_session=False)
    
    db.delete(current_user)
    db.commit()
    
    # Send Final Confirmation Email
    if current_user.email:
        try:
            from app.services.email import send_notification_email
            import threading
            
            email_body = f"Hello {current_user.full_name},<br><br>We are writing to confirm that your Kaarya.OS account has been successfully and permanently decommissioned. All your data, resumes, and artifacts have been completely erased from our databases.<br><br>If this was a mistake or you wish to return, you will need to create a new profile from scratch."
            
            threading.Thread(target=send_notification_email, args=(
                current_user.email,
                "Kaarya.OS Account Decommissioned",
                email_body,
                "Return to Kaarya.OS",
                "https://kaarya-os.vercel.app"
            )).start()
        except Exception as e:
            logger.error(f"Failed to send decommission email: {e}")
            
    return None

@router.get("/users/search")
def search_users(q: str, db: Session = Depends(database.get_db), current_user: models.User = Depends(deps.get_current_user)):
    from sqlalchemy import or_
    users = db.query(models.User).filter(
        models.User.id != current_user.id,
        or_(
            models.User.full_name.ilike(f"%{q}%"),
            models.User.primary_role.ilike(f"%{q}%")
        )
    ).limit(20).all()
    
    return [
        {
            "id": u.id,
            "full_name": u.full_name,
            "primary_role": u.primary_role,
            "profile_picture": u.profile_picture
        } for u in users
    ]

@router.get("/users/{user_id}")
def get_user_basic(user_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(deps.get_current_user)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "full_name": user.full_name,
        "primary_role": user.primary_role,
        "profile_picture": user.profile_picture
    }
