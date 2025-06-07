from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Dict, Any, Optional
from collections import Counter  # For counting votes

from app.models.media import MediaItem as MediaItemModel
from app.models.validation_vote import ValidationVote as ValidationVoteModel
from app.crud import crud_media  # To update MediaItem
from app.schemas import media as schemas  # Import schemas for MediaItemUpdate
from app.schemas.validation_vote import ValidationVoteCreate  # For type hinting

# --- Constants for Validation Logic ---
CONFIRM_VOTE_VALUE = 1
DISPUTE_VOTE_VALUE = -1
# Threshold for consensus (e.g., if validation_score > 3, it's validated)
CONSENSUS_THRESHOLD = 3


async def re_evaluate_media_item_validation(
    db: AsyncSession, media_item_id: int
) -> Optional[MediaItemModel]:
    """
    Re-evaluates the crowdsourced validation summary fields for a given MediaItem
    based on all associated ValidationVote records.

    Args:
        db: The asynchronous database session.
        media_item_id: The ID of the MediaItem to re-evaluate.

    Returns:
        The updated MediaItemModel instance, or None if not found.
    """
    # 1. Retrieve the MediaItem
    media_item = await crud_media.get_media_item(db, media_item_id)
    if not media_item:
        print(f"Validation Service: MediaItem {media_item_id} not found for re-evaluation.")
        return None

    # 2. Retrieve all validation votes for this MediaItem
    votes_for_item = await db.execute(
        select(ValidationVoteModel).filter(ValidationVoteModel.media_item_id == media_item_id)
    )
    all_votes = votes_for_item.scalars().all()

    # Initialize summary variables
    total_validation_score = 0
    species_confirm_counts: Dict[str, int] = {}  # Counts confirms for AI guess
    species_dispute_corrections: Dict[str, int] = {}  # Counts corrected species names

    health_confirm_counts: Dict[str, int] = {}  # Counts confirms for AI guess
    health_dispute_corrections: Dict[str, int] = {}  # Counts corrected health statuses

    # 3. Process all votes
    for vote in all_votes:
        # Process species vote
        if vote.vote_on_species is True:  # User confirms AI species
            if media_item.species_ai_prediction:
                species_confirm_counts[media_item.species_ai_prediction] = (
                    species_confirm_counts.get(media_item.species_ai_prediction, 0) + CONFIRM_VOTE_VALUE
                )
            total_validation_score += CONFIRM_VOTE_VALUE  # Add to overall score
        elif vote.vote_on_species is False and vote.corrected_species_name:  # User disputes and corrects
            species_dispute_corrections[vote.corrected_species_name] = (
                species_dispute_corrections.get(vote.corrected_species_name, 0) + CONFIRM_VOTE_VALUE
            )
            total_validation_score += DISPUTE_VOTE_VALUE  # Disputing reduces score

        # Process health vote
        if vote.vote_on_health is True:  # User confirms AI health
            if media_item.health_status_ai_prediction:
                health_confirm_counts[media_item.health_status_ai_prediction] = (
                    health_confirm_counts.get(media_item.health_status_ai_prediction, 0) + CONFIRM_VOTE_VALUE
                )
            total_validation_score += CONFIRM_VOTE_VALUE  # Add to overall score
        elif vote.vote_on_health is False and vote.corrected_health_status:  # User disputes and corrects
            health_dispute_corrections[vote.corrected_health_status] = (
                health_dispute_corrections.get(vote.corrected_health_status, 0) + CONFIRM_VOTE_VALUE
            )
            total_validation_score += DISPUTE_VOTE_VALUE  # Disputing reduces score

    # 4. Determine Consensus (Simplistic Logic)
    final_validated_species: Optional[str] = None
    final_validated_health: Optional[str] = None
    is_validated = False

    # Species Consensus:
    if (
        media_item.species_ai_prediction
        and species_confirm_counts.get(media_item.species_ai_prediction, 0) >= CONSENSUS_THRESHOLD
    ):
        final_validated_species = media_item.species_ai_prediction
        is_validated = True
    else:
        most_common_corrected_species = Counter(species_dispute_corrections).most_common(1)
        if most_common_corrected_species and most_common_corrected_species[0][1] >= CONSENSUS_THRESHOLD:
            final_validated_species = most_common_corrected_species[0][0]
            is_validated = True

    # Health Consensus:
    if (
        media_item.health_status_ai_prediction
        and health_confirm_counts.get(media_item.health_status_ai_prediction, 0) >= CONSENSUS_THRESHOLD
    ):
        final_validated_health = media_item.health_status_ai_prediction
        is_validated = True
    else:
        most_common_corrected_health = Counter(health_dispute_corrections).most_common(1)
        if most_common_corrected_health and most_common_corrected_health[0][1] >= CONSENSUS_THRESHOLD:
            final_validated_health = most_common_corrected_health[0][0]
            is_validated = True

    # 5. Prepare update data for MediaItem
    update_data: Dict[str, Any] = {
        "validation_score": total_validation_score,
        "validated_species": final_validated_species,
        "validated_health_status": final_validated_health,
        "is_validated_by_community": is_validated,
    }

    # 6. Update the MediaItem record in the database
    media_item_update_schema = schemas.MediaItemUpdate(**update_data)  # Create Pydantic schema from dict

    updated_media_item = await crud_media.update_media_item(
        db=db,
        db_media_item=media_item,  # Pass the original MediaItem model instance
        media_item_in=media_item_update_schema,  # Pass the updates
    )

    print(
        f"Validation Service: MediaItem {media_item_id} re-evaluated. "
        f"Score: {total_validation_score}, Validated Species: {final_validated_species}, "
        f"Validated Health: {final_validated_health}, Is Validated: {is_validated}"
    )

    return updated_media_item
