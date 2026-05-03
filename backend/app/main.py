"""
AI Career Assistant Platform - FastAPI Backend
Production-ready REST API with JWT auth and Gemini AI integration
"""

import logging
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from app.core.config import settings
from app.db.session import engine
from app.db.base import Base
from app.api.v1.router import api_router

logging.basicConfig(
    stream=sys.stderr,
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    logger.info("Application starting up — creating database tables...")
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created (or already exist). App is ready to accept requests.")
    except Exception as exc:
        logger.error("Failed to create database tables during startup: %s", exc, exc_info=True)
        # Re-raise so uvicorn marks the startup as failed rather than silently
        # serving requests against a broken database state.
        raise
    yield
    logger.info("Application shutting down — disposing database engine.")
    await engine.dispose()


# Hide API docs in production
app = FastAPI(
    title="AI Career Assistant Platform",
    description="AI-powered platform for resume analysis, job matching, and career growth",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs" if settings.DEBUG else None,
    redoc_url="/api/redoc" if settings.DEBUG else None,
    openapi_url="/api/openapi.json" if settings.DEBUG else None,
)

# CORS — only allow configured origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)

# Security
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS,
)

# Mount API router
app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    logger.info("Health check endpoint hit — app is responding to requests.")
    return {"status": "healthy", "version": "1.0.0"}