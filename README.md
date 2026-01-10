# CodeMaster AI 🎓

CodeMaster AI is an advanced, gamified e-learning platform designed to teach Python programming through interactive lessons, AI-powered code reviews, and real-time voice tutoring.

![Project Status](https://img.shields.io/badge/Status-Beta-blue)
![Tech Stack](https://img.shields.io/badge/Stack-Next.js%2016%20%7C%20FastAPI%20%7C%20Supabase-success)

## 🏗️ Architecture & Tech Stack

We prioritized **performance, scalability, and developer experience** in our architectural choices.

### Frontend: Next.js 16 (React)
- **Why?** Next.js 16 (App Router) offers superior server-side rendering (SSR) and static site generation (SSG) capabilities, crucial for SEO and initial load performance.
- **Key Features Used**:
  - **Server Components**: Minimized client-side JavaScript bundle size.
  - **Shadcn UI + Tailwind CSS v4**: For a premium, accessible, and responsive design system.
  - **Monaco Editor**: Provides a VS Code-like experience in the browser.

### Backend: FastAPI (Python)
- **Why?** Python is the native language of AI and Data Science. FastAPI provides high-performance async capabilities (Starlette) comparable to NodeJS, while allowing seamless integration with AI libraries (OpenAI, LangChain).
- **Key Features Used**:
  - **Async/Await**: Non-blocking I/O for AI calls and Database queries.
  - **Pydantic**: Robust data validation and schema generation (shared with TypeScript types).
  - **Serverless Ready**: Designed to run as a Vercel Serverless Function (`api/index.py`).

### Database: Supabase (PostgreSQL)
- **Why?** A fully managed PostgreSQL instance that scales. It provides built-in Authentication and Row Level Security (RLS) foundations.
- **ORM**: SQLAlchemy is used for complex relation management and migrations.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Python 3.10+
- Git

### 1. Verification
Run the environment checker to ensure your `.env` file is ready.
```bash
python check_env.py
```

### 2. Backend (Terminal 1)
Start the FastAPI server.
```bash
# Activate Virtual Environment
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Run Server (Reload enabled)
uvicorn backend.app.main:app --reload --port 8000
```
*API Docs available at: http://localhost:8000/api/docs*

### 3. Frontend (Terminal 2)
Start the Next.js development server.
```bash
cd frontend
npm install
npm run dev
```
*App running at: http://localhost:3000*

---

## 🛠️ Deployment

This repository is configured as a **Monorepo** for Vercel.
- **Frontend Build**: `cd frontend && npm install && npm run build`
- **Backend Routing**: Handled via `vercel.json` rewrites to `api/index.py`.

## 🤝 Contributing
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

---
*Built with ❤️ by the CodeMaster AI Team*
