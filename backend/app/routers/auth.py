from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from passlib.context import CryptContext
import jwt
from jwt import PyJWTError as JWTError
from typing import Optional
from datetime import datetime, timedelta
import os
import bcrypt

# Monkeypatch bcrypt for passlib compatibility
if not hasattr(bcrypt, "__about__"):
    class BcryptAbout:
        def __init__(self):
            self.__version__ = getattr(bcrypt, "__version__", "4.0.0")
    bcrypt.__about__ = BcryptAbout()

router = APIRouter()

# SECURITY CONFIG
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

from fastapi.security import OAuth2PasswordBearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

def get_optional_current_user(token: str = Depends(oauth2_scheme_optional), db: Session = Depends(get_db)):
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
    except JWTError:
        return None
        
    user = db.query(models.User).filter(models.User.email == email).first()
    return user

def get_current_admin(current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user

@router.get("/me") # Return full user model (or a specific schema if we want to filter)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role.value if hasattr(current_user.role, 'value') else current_user.role,
        "current_streak": current_user.current_streak,
        "avatar_url": current_user.avatar_url
    }

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/register", response_model=schemas.Token)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(data={"sub": new_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    print(f"DEBUG: Login attempt for {user.email}")
    try:
        db_user = db.query(models.User).filter(models.User.email == user.email).first()
        if not db_user or not verify_password(user.password, db_user.hashed_password):
            raise HTTPException(status_code=400, detail="Incorrect email or password")
        
        # Handle Enum or String role
        role_str = db_user.role.value if hasattr(db_user.role, 'value') else db_user.role
        access_token = create_access_token(data={"sub": db_user.email, "role": role_str})
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        print(f"LOGIN ERROR: {e}")
        raise e

from ..core.security import oauth
from starlette.requests import Request

# ... keep your imports and other code above ...

@router.get("/google/login")
async def login_google(request: Request):
    try:
        # Clear session to prevent cookie bloat (4KB limit)
        request.session.clear()
        
        # Use BACKEND_URL environment variable
        # For Vercel: Set BACKEND_URL=https://codemaster-ai.vercel.app in environment variables
        # For Local: Use default http://localhost:8000
        backend_url = os.getenv("BACKEND_URL", "http://localhost:8000")
        GOOGLE_REDIRECT_URI = f"{backend_url}/api/auth/google/callback"
        print(f"DEBUG: Redirecting to Google with URI: {GOOGLE_REDIRECT_URI}")
        return await oauth.google.authorize_redirect(request, GOOGLE_REDIRECT_URI)
    except Exception as e:
        print(f"GOOGLE LOGIN ERROR: {e}")
        import traceback
        traceback.print_exc()
        return {"error": str(e), "traceable": traceback.format_exc()}

@router.get("/google/callback")
async def auth_google_callback(request: Request, db: Session = Depends(get_db)):
    try:
        # DEBUG: Print session keys to debug state mismatch
        print(f"DEBUG CALLBACK SESSION KEYS: {request.session.keys()}")
        print(f"DEBUG CALLBACK SESSION STATE: {request.session.get('state')}")
        print(f"DEBUG HEADERS: {request.headers}")
        print(f"DEBUG COOKIES: {request.cookies}")
        
        # 1. Exchange Access Token
        token = await oauth.google.authorize_access_token(request)
        
        # 2. Get User Info
        user_info = token.get('userinfo')
        if not user_info:
             user_info = await oauth.google.parse_id_token(request, token)
             
        email = user_info.get("email")
        name = user_info.get("name")
        picture = user_info.get("picture")
        sub = user_info.get("sub")
        
        # Check if user exists
        db_user = db.query(models.User).filter(models.User.email == email).first()
        if not db_user:
            # Create new user
            hashed_password = get_password_hash("GOOGLE_AUTH_PLACEHOLDER")
            db_user = models.User(
                email=email,
                full_name=name,
                hashed_password=hashed_password,
                avatar_url=picture,
                google_sub=sub,
                current_streak=0,
                role=models.UserRole.STUDENT
            )
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            
        # Create JWT
        role_str = db_user.role.value if hasattr(db_user.role, 'value') else db_user.role
        access_token = create_access_token(data={"sub": email, "role": role_str})
        
        # DYNAMIC: Use environment variable for frontend redirect
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        return RedirectResponse(f"{frontend_url}/auth/callback?token={access_token}")
        
    except Exception as e:
        print(f"Google Auth Error: {e}")
        import traceback
        traceback.print_exc()
        # RETURN THE REAL ERROR TO THE USER FOR DEBUGGING
        raise HTTPException(status_code=400, detail=f"Google Authentication Failed: {str(e)}")

# --- Role Management ---

class UserRoleUpdate(schemas.BaseModel):
    role: models.UserRole

@router.put("/users/{user_id}/role", response_model=schemas.User)
def update_user_role(
    user_id: int, 
    role_update: UserRoleUpdate, 
    db: Session = Depends(get_db), 
    current_admin: models.User = Depends(get_current_admin)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent self-demotion if not careful, but allowing it for now
    user.role = role_update.role
    db.commit()
    db.refresh(user)
    return user

# --- Impersonation (Support/Admin) ---

@router.post("/impersonate/{user_id}", response_model=schemas.Token)
def impersonate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Only Admin or Support can impersonate
    if current_user.role not in [models.UserRole.ADMIN, models.UserRole.SUPPORT]:
        raise HTTPException(status_code=403, detail="Insufficient privileges")

    target_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Target user not found")

    # Create token for target user
    # Note: We might want to add a claim 'impersonator_id': current_user.id for audit logs
    role_str = target_user.role.value if hasattr(target_user.role, 'value') else target_user.role
    access_token = create_access_token(data={"sub": target_user.email, "role": role_str})
    
    return {"access_token": access_token, "token_type": "bearer"}