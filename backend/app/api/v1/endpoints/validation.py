from fastapi import APIRouter, Depends, HTTPException, status, Path
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

# Import the service here, where it belongs
from app.services import validation_service 

from app import schemas
from app import crud
from app.db.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User as UserModel
from app.models.media import MediaItem as MediaItemModel

router = APIRouter()

POINTS_FOR_VALIDATION_VOTE = 5

@router.post(
    "/media/{media_item_id}/validate", 
    response_model=schemas.ValidationVote,
    status_code=status.HTTP_201_CREATED,
    summary="Submit or update a validation vote for a media item"
)
async def submit_or_update_validation_vote(
    vote_in: schemas.ValidationVoteCreate,
    media_item_id: int = Path(..., description="The ID of the media item to validate."),
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    media_item = await crud.crud_media.get_media_item(db, media_item_id=media_item_id)
    if not media_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media item not found")
    
    if vote_in.vote_on_species is None and vote_in.vote_on_health is None and vote_in.comment is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one vote (species/health) or a comment must be provided.",
        )

    previous_vote = await crud.crud_validation_vote.get_vote_by_media_and_user(db, media_item_id, current_user.id)
    
    # Step 1: Create or update the vote record in the database
    vote_data = await crud.crud_validation_vote.create_or_update_validation_vote(
        db=db, media_item_id=media_item_id, user_id=current_user.id, vote_in=vote_in
    )
    
    # Step 2: After the vote is saved, call the service to re-evaluate the media item's status
    # This is the correct architectural flow.
    await validation_service.re_evaluate_media_item_validation(db=db, media_item_id=media_item_id)
    
    # Gamification Logic
    if not previous_vote: # Only award points for a brand new vote
        await crud.crud_user.add_score_and_check_badges(
            db=db, user=current_user, points=POINTS_FOR_VALIDATION_VOTE
        )

    return schemas.ValidationVote(**vote_data)

@router.get(
    "/media/{media_item_id}/validations",
    response_model=List[schemas.ValidationVote],
    summary="Get all validation votes for a media item"
)
async def get_all_validations_for_media_item(
    media_item_id: int = Path(..., description="The ID of the media item."),
    db: AsyncSession = Depends(get_db)
):
    votes = await crud.crud_validation_vote.get_votes_for_media_item(db, media_item_id=media_item_id)
    return votes

@router.get(
    "/media/{media_item_id}/validate/me",
    response_model=Optional[schemas.ValidationVote],
    summary="Get my validation vote for a media item"
)
async def get_my_validation_vote_for_media_item(
    media_item_id: int = Path(..., description="The ID of the media item."),
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    my_vote = await crud.crud_validation_vote.get_vote_by_media_and_user(db, media_item_id=media_item_id, user_id=current_user.id)
    return my_vote