"""Application configuration using Pydantic Settings."""

from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    APP_NAME: str = "AI Career Assistant"
    DEBUG: bool = False
    SECRET_KEY: str = "change-me-in-production-use-secrets-manager"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@db:5432/career_assistant"

    # Google Gemini
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"

    # CORS & Security
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001"]
    ALLOWED_HOSTS: List[str] = ["*"]

    # File Upload
    MAX_FILE_SIZE_MB: int = 10
    UPLOAD_DIR: str = "/tmp/uploads"

    # Rate limiting (requests per minute per user)
    AI_RATE_LIMIT_PER_MINUTE: int = 5

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


settings = Settings()