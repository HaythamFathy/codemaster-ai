# CodeMaster AI - Full Stack Education Platform

A modern, gamified coding education platform built with Next.js and FastAPI.

## Project Structure
- **frontend/**: Next.js 14 (App Router), TypeScript, Tailwind CSS.
- **backend/**: FastAPI, SQLAlchemy, Docker (optional).

## 🚀 Deployment Guide

### Phase 1: Backend (Render.com)
1.  **Create a Web Service** on Render.
2.  **Connect your Repo** and select the `backend` folder as the Root Directory.
3.  **Build Command:** `pip install -r requirements.txt`
4.  **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5.  **Environment Variables:**

| Variable | Value / Description |
| :--- | :--- |
| `PYTHON_VERSION` | `3.10.0` (Recommended) |
| `SECRET_KEY` | Generate a random strong string (e.g., `openssl rand -hex 32`) |
| `ALGORITHM` | `HS256` |
| `GOOGLE_CLIENT_ID` | Your OAuth2 Client ID from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Your OAuth2 Client Secret |
| `ALLOWED_ORIGINS` | `https://your-frontend-project.vercel.app` (Once deployed) or `*` for testing |
| `EXECUTION_MODE` | `unsafe_local` (REQUIRED for Free Tier / No Docker) |
| `DATABASE_URL` | Render will provide this if you add a Postgres DB, or use SQLite for testing. |

### Phase 2: Frontend (Vercel)
1.  **Import Project** on Vercel.
2.  **Select Directory:** Choose `frontend` as the root.
3.  **Build Command:** `next build` (Default)
4.  **Environment Variables:**

| Variable | Value / Description |
| :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://your-backend-service.onrender.com` (The URL from Phase 1) |

## 🛠 Local Development

### Backend
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
python seed_db.py  # Initialize DB
uvicorn app.main:app --reload
```
*Runs on http://localhost:8000*

### Frontend
```bash
cd frontend
npm install
npm run dev
```
*Runs on http://localhost:3000*

## 🧪 Testing
- **Admin User:** `admin@codemaster.com` / `admin123`
- **Student User:** `student@codemaster.com` / `password123`
