"""
Pydantic schemas for all API request/response models.
Strict typing ensures clean API contracts.
"""

from datetime import datetime
from typing import Any, Optional
import uuid
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# ─── Auth Schemas ────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=8, max_length=100)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    full_name: str
    target_role: Optional[str] = None
    target_industry: Optional[str] = None
    created_at: datetime


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    target_role: Optional[str] = Field(None, max_length=100)
    target_industry: Optional[str] = Field(None, max_length=100)


# ─── Resume Schemas ───────────────────────────────────────────────────────────

class ResumeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    original_filename: str
    version: int
    created_at: datetime


class ResumeAnalysisResponse(BaseModel):
    analysis_id: uuid.UUID
    resume_id: uuid.UUID
    ats_score: float
    overall_score: float
    result_data: dict[str, Any]
    created_at: datetime


# ─── Job Match Schemas ────────────────────────────────────────────────────────

class JobMatchRequest(BaseModel):
    resume_id: uuid.UUID
    job_title: str = Field(..., min_length=2, max_length=200)
    company_name: Optional[str] = Field(None, max_length=200)
    job_description: str = Field(..., min_length=50)


class JobMatchResponse(BaseModel):
    match_id: uuid.UUID
    match_score: float
    verdict: str
    result_data: dict[str, Any]
    created_at: datetime


# ─── Resume Rewrite Schemas ───────────────────────────────────────────────────

class ResumeRewriteRequest(BaseModel):
    resume_id: uuid.UUID
    target_role: str = Field(..., min_length=2, max_length=200)
    target_industry: str = Field(..., min_length=2, max_length=200)


# ─── Portfolio Review Schemas ─────────────────────────────────────────────────

class PortfolioReviewRequest(BaseModel):
    github_url: Optional[str] = Field(None, max_length=500)
    project_description: Optional[str] = Field(None, min_length=50)

    def model_post_init(self, __context):
        if not self.github_url and not self.project_description:
            raise ValueError("Provide either github_url or project_description")


class PortfolioReviewResponse(BaseModel):
    review_id: uuid.UUID
    overall_score: float
    result_data: dict[str, Any]
    created_at: datetime


# ─── Interview Prep Schemas ───────────────────────────────────────────────────

class InterviewPrepRequest(BaseModel):
    resume_id: uuid.UUID


class InterviewPrepResponse(BaseModel):
    analysis_id: uuid.UUID
    result_data: dict[str, Any]
    created_at: datetime


# ─── Chat Schemas ─────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str = Field(..., min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    session_id: Optional[uuid.UUID] = None
    message: str = Field(..., min_length=1, max_length=4000)


class ChatResponse(BaseModel):
    session_id: uuid.UUID
    response: str
    created_at: datetime


# ─── Dashboard Schema ─────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_resumes: int
    total_analyses: int
    total_job_matches: int
    latest_ats_score: Optional[float]
    latest_match_score: Optional[float]
    recent_analyses: list[dict[str, Any]]
