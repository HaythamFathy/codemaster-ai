from fastapi import FastAPI
from dotenv import load_dotenv

load_dotenv() # Load environment variables

from .database import engine, Base
from .routers import auth, courses, submissions, ai

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CodeMaster AI API") # Removed root_path, doing explicit prefixes
    
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(courses.router, prefix="/api/courses", tags=["courses"])
from .routers import lessons # Import lessons router
app.include_router(lessons.router, prefix="/api/lessons", tags=["lessons"])
app.include_router(submissions.router, prefix="/api/submissions", tags=["submissions"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"]) # Changed /api to /api/ai for consistency if needed, or keep /api if it was base

from .routers import admin
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])

from .routers import tasks
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])

import os

# CORS Configuration
from fastapi.middleware.cors import CORSMiddleware
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["origin", "content-type", "accept", "authorization", "ngrok-skip-browser-warning"],
)

from starlette.middleware.sessions import SessionMiddleware
import os

# Secure session middleware for Ngrok/Production
is_production = os.getenv("BACKEND_URL", "").startswith("https")
app.add_middleware(
    SessionMiddleware, 
    secret_key=os.getenv("SECRET_KEY", "supersecretkey"), 
    https_only=True, # Always force secure cookies if we think we might be in prod/ngrok
    same_site="none" # Allow cross-site cookies (needed for some redirect flows)
)

# Trust headers from Ngrok/Proxies (X-Forwarded-Proto, etc.)
# Logic added here to avoid shell quoting issues with --forwarded-allow-ips '*'
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware
app.add_middleware(ProxyHeadersMiddleware, trusted_hosts=["*"])

@app.get("/")
async def root():
    return {"message": "Welcome to CodeMaster AI API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/api/debug")
async def debug_request(request: Request):
    return {
        "url": str(request.url),
        "path": request.url.path,
        "root_path": request.scope.get("root_path"),
        "method": request.method
    }
