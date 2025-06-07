# E:\Marine_life\backend\app\api\v1\endpoints\gamification.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession  # For async DB operations (not used directly)
from typing import List  # For type hinting (not used directly)

from app import schemas            # For schemas.User
from app import crud              # For accessing CRUD operations (e.g., crud_user)
from app.db.database import get_db  # For DB session (not used directly)
from app.core.security import get_current_active_user  # To retrieve current user
from app.models.user import User as UserModel  # SQLAlchemy model for User

router = APIRouter()

@router.get(
    "/me",  # This path is relative to the router's prefix (/gamification)
    response_model=schemas.User,  # Returns full user schema including score/badges
    summary="Get current user's gamification data",
    description="Retrieves the current user's score and earned badges."
)
async def get_my_gamification_data(
    current_user: UserModel = Depends(get_current_active_user)
):
    """
    Get the score and badges for the currently authenticated user.
    """
    # The current_user object (SQLAlchemy model) already has score and earned_badges loaded.
    # FastAPI's response_model=schemas.User will automatically serialize these.
    return current_user
