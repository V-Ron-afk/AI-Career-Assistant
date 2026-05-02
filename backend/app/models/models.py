"""
SQLAlchemy ORM models for the AI Career Assistant Platform.
All models include created_at/updated_at audit timestamps.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    String, Text, Integer, Float, Boolean, DateTime,
    ForeignKey, JSON
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


def utcnow():
    return datetime.now(timezone.utc)


# Use plain string constants instead of SAEnum to avoid PostgreSQL type casting issues
class AnalysisType:
    RESUME_ANALYSIS  = "resume_analysis"
    JOB_MATCH        = "job_match"
    RESUME_REWRITE   = "resume_rewrite"
    PORTFOLIO_REVIEW = "portfolio_review"
    INTERVIEW_PREP   = "interview_prep"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    target_role: Mapped[str | None] = mapped_column(String(255), nullable=True)
    target_industry: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    resumes: Mapped[list["Resume"]] = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    analyses: Mapped[list["AnalysisResult"]] = relationship("AnalysisResult", back_populates="user", cascade="all, delete-orphan")
    job_descriptions: Mapped[list["JobDescription"]] = relationship("JobDescription", back_populates="user", cascade="all, delete-orphan")
    portfolio_reviews: Mapped[list["PortfolioReview"]] = relationship("PortfolioReview", back_populates="user", cascade="all, delete-orphan")
    chat_sessions: Mapped[list["ChatSession"]] = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")


class Resume(Base):
    __tablename__ = "resumes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    parsed_content: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    raw_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    version: Mapped[int] = mapped_column(Integer, default=1)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    user: Mapped["User"] = relationship("User", back_populates="resumes")
    analyses: Mapped[list["AnalysisResult"]] = relationship("AnalysisResult", back_populates="resume")


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    resume_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("resumes.id", ondelete="SET NULL"), nullable=True)
    analysis_type: Mapped[str] = mapped_column(String(50), nullable=False)
    ats_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    overall_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    result_data: Mapped[dict] = mapped_column(JSON, nullable=False)
    tokens_used: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    user: Mapped["User"] = relationship("User", back_populates="analyses")
    resume: Mapped["Resume"] = relationship("Resume", back_populates="analyses")


class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    company_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    job_title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    match_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    match_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    user: Mapped["User"] = relationship("User", back_populates="job_descriptions")


class PortfolioReview(Base):
    __tablename__ = "portfolio_reviews"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    github_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    project_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    review_data: Mapped[dict] = mapped_column(JSON, nullable=False)
    overall_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    user: Mapped["User"] = relationship("User", back_populates="portfolio_reviews")


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), default="Career Advice Session")
    messages: Mapped[list] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    user: Mapped["User"] = relationship("User", back_populates="chat_sessions")