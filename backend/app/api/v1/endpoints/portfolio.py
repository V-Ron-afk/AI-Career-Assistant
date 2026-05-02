"""Portfolio review endpoints."""

import uuid
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select, desc

from app.core.deps import CurrentUser, DBSession
from app.models.models import PortfolioReview, AnalysisType
from app.schemas.schemas import PortfolioReviewRequest, PortfolioReviewResponse
from app.ai.gemini_service import gemini_service

router = APIRouter()


@router.post("/review", response_model=PortfolioReviewResponse, status_code=status.HTTP_201_CREATED)
async def review_portfolio(payload: PortfolioReviewRequest, current_user: CurrentUser, db: DBSession):
    """Analyze a GitHub portfolio or project description with AI."""
    review_data = await gemini_service.review_portfolio(payload.github_url, payload.project_description)

    review = PortfolioReview(
        user_id=current_user.id,
        github_url=payload.github_url,
        project_description=payload.project_description,
        review_data=review_data,
        overall_score=review_data.get("overall_score", 0),
    )
    db.add(review)
    await db.flush()
    await db.refresh(review)

    return PortfolioReviewResponse(
        review_id=review.id,
        overall_score=review.overall_score,
        result_data=review_data,
        created_at=review.created_at,
    )


@router.get("/history")
async def portfolio_history(current_user: CurrentUser, db: DBSession):
    """List all past portfolio reviews."""
    result = await db.execute(
        select(PortfolioReview)
        .where(PortfolioReview.user_id == current_user.id)
        .order_by(desc(PortfolioReview.created_at))
        .limit(10)
    )
    reviews = result.scalars().all()
    return [
        {"id": str(r.id), "github_url": r.github_url, "overall_score": r.overall_score,
         "created_at": r.created_at.isoformat()}
        for r in reviews
    ]
