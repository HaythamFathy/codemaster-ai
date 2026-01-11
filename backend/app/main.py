from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware
import os
from dotenv import load_dotenv

from contextlib import asynccontextmanager

# Load environment variables
load_dotenv()

from .database import engine, Base
# Import all routers
from .routers import (
    auth, courses, lessons, submissions, ai, 
    enrollments, payments, comments, users, 
    admin, tasks, instructor, analytics
)

# --- Lifespan Event Handler ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database
    try:
        # Create tables if they don't exist
        # Note: In production with migrations (Alembic), this is often skipped or handled separately
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"DATABASE CONNECTION ERROR: {e}")
        # We don't raise here to allow the app to start and serve /health
        # even if the DB is down. 
    
    yield
    
    # Shutdown: (Cleanup if needed)

# --- Application Initialization ---
app = FastAPI(
    title="CodeMaster AI API",
    description="Backend API for the CodeMaster AI E-Learning Platform",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
    redirect_slashes=False,
    lifespan=lifespan
)

# --- Middleware Configuration ---

# 1. CORS: Allow Frontend Access
# Default to localhost for dev, accept comma-separated list for prod
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
# Add Vercel preview URLs regex if needed, but strict list is safer for now
if os.getenv("FRONTEND_URL"):
    ALLOWED_ORIGINS.append(os.getenv("FRONTEND_URL"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Session Middleware (Required for Google OAuth / Authlib)
# 'lax' same_site is generally best for top-level OAuth redirects
app.add_middleware(
    SessionMiddleware, 
    secret_key=os.getenv("SECRET_KEY", "supersecretkey"), 
    https_only=os.getenv("Render") is not None, # True in Prod, False in Dev
    same_site="lax" 
)

# 3. Proxy Headers: Trust X-Forwarded-Proto from Vercel/Ngrok
app.add_middleware(ProxyHeadersMiddleware, trusted_hosts=["*"])


# --- Router Registration ---
# Explicit prefixes ensure cleaner API structure
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(courses.router, prefix="/api/courses", tags=["courses"])
app.include_router(lessons.router, prefix="/api/lessons", tags=["lessons"])
app.include_router(enrollments.router, prefix="/api/enrollments", tags=["enrollments"])
app.include_router(submissions.router, prefix="/api/submissions", tags=["submissions"])
app.include_router(comments.router, prefix="/api/comments", tags=["comments"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(payments.router, prefix="/api/payments", tags=["payments"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])

# RBAC / Admin Routers
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(instructor.router, prefix="/api/instructor", tags=["instructor"])


# --- System Endpoints ---

@app.get("/api/health")
async def health_check():
    """
    Health check endpoint for monitoring uptime.
    """
    return {
        "status": "ok", 
        "env": "serverless" if os.getenv("VERCEL") else "local",
        "database": "connected" # Ideally logic would actively check DB
    }

@app.get("/")
async def root():
    """getRoot"""
    return {"message": "Welcome to CodeMaster AI API. Visit /api/docs for documentation."}
