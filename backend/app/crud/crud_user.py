from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from app.models.user import User as UserModel
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash

async def get_user_by_username(db: AsyncSession, username: str) -> Optional[UserModel]:
    result = await db.execute(select(UserModel).filter(UserModel.username == username))
    return result.scalar_one_or_none()

async def create_user(db: AsyncSession, user_in: UserCreate) -> UserModel:
    hashed_password = get_password_hash(user_in.password)
    db_user = UserModel(email=user_in.email, username=user_in.username, hashed_password=hashed_password)
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def add_score_and_check_badges(db: AsyncSession, user: UserModel, points: int) -> UserModel:
    # Add the points to the user's score
    user.score += points

    # Define the badge thresholds
    BADGE_THRESHOLDS = {
        "Ocean Explorer": 10,
        "Marine Scientist I": 50,
        "Deep Sea Diver": 100,
    }

    # ===================== THE FIX IS HERE =====================
    # Create a copy of the existing badges list to modify
    new_badges = list(user.earned_badges)
    made_change = False

    for badge, threshold in BADGE_THRESHOLDS.items():
        # Check if the user has reached the score threshold AND doesn't already have the badge
        if user.score >= threshold and badge not in new_badges:
            new_badges.append(badge)
            made_change = True

    # If we added any new badges, we re-assign the list to the user's earned_badges.
    # This reassignment reliably tells SQLAlchemy that the field has changed.
    if made_change:
        user.earned_badges = new_badges
    # =========================================================

    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user