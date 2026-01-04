from fastapi import FastAPI
from dotenv import load_dotenv

load_dotenv() # Load environment variables

from .database import engine, Base
from .routers import auth, courses, submissions, ai

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CodeMaster AI API")

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(courses.router, prefix="/courses", tags=["courses"])
app.include_router(submissions.router, tags=["submissions"])
app.include_router(ai.router, prefix="/api", tags=["ai"])

from .routers import admin
app.include_router(admin.router, prefix="/admin", tags=["admin"])

import os

# CORS Configuration
from fastapi.middleware.cors import CORSMiddleware
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from starlette.middleware.sessions import SessionMiddleware
import os
app.add_middleware(SessionMiddleware, secret_key=os.getenv("SECRET_KEY", "supersecretkey"))

@app.get("/")
async def root():
    return {"message": "Welcome to CodeMaster AI API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
