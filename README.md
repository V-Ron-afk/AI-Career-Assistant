# 🚀 AI Career Assistant Platform

> A production-ready, AI-powered career platform resume analysis, job matching, portfolio review, interview prep, and an AI career advisor. Built with Next.js, FastAPI, PostgreSQL, and Google Gemini.

---

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Browser                           │
│                   Next.js 14 (App Router)                       │
│            React + Tailwind CSS + TypeScript                    │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTP (JWT in Authorization header)
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FastAPI Backend (Python)                     │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │  API Layer  │  │ Service Layer│  │  AI Integration Layer  │  │
│  │  /api/v1/*  │→ │  Business    │→ │   GeminiAIService      │  │
│  │  JWT Auth   │  │  Logic       │  │   Structured Prompts   │  │
│  └─────────────┘  └──────────────┘  └────────────────────────┘  │
│                          │                        │             │
│                          ▼                        ▼             │
│  ┌─────────────────────────────┐    ┌────────────────────────┐  │
│  │     Database Layer          │    │  Google Gemini API     │  │
│  │  SQLAlchemy (async)         │    │  gemini-1.5-pro        │  │
│  │  PostgreSQL via asyncpg     │    │  JSON-structured output│  │
│  └─────────────────────────────┘    └────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PostgreSQL 16                              │
│  users │ resumes │ analysis_results │ job_descriptions          │
│  portfolio_reviews │ chat_sessions                              │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
ai-career-assistant/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app, CORS, lifespan
│   │   ├── api/v1/
│   │   │   ├── router.py           # Aggregates all routers
│   │   │   └── endpoints/
│   │   │       ├── auth.py         # Register, login, refresh
│   │   │       ├── users.py        # Profile management
│   │   │       ├── resumes.py      # Upload, analyze, rewrite
│   │   │       ├── jobs.py         # Job matching
│   │   │       ├── portfolio.py    # Portfolio review
│   │   │       ├── interview.py    # Interview prep
│   │   │       ├── chat.py         # AI chat sessions
│   │   │       └── dashboard.py    # Aggregated stats
│   │   ├── ai/
│   │   │   └── gemini_service.py   # All Gemini AI logic
│   │   ├── core/
│   │   │   ├── config.py           # Pydantic settings
│   │   │   ├── security.py         # JWT + bcrypt
│   │   │   └── deps.py             # FastAPI dependencies
│   │   ├── db/
│   │   │   ├── base.py             # DeclarativeBase
│   │   │   └── session.py          # Async engine + session
│   │   ├── models/models.py        # SQLAlchemy ORM models
│   │   ├── schemas/schemas.py      # Pydantic request/response
│   │   └── services/
│   │       └── resume_parser.py    # PDF/DOCX text extraction
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx          # Root layout + providers
│   │   │   ├── page.tsx            # → redirects to /dashboard
│   │   │   ├── globals.css         # Tailwind + design tokens
│   │   │   ├── auth/login/         # Login page
│   │   │   ├── auth/register/      # Register page
│   │   │   ├── dashboard/          # Main dashboard
│   │   │   ├── resume/             # Resume analyzer
│   │   │   ├── jobs/               # Job matcher
│   │   │   ├── portfolio/          # Portfolio review
│   │   │   ├── interview/          # Interview prep
│   │   │   └── chat/               # AI chat advisor
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── QueryProvider.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── ScoreRing.tsx   # Animated SVG score ring
│   │   │   │   └── StatCard.tsx    # Stat + activity cards
│   │   │   └── resume/
│   │   │       ├── ResumeUploader.tsx  # Drag-and-drop upload
│   │   │       └── AnalysisPanel.tsx   # Full analysis display
│   │   ├── hooks/useAuth.tsx        # Auth context + hook
│   │   └── lib/api.ts               # Axios client + all API calls
│   ├── tailwind.config.js
│   ├── next.config.js
│   └── Dockerfile
│
├── docker/init.sql                 # PostgreSQL schema
├── docker-compose.yml
├── .env.example
└── README.md
```
---
## 🔐 Security

- Passwords hashed with **bcrypt** (12 rounds)
- **JWT** access tokens (24h) + refresh tokens (30d)
- Auto-refresh interceptor in Axios client
- CORS restricted to configured origins
- File type + size validation before parsing
- SQL injection prevented via SQLAlchemy ORM

---

## 🗄️ Data Flow

```
User uploads PDF
    → ResumeParserService (pdfplumber/docx2txt)
    → raw_text stored in DB
    → GeminiAIService.analyze_resume(raw_text)
    → Structured JSON response (ATS score, issues, fixes)
    → AnalysisResult persisted
    → Frontend renders ScoreRing + IssueCards
```

---

## 🔧 Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| State | TanStack Query v5, React Hook Form |
| Backend | FastAPI, Python 3.12, Uvicorn |
| Auth | JWT (python-jose), bcrypt (passlib) |
| Database | PostgreSQL 16, SQLAlchemy 2 (async), asyncpg |
| AI | Google Gemini 1.5 Pro |
| Parsing | pdfplumber (PDF), docx2txt (DOCX) |
| DevOps | Docker, Docker Compose |
| UI Extras | Recharts, Framer Motion, Sonner toasts |
