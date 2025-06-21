from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional, Union
from datetime import datetime, timezone

from app.models.validation_vote import ValidationVote as ValidationVoteModel
from app.schemas.validation_vote import ValidationVoteCreate, ValidationVoteUpdate

# We remove the import of the validation service, as CRUD should not know about services.
# from app.services import validation_service  <-- REMOVED

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
) -> dict:
    existing_vote = await get_vote_by_media_and_user(db, media_item_id, user_id)

    if existing_vote:
        update_data = vote_in.model_dump(exclude_unset=True) 
        for field, value in update_data.items():
            if value is not None:
                setattr(existing_vote, field, value)
        existing_vote.updated_at = datetime.now(timezone.utc)
        db.add(existing_vote)
        await db.commit()
        await db.refresh(existing_vote)
        vote_record = existing_vote
    else:
        new_vote_data = vote_in.model_dump()
        db_vote = ValidationVoteModel(
            media_item_id=media_item_id,
            user_id=user_id,
            **new_vote_data
        )
        db.add(db_vote)
        await db.commit()
        await db.refresh(db_vote)
        vote_record = db_vote

    # Eagerly load all fields into a dict
    vote_data = {
        "id": vote_record.id,
        "media_item_id": vote_record.media_item_id,
        "user_id": vote_record.user_id,
        "vote_on_species": vote_record.vote_on_species,
        "corrected_species_name": vote_record.corrected_species_name,
        "vote_on_health": vote_record.vote_on_health,
        "corrected_health_status": vote_record.corrected_health_status,
        "comment": vote_record.comment,
        "created_at": vote_record.created_at,
        "updated_at": vote_record.updated_at,
    }
    return vote_data

async def delete_validation_vote(db: AsyncSession, vote_id: int) -> Optional[ValidationVoteModel]:
    db_vote = await get_validation_vote(db, vote_id)
    if db_vote:
        # Note: The re-evaluation call will now be handled in the endpoint that calls this.
        await db.delete(db_vote)
        await db.commit()
        return db_vote
    return None