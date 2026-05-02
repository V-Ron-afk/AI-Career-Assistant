"""
Resume endpoints: upload, parse, AI analysis, rewrite, history.
File validation, parsing, and AI integration all handled here.
"""

import os
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, UploadFile, File, status
from sqlalchemy import select, desc

from app.core.deps import CurrentUser, DBSession
from app.core.config import settings
from app.models.models import Resume, AnalysisResult, AnalysisType
from app.schemas.schemas import ResumeResponse, ResumeAnalysisResponse, ResumeRewriteRequest
from app.services.resume_parser import resume_parser
from app.ai.gemini_service import gemini_service

router = APIRouter()

ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
}
MAX_FILE_SIZE = settings.MAX_FILE_SIZE_MB * 1024 * 1024


@router.post("/upload", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    current_user: CurrentUser,
    db: DBSession,
    file: UploadFile = File(...),
):
    """Upload a resume PDF or DOCX. Parses and stores content."""
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only PDF and DOCX files are supported.",
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum size of {settings.MAX_FILE_SIZE_MB}MB.",
        )

    # Parse text
    try:
        raw_text = resume_parser.parse(content, file.content_type)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))

    # Save file to disk
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_id = uuid.uuid4()
    ext = ".pdf" if "pdf" in file.content_type else ".docx"
    file_path = os.path.join(settings.UPLOAD_DIR, f"{file_id}{ext}")
    with open(file_path, "wb") as f:
        f.write(content)

    # Get version number
    existing = await db.execute(
        select(Resume).where(Resume.user_id == current_user.id).order_by(desc(Resume.version))
    )
    last_resume = existing.scalar_one_or_none()
    version = (last_resume.version + 1) if last_resume else 1

    resume = Resume(
        user_id=current_user.id,
        title=file.filename.rsplit(".", 1)[0],
        original_filename=file.filename,
        file_path=file_path,
        raw_text=raw_text,
        version=version,
    )
    db.add(resume)
    await db.flush()
    await db.refresh(resume)
    return resume


@router.post("/{resume_id}/analyze", response_model=ResumeAnalysisResponse)
async def analyze_resume(resume_id: uuid.UUID, current_user: CurrentUser, db: DBSession):
    """Run full AI analysis on an uploaded resume."""
    resume = await _get_user_resume(resume_id, current_user.id, db)

    result_data = await gemini_service.analyze_resume(resume.raw_text)

    analysis = AnalysisResult(
        user_id=current_user.id,
        resume_id=resume.id,
        analysis_type=AnalysisType.RESUME_ANALYSIS,
        ats_score=result_data.get("ats_score", 0),
        overall_score=result_data.get("overall_score", 0),
        result_data=result_data,
    )
    db.add(analysis)
    await db.flush()
    await db.refresh(analysis)

    return ResumeAnalysisResponse(
        analysis_id=analysis.id,
        resume_id=resume.id,
        ats_score=analysis.ats_score,
        overall_score=analysis.overall_score,
        result_data=result_data,
        created_at=analysis.created_at,
    )


@router.post("/{resume_id}/rewrite")
async def rewrite_resume(
    resume_id: uuid.UUID,
    payload: ResumeRewriteRequest,
    current_user: CurrentUser,
    db: DBSession,
):
    """AI-powered resume rewrite for a specific role and industry."""
    resume = await _get_user_resume(resume_id, current_user.id, db)

    result_data = await gemini_service.rewrite_resume(
        resume.raw_text, payload.target_role, payload.target_industry
    )

    analysis = AnalysisResult(
        user_id=current_user.id,
        resume_id=resume.id,
        analysis_type=AnalysisType.RESUME_REWRITE,
        result_data=result_data,
    )
    db.add(analysis)
    await db.flush()
    await db.refresh(analysis)

    return {"analysis_id": analysis.id, "result_data": result_data, "created_at": analysis.created_at}


@router.get("/", response_model=list[ResumeResponse])
async def list_resumes(current_user: CurrentUser, db: DBSession):
    """List all resumes for the current user."""
    result = await db.execute(
        select(Resume)
        .where(Resume.user_id == current_user.id, Resume.is_active == True)
        .order_by(desc(Resume.created_at))
    )
    return result.scalars().all()


@router.get("/{resume_id}/analyses")
async def get_resume_analyses(resume_id: uuid.UUID, current_user: CurrentUser, db: DBSession):
    """Get all analyses for a specific resume."""
    await _get_user_resume(resume_id, current_user.id, db)

    result = await db.execute(
        select(AnalysisResult)
        .where(AnalysisResult.resume_id == resume_id)
        .order_by(desc(AnalysisResult.created_at))
    )
    analyses = result.scalars().all()
    return [
        {
            "id": str(a.id),
            "type": a.analysis_type,
            "ats_score": a.ats_score,
            "overall_score": a.overall_score,
            "created_at": a.created_at.isoformat(),
        }
        for a in analyses
    ]


async def _get_user_resume(resume_id: uuid.UUID, user_id: uuid.UUID, db) -> Resume:
    """Helper: fetch resume owned by user or raise 404."""
    result = await db.execute(
        select(Resume).where(Resume.id == resume_id, Resume.user_id == user_id)
    )
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found.")
    return resume
