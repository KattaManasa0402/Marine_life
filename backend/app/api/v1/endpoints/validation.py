from fastapi import APIRouter, Depends, HTTPException, status, Path
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app import schemas # For validation_vote schemas
from app import crud    # For crud_validation_vote and crud_media
from app.db.database import get_db # DB session dependency
from app.core.security import get_current_active_user # Authentication
from app.models.user import User as UserModel # To get current_user ID
from app.models.media import MediaItem as MediaItemModel # To verify media_item_id

router = APIRouter()

# --- Points Configuration ---
POINTS_FOR_VALIDATION_VOTE = 5 # Points for submitting a vote
POINTS_FOR_CONSENSUS_CONTRIBUTION = 20 # Bonus points if your vote contributes to consensus
# --- END Points Configuration ---

@router.post(
    "/media/{media_item_id}/validate", 
    response_model=schemas.ValidationVote,
    status_code=status.HTTP_201_CREATED, # For new vote
    summary="Submit or update a validation vote for a media item",
    description="Allows an authenticated user to submit a new validation vote or update an existing one for a specific media item. If a vote from this user for this media item already exists, it will be updated."
)
async def submit_or_update_validation_vote(
    vote_in: schemas.ValidationVoteCreate, # Schema for the vote data
    media_item_id: int = Path(..., description="The ID of the media item to validate."),
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user) # <--- TYPO CORRECTED HERE
):
    media_item = await crud.crud_media.get_media_item(db, media_item_id=media_item_id)
    if not media_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Media item not found"
        )
    
    if vote_in.vote_on_species is None and vote_in.corrected_species_name is None and \
       vote_in.vote_on_health is None and vote_in.corrected_health_status is None and \
       vote_in.comment is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one vote (species/health) or a comment must be provided.",
        )

    # Check previous vote state for this user to award points correctly (avoid re-awarding on simple update)
    previous_vote = await crud.crud_validation_vote.get_vote_by_media_and_user(db, media_item_id, current_user.id)
    
    vote_record = await crud.crud_validation_vote.create_or_update_validation_vote(
        db=db, media_item_id=media_item_id, user_id=current_user.id, vote_in=vote_in
    )
    
    # --- ADD GAMIFICATION LOGIC FOR VALIDATION ---
    if not previous_vote: # Only award base points if it's a new vote
        await crud.crud_user.add_score_and_check_badges(
            db=db, user=current_user, points=POINTS_FOR_VALIDATION_VOTE
        )
        print(f"User {current_user.username} awarded {POINTS_FOR_VALIDATION_VOTE} points for submitting a new vote.")

    # Check for bonus points if this vote contributed to consensus
    # This logic would be more complex and ideally run after re_evaluate_media_item_validation fully commits
    # For now, we'll just award base points for submission.
    # If you want actual consensus-based bonuses, you'd trigger a check
    # after the validation_service.re_evaluate_media_item_validation completes its commit.
    # --- END GAMIFICATION LOGIC ---

    return vote_record

# --- Optional: Get all votes for a media item (existing) ---
@router.get(
    "/media/{media_item_id}/validations",
    response_model=List[schemas.ValidationVote],
    summary="Get all validation votes for a media item",
    description="Retrieves a list of all validation votes for a specific media item. Can be restricted to admins or only show aggregated data."
)
async def get_all_validations_for_media_item(
    media_item_id: int = Path(..., description="The ID of the media item."),
    db: AsyncSession = Depends(get_db)
):
    media_item = await crud.crud_media.get_media_item(db, media_item_id=media_item_id)
    if not media_item: raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media item not found")
    validation_votes = await crud.crud_validation_vote.get_votes_for_media_item(db, media_item_id=media_item_id)
    return validation_votes

# --- Optional: Get a user's specific vote for a media item (existing) ---
@router.get(
    "/media/{media_item_id}/validate/me",
    response_model=Optional[schemas.ValidationVote],
    summary="Get my validation vote for a media item",
    description="Retrieves the authenticated user's specific validation vote for a given media item, if one exists."
)
async def get_my_validation_vote_for_media_item(
    media_item_id: int = Path(..., description="The ID of the media item."),
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    media_item = await crud.crud_media.get_media_item(db, media_item_id=media_item_id)
    if not media_item: raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media item not found")
    my_vote = await crud.crud_validation_vote.get_vote_by_media_and_user(db, media_item_id=media_item_id, user_id=current_user.id)
    return my_vote