from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# --- Base ValidationVote Properties ---
# Common fields for creating or reading a vote
class ValidationVoteBase(BaseModel):
    # A vote can specify agreement/disagreement for species OR health, or both.
    # True: confirms AI prediction
    # False: disputes AI prediction (and provides a corrected value)
    # None: no vote on this specific aspect
    vote_on_species: Optional[bool] = Field(None, description="True if confirming AI species, False if disputing.")
    corrected_species_name: Optional[str] = Field(None, max_length=255, description="Corrected species name if disputing AI prediction.")

    vote_on_health: Optional[bool] = Field(None, description="True if confirming AI health, False if disputing.")
    corrected_health_status: Optional[str] = Field(None, max_length=100, description="Corrected health status if disputing AI prediction.")

    comment: Optional[str] = Field(None, description="Optional general comment or explanation for the vote.")

# --- ValidationVote Creation (Input Schema) ---
# Fields required or allowed when creating a new vote record via API.
# The user_id and media_item_id will be derived from the endpoint/path, not client input here.
class ValidationVoteCreate(ValidationVoteBase):
    # For a new vote, at least one of species or health vote should be present
    # This basic schema doesn't enforce that logic, but API endpoint can.
    pass

# --- ValidationVote Update (Input Schema) ---
# Fields that can be updated for an existing vote record. All optional.
class ValidationVoteUpdate(ValidationVoteBase):
    # Allow user to change their vote. All fields are optional.
    pass

# --- ValidationVote Response Model (Output Schema) ---
# Represents the full ValidationVote record as returned by the API.
# Includes database-generated fields like id and timestamps.
class ValidationVote(ValidationVoteBase):
    id: int
    media_item_id: int
    user_id: int # The ID of the user who submitted this vote

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True # Allows Pydantic to create from SQLAlchemy ORM instances