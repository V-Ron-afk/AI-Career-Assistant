"""API v1 router: assembles all endpoint modules."""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, users, resumes, jobs, portfolio, interview, chat, dashboard

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(resumes.router, prefix="/resumes", tags=["Resumes"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["Job Matching"])
api_router.include_router(portfolio.router, prefix="/portfolio", tags=["Portfolio"])
api_router.include_router(interview.router, prefix="/interview", tags=["Interview Prep"])
api_router.include_router(chat.router, prefix="/chat", tags=["AI Chat"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
