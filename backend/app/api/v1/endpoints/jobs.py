"""Job matching endpoints: compare resume vs job description."""

import uuid
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select, desc

from app.core.deps import CurrentUser, DBSession
from app.models.models import Resume, JobDescription, AnalysisResult, AnalysisType
from app.schemas.schemas import JobMatchRequest, JobMatchResponse
from app.ai.gemini_service import gemini_service

router = APIRouter()


@router.post("/match", response_model=JobMatchResponse)
async def match_job(payload: JobMatchRequest, current_user: CurrentUser, db: DBSession):
    """Compare a resume against a job description and return match analysis."""
    # Fetch resume
    result = await db.execute(
        select(Resume).where(Resume.id == payload.resume_id, Resume.user_id == current_user.id)
    )
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found.")

    # Run AI match
    match_data = await gemini_service.match_job(resume.raw_text, payload.job_description)

    # Persist job description + match result
    jd = JobDescription(
        user_id=current_user.id,
        job_title=payload.job_title,
        company_name=payload.company_name,
        description=payload.job_description,
        match_score=match_data.get("match_score", 0),
        match_data=match_data,
    )
    db.add(jd)

    analysis = AnalysisResult(
        user_id=current_user.id,
        resume_id=resume.id,
        analysis_type=AnalysisType.JOB_MATCH,
        overall_score=match_data.get("match_score", 0),
        result_data=match_data,
    )
    db.add(analysis)
    await db.flush()
    await db.refresh(jd)
    await db.refresh(analysis)

    return JobMatchResponse(
        match_id=jd.id,
        match_score=jd.match_score,
        verdict=match_data.get("verdict", "unknown"),
        result_data=match_data,
        created_at=jd.created_at,
    )


@router.get("/history")
async def get_job_match_history(current_user: CurrentUser, db: DBSession):
    """List past job match analyses."""
    result = await db.execute(
        select(JobDescription)
        .where(JobDescription.user_id == current_user.id)
        .order_by(desc(JobDescription.created_at))
        .limit(20)
    )
    jobs = result.scalars().all()
    return [
        {
            "id": str(j.id),
            "job_title": j.job_title,
            "company_name": j.company_name,
            "match_score": j.match_score,
            "verdict": j.match_data.get("verdict") if j.match_data else None,
            "created_at": j.created_at.isoformat(),
        }
        for j in jobs
    ]


@router.get("/{job_id}")
async def get_job_match_detail(job_id: uuid.UUID, current_user: CurrentUser, db: DBSession):
    """Get full detail of a specific job match."""
    result = await db.execute(
        select(JobDescription).where(
            JobDescription.id == job_id, JobDescription.user_id == current_user.id
        )
    )
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job match not found.")
    return {"id": str(job.id), "job_title": job.job_title, "company_name": job.company_name,
            "match_score": job.match_score, "result_data": job.match_data, "created_at": job.created_at}
