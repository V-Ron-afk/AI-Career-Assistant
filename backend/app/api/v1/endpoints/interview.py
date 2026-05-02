"""Interview preparation endpoints."""

import uuid
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.core.deps import CurrentUser, DBSession
from app.models.models import Resume, AnalysisResult, AnalysisType
from app.schemas.schemas import InterviewPrepRequest, InterviewPrepResponse
from app.ai.gemini_service import gemini_service

router = APIRouter()


@router.post("/generate", response_model=InterviewPrepResponse, status_code=status.HTTP_201_CREATED)
async def generate_interview_prep(
    payload: InterviewPrepRequest, current_user: CurrentUser, db: DBSession
):
    """Generate personalized interview questions from resume."""
    result = await db.execute(
        select(Resume).where(Resume.id == payload.resume_id, Resume.user_id == current_user.id)
    )
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found.")

    prep_data = await gemini_service.generate_interview_prep(resume.raw_text)

    analysis = AnalysisResult(
        user_id=current_user.id,
        resume_id=resume.id,
        analysis_type=AnalysisType.INTERVIEW_PREP,
        result_data=prep_data,
    )
    db.add(analysis)
    await db.flush()
    await db.refresh(analysis)

    return InterviewPrepResponse(
        analysis_id=analysis.id,
        result_data=prep_data,
        created_at=analysis.created_at,
    )
