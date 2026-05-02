# 🚀 AI Career Assistant Platform

> A production-ready, AI-powered career platform — resume analysis, job matching, portfolio review, interview prep, and an AI career advisor. Built with Next.js, FastAPI, PostgreSQL, and Google Gemini.

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
│                    FastAPI Backend (Python)                      │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │  API Layer  │  │ Service Layer│  │  AI Integration Layer  │ │
│  │  /api/v1/*  │→ │  Business    │→ │   GeminiAIService      │ │
│  │  JWT Auth   │  │  Logic       │  │   Structured Prompts   │ │
│  └─────────────┘  └──────────────┘  └────────────────────────┘ │
│                          │                        │             │
│                          ▼                        ▼             │
│  ┌─────────────────────────────┐    ┌────────────────────────┐ │
│  │     Database Layer          │    │  Google Gemini API     │ │
│  │  SQLAlchemy (async)         │    │  gemini-1.5-pro        │ │
│  │  PostgreSQL via asyncpg     │    │  JSON-structured output│ │
│  └─────────────────────────────┘    └────────────────────────┘ │
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

## ⚡ Quick Start

### Prerequisites
- Docker & Docker Compose
- Google Gemini API key → https://aistudio.google.com/app/apikey

### 1. Clone & configure

```bash
git clone <your-repo>
cd ai-career-assistant
cp .env.example .env
```

Edit `.env`:
```bash
POSTGRES_PASSWORD=your_secure_password
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Start with Docker Compose

```bash
docker compose up --build
```

Services start in order: PostgreSQL → Backend → Frontend

| Service  | URL                          |
|----------|------------------------------|
| Frontend | http://localhost:3000        |
| Backend  | http://localhost:8000        |
| API Docs | http://localhost:8000/api/docs |

### 3. Create your account

Visit http://localhost:3000/auth/register

---

## 🛠️ Local Development (without Docker)

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5432/career_assistant"
export SECRET_KEY="dev-secret-key-change-in-production"
export GEMINI_API_KEY="your_key_here"

# Start PostgreSQL (if not using Docker)
docker run -d -p 5432:5432 -e POSTGRES_DB=career_assistant \
  -e POSTGRES_PASSWORD=postgres postgres:16-alpine

# Run dev server
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local

npm run dev
```

---

## 🔌 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Create account |
| POST | `/api/v1/auth/login` | Get JWT tokens |
| POST | `/api/v1/auth/refresh` | Refresh access token |

### Resumes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/resumes/upload` | Upload PDF/DOCX |
| GET | `/api/v1/resumes/` | List user resumes |
| POST | `/api/v1/resumes/{id}/analyze` | AI full analysis |
| POST | `/api/v1/resumes/{id}/rewrite` | AI rewrite |
| GET | `/api/v1/resumes/{id}/analyses` | Analysis history |

### Job Matching
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/jobs/match` | Match resume vs JD |
| GET | `/api/v1/jobs/history` | Past matches |

### Portfolio, Interview, Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/portfolio/review` | GitHub/project review |
| POST | `/api/v1/interview/generate` | Generate questions |
| POST | `/api/v1/chat/message` | AI career advisor |
| GET | `/api/v1/dashboard/stats` | Dashboard metrics |

---

## 🧠 AI Prompting Strategy

Each Gemini call uses:
- **Low temperature (0.3)** for consistent, structured output
- **`response_mime_type: "application/json"`** to force JSON
- **Role-specific personas**: hiring manager, ATS expert, senior interviewer
- **Strict schemas** in every prompt to avoid hallucination drift
- **Contextual grounding**: every question references actual resume content

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
