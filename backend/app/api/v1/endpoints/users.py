"""User profile endpoint."""
from fastapi import APIRouter
from app.core.deps import CurrentUser, DBSession
from app.schemas.schemas import UserResponse, UserUpdate

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: CurrentUser):
    return current_user


@router.patch("/me", response_model=UserResponse)
async def update_me(payload: UserUpdate, current_user: CurrentUser, db: DBSession):
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(current_user, field, value)
    await db.flush()
    await db.refresh(current_user)
    return current_user
