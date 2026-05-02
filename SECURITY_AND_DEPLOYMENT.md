# Security Audit & Deployment Guide
## AI Career Assistant Platform

---

## ✅ Security Audit Results

### What's Already Secured

| Area | Status | Detail |
|---|---|---|
| Password hashing | ✅ Secure | bcrypt with salt — industry standard |
| JWT authentication | ✅ Secure | Access (24h) + Refresh (30d) tokens |
| SQL injection | ✅ Protected | SQLAlchemy ORM — no raw queries |
| File upload validation | ✅ Secure | Type + size checked before parsing |
| CORS | ✅ Configured | Restricted to explicit origins only |
| Input validation | ✅ Secure | Pydantic enforces all field constraints |
| Auth on all routes | ✅ Complete | Every protected endpoint uses CurrentUser |
| Secrets in env vars | ✅ Correct | No hardcoded secrets in code |
| User data isolation | ✅ Secure | All queries filter by user_id |

### Issues Fixed in This Audit

| Issue | Severity | Fix Applied |
|---|---|---|
| Refresh token in query param | 🔴 High | Moved to request body (never in URL logs) |
| API docs exposed in production | 🟡 Medium | Hidden when DEBUG=false |
| CORS using wildcard methods/headers | 🟡 Medium | Restricted to specific methods/headers |
| Missing `lifespan` param in FastAPI | 🟡 Medium | Added properly |

### Remaining Recommendations (Post-MVP)

| Issue | Severity | Recommendation |
|---|---|---|
| No API rate limiting | 🟡 Medium | Add `slowapi` library — 10 req/min per user |
| Resume files in /tmp | 🟡 Medium | Use S3/Cloudflare R2 in production |
| No email verification | 🟡 Medium | Add SendGrid verification on register |
| No HTTPS enforcement | 🟡 Medium | Handled by your hosting provider's proxy |
| No request logging | 🟢 Low | Add structured logging with `loguru` |
| No CSP headers | 🟢 Low | Add via nginx or hosting provider |

---

## 🚀 Deployment Recommendations

These are ranked by **easiest for a portfolio project** to **most production-ready**.

---

### Option 1 — Railway (⭐ Best for Portfolios)
**Cost:** Free tier available, ~$5/month for always-on  
**Difficulty:** ⭐ Easiest  
**Why:** Deploy directly from GitHub, automatic SSL, PostgreSQL included

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. From project root
railway init
railway up

# 4. Add PostgreSQL
railway add postgresql

# 5. Set environment variables in Railway dashboard:
#    GEMINI_API_KEY, SECRET_KEY, DEBUG=false
#    ALLOWED_ORIGINS=https://your-frontend.up.railway.app
```

**Architecture on Railway:**
```
GitHub Push → Railway builds → 3 services:
  - frontend (Next.js)  → https://careerAI.up.railway.app
  - backend  (FastAPI)  → https://api-careerAI.up.railway.app  
  - database (Postgres) → internal connection
```

---

### Option 2 — Render (Free Tier Available)
**Cost:** Free (spins down after inactivity), $7/month to stay awake  
**Difficulty:** ⭐⭐ Easy  
**Why:** Good free tier, GitHub integration, managed PostgreSQL

Steps:
1. Push to GitHub
2. Go to https://render.com → New → Web Service
3. Connect your GitHub repo
4. Create 2 services: one for backend, one for frontend
5. Add PostgreSQL from Render dashboard
6. Set env vars in the dashboard

---

### Option 3 — Fly.io (Best Performance/Price)
**Cost:** ~$3-8/month total  
**Difficulty:** ⭐⭐⭐ Medium  
**Why:** Docker-native, runs your exact docker-compose setup, great performance

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Deploy backend
cd backend
fly launch
fly secrets set GEMINI_API_KEY=your_key SECRET_KEY=your_secret

# Deploy frontend  
cd ../frontend
fly launch

# Deploy Postgres
fly postgres create
fly postgres attach --app your-backend-app
```

---

### Option 4 — VPS (DigitalOcean / Hetzner)
**Cost:** $6-12/month (Hetzner cheapest at €3.29/month)  
**Difficulty:** ⭐⭐⭐⭐ Advanced  
**Why:** Full control, best for resume — shows DevOps skills

```bash
# 1. Create a $6 droplet on DigitalOcean (Ubuntu 24.04)

# 2. SSH in and install Docker
ssh root@your-ip
curl -fsSL https://get.docker.com | sh

# 3. Clone your repo
git clone https://github.com/yourname/ai-career-assistant
cd ai-career-assistant

# 4. Create production .env
cp .env.example .env
nano .env  # fill in real values

# 5. Add nginx for HTTPS (recommended)
# Use Caddy - automatically handles SSL certificates
apt install caddy

# Caddyfile:
# yourdomain.com {
#   reverse_proxy localhost:3001
# }
# api.yourdomain.com {
#   reverse_proxy localhost:8000
# }

# 6. Start everything
docker compose up -d

# 7. Point your domain DNS to the server IP
```

---

## 📋 Pre-Deployment Checklist

Before making it public, complete this checklist:

### Environment Variables (Production .env)
```env
# Generate a real secret: python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY=<64-char-random-string>

# Set to false in production
DEBUG=false

# Your actual domain
ALLOWED_ORIGINS=["https://yourdomain.com"]
ALLOWED_HOSTS=["yourdomain.com","api.yourdomain.com"]

# Use your production DB URL
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/career_assistant

# Your Gemini key
GEMINI_API_KEY=AIzaSy...
```

### GitHub Repository Setup
```bash
# Never commit .env - verify it's ignored
git status  # .env should NOT appear

# Add a demo account note in README
# Add screenshots to README
# Tag a v1.0.0 release
git tag v1.0.0
git push origin v1.0.0
```

### README for Employers
Make sure your README includes:
- Live demo link
- Screenshots/GIF of the app working
- Tech stack badges
- Architecture diagram
- Setup instructions
- Your contact info

---

## 🏆 My Recommendation for Your Portfolio

**Use Railway** to deploy it. Here's why:

1. It reads your `docker-compose.yml` directly
2. Free tier is enough to show employers
3. You get a public URL instantly: `https://ai-career-assistant.up.railway.app`
4. It demonstrates you know cloud deployment
5. If it gets traffic, upgrade to $5/month

**Then add to your GitHub README:**
- A "Live Demo" badge linking to Railway URL
- Screenshots of the dashboard, resume analyzer, and AI chat
- A brief video walkthrough (record with Loom, free)

Employers searching your GitHub will see a live, working AI SaaS product — 
which is significantly more impressive than just code.
