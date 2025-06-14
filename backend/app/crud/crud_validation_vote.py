from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional, Union
from datetime import datetime, timezone
from app.models.validation_vote import ValidationVote as ValidationVoteModel
from app.schemas.validation_vote import ValidationVoteCreate, ValidationVoteUpdate

async def get_vote_by_media_and_user(
    db: AsyncSession, media_item_id: int, user_id: int
) -> Optional[ValidationVoteModel]:
    result = await db.execute(
        select(ValidationVoteModel)
        .filter(ValidationVoteModel.media_item_id == media_item_id)
        .filter(ValidationVoteModel.user_id == user_id)
    )
    return result.scalar_one_or_none()

async def get_validation_vote(db: AsyncSession, vote_id: int) -> Optional[ValidationVoteModel]:
    result = await db.execute(select(ValidationVoteModel).filter(ValidationVoteModel.id == vote_id))
    return result.scalar_one_or_none()

async def get_votes_for_media_item(
    db: AsyncSession, media_item_id: int, skip: int = 0, limit: int = 100
) -> List[ValidationVoteModel]:
    result = await db.execute(
        select(ValidationVoteModel)
        .filter(ValidationVoteModel.media_item_id == media_item_id)
        .offset(skip)
        .limit(limit)
        .order_by(ValidationVoteModel.created_at.desc())
    )
    return result.scalars().all()

async def create_or_update_validation_vote(
    db: AsyncSession, 
    media_item_id: int, 
    user_id: int, 
    vote_in: Union[ValidationVoteCreate, ValidationVoteUpdate]
) -> ValidationVoteModel:
    existing_vote = await get_vote_by_media_and_user(db, media_item_id, user_id)

    if existing_vote:
        print(f"Updating existing vote for user {user_id} on media item {media_item_id}")
        update_data = vote_in.model_dump(exclude_unset=True) 
        
        for field, value in update_data.items():
            if value is not None:
                setattr(existing_vote, field, value)
        
        existing_vote.updated_at = datetime.now(timezone.utc)
        db.add(existing_vote)
        await db.commit()
        await db.refresh(existing_vote)
        new_or_updated_vote = existing_vote  # Capture the result before re-evaluating
    else:
        print(f"Creating new vote for user {user_id} on media item {media_item_id}")
        new_vote_data = vote_in.model_dump()
        
        db_vote = ValidationVoteModel(
            media_item_id=media_item_id,
            user_id=user_id,
            **new_vote_data
        )
        db.add(db_vote)
        await db.commit()
        await db.refresh(db_vote)
        new_or_updated_vote = db_vote  # Capture the result before re-evaluating
    
    # --- AFTER CREATING/UPDATING VOTE, TRIGGER RE-EVALUATION OF MEDIA ITEM ---
    # This needs to happen in the same session or manage transactions carefully.
    # For simplicity, we'll run it in the current session.
    await validation_service.re_evaluate_media_item_validation(db, media_item_id)
    # --- END TRIGGER ---

    return new_or_updated_vote

async def delete_validation_vote(db: AsyncSession, vote_id: int) -> Optional[ValidationVoteModel]:
    db_vote = await get_validation_vote(db, vote_id)
    if db_vote:
        media_item_id_to_re_evaluate = db_vote.media_item_id  # Get ID before deletion
        await db.delete(db_vote)
        await db.commit()
        # After deletion, re-evaluate the media item's summary
        await validation_service.re_evaluate_media_item_validation(db, media_item_id_to_re_evaluate)
        return db_vote
    return None
