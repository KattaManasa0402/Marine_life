from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional

from app.models.user import User as UserModel
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash

async def get_user_by_username(db: AsyncSession, username: str) -> Optional[UserModel]:
    result = await db.execute(select(UserModel).filter(UserModel.username == username))
    return result.scalar_one_or_none()

async def get_user_by_email(db: AsyncSession, email: str) -> Optional[UserModel]:
    result = await db.execute(select(UserModel).filter(UserModel.email == email))
    return result.scalar_one_or_none()

async def create_user(db: AsyncSession, user_in: UserCreate) -> UserModel:
    hashed_password = get_password_hash(user_in.password)
    db_user = UserModel(email=user_in.email, username=user_in.username, hashed_password=hashed_password)
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

# --- NEW FUNCTION TO FIX THE BUG ---
async def update_user(db: AsyncSession, db_user: UserModel, user_in: UserUpdate) -> UserModel:
    """
    Update a user's details in the database.
    """
    # Get a dictionary of the fields that were actually provided by the user
    update_data = user_in.model_dump(exclude_unset=True)

    # If the user is updating their password, we need to hash it first
    if "password" in update_data and update_data["password"]:
        hashed_password = get_password_hash(update_data["password"])
        db_user.hashed_password = hashed_password
        del update_data["password"]  # Remove password from dict to avoid setting it directly

    # Update the rest of the fields
    for field, value in update_data.items():
        setattr(db_user, field, value)

    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user
# --- END NEW FUNCTION ---

async def add_score_and_check_badges(db: AsyncSession, user: UserModel, points: int) -> UserModel:
    await db.refresh(user)
    
    user.score += points

    BADGE_THRESHOLDS = {
        "Ocean Explorer": 10,
        "Marine Scientist I": 50,
        "Deep Sea Diver": 100,
    }

    new_badges = list(user.earned_badges)
    made_change = False

    for badge, threshold in BADGE_THRESHOLDS.items():
        if user.score >= threshold and badge not in new_badges:
            new_badges.append(badge)
            made_change = True
    
    if made_change:
        user.earned_badges = new_badges

    try:
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user
    except Exception as e:
        await db.rollback()
        raise Exception(f"Failed to update user score: {str(e)}") from e