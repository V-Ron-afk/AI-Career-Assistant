"""Dashboard stats endpoint: aggregated user metrics."""

from fastapi import APIRouter
from sqlalchemy import select, func, desc

from app.core.deps import CurrentUser, DBSession
from app.models.models import Resume, AnalysisResult, JobDescription, PortfolioReview, AnalysisType
from app.schemas.schemas import DashboardStats

router = APIRouter()


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(current_user: CurrentUser, db: DBSession):
    """Return aggregated stats for the user dashboard."""
    uid = current_user.id

    # Counts
    resume_count = await db.scalar(select(func.count()).where(Resume.user_id == uid))
    analysis_count = await db.scalar(select(func.count()).where(AnalysisResult.user_id == uid))
    job_count = await db.scalar(select(func.count()).where(JobDescription.user_id == uid))

    # Latest ATS score
    latest_analysis = await db.execute(
        select(AnalysisResult)
        .where(AnalysisResult.user_id == uid, AnalysisResult.analysis_type == AnalysisType.RESUME_ANALYSIS)
        .order_by(desc(AnalysisResult.created_at))
        .limit(1)
    )
    latest_a = latest_analysis.scalar_one_or_none()

    # Latest job match score
    latest_job = await db.execute(
        select(JobDescription).where(JobDescription.user_id == uid).order_by(desc(JobDescription.created_at)).limit(1)
    )
    latest_j = latest_job.scalar_one_or_none()

    # Recent 5 analyses
    recent_result = await db.execute(
        select(AnalysisResult).where(AnalysisResult.user_id == uid).order_by(desc(AnalysisResult.created_at)).limit(5)
    )
    recent = [
        {
            "id": str(a.id),
            "type": a.analysis_type,
            "score": a.ats_score or a.overall_score,
            "created_at": a.created_at.isoformat(),
        }
        for a in recent_result.scalars().all()
    ]

    return DashboardStats(
        total_resumes=resume_count or 0,
        total_analyses=analysis_count or 0,
        total_job_matches=job_count or 0,
        latest_ats_score=latest_a.ats_score if latest_a else None,
        latest_match_score=latest_j.match_score if latest_j else None,
        recent_analyses=recent,
    )
