from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app import models, schemas, database
from app.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        sub: str = payload.get("sub")
        if sub is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(models.User).filter(
        (models.User.email == sub) | (models.User.phone_number == sub)
    ).first()
    
    if user is None:
        try:
            # Graceful degradation for ephemeral DBs: if JWT is cryptographically valid, auto-create user
            is_email = "@" in sub
            user = models.User(
                email=sub if is_email else None,
                phone_number=sub if not is_email else None,
                full_name=sub.split('@')[0] if is_email else f"User {sub}",
                is_active=True,
                hashed_password="ephemeral_recreated",
                active_persona="",
                roles=""
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        except Exception as e:
            import logging
            logging.error(f"Auto-recreate failed: {e}")
            raise credentials_exception
    return user

def get_current_user_optional(token: str = Depends(OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)), db: Session = Depends(database.get_db)):
    if not token:
        return None
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        sub: str = payload.get("sub")
        if sub is None:
            return None
    except JWTError:
        return None
        
    user = db.query(models.User).filter(
        (models.User.email == sub) | (models.User.phone_number == sub)
    ).first()
    return user

def get_current_active_user(current_user: models.User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def get_current_admin_user(current_user: models.User = Depends(get_current_active_user)):
    if not current_user.is_admin and current_user.active_persona != "admin":
        raise HTTPException(status_code=403, detail="Not enough privileges")
    return current_user

def get_role_checker(allowed_roles: list):
    def role_checker(current_user: models.User = Depends(get_current_active_user)):
        if current_user.active_persona not in allowed_roles and not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Not enough privileges for this persona")
        return current_user
    return role_checker
