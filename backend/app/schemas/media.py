from pydantic import BaseModel, HttpUrl, Field
from typing import Optional
from datetime import datetime

# --- Base MediaItem Properties ---
class MediaItemBase(BaseModel):
    original_filename: Optional[str] = Field(
        None, max_length=255, description="Original filename of the uploaded media."
    )
    content_type: Optional[str] = Field(
        None, max_length=100, description="MIME type of the media (e.g., image/jpeg, video/mp4)."
    )
    file_size_bytes: Optional[int] = Field(
        None, description="Size of the file in bytes."
    )
    latitude: Optional[float] = Field(
        None, description="Latitude of the sighting location."
    )
    longitude: Optional[float] = Field(
        None, description="Longitude of the sighting location."
    )
    sighting_timestamp: Optional[datetime] = Field(
        None, description="Timestamp of when the marine life was sighted."
    )
    description: Optional[str] = Field(
        None, description="User-provided description or notes about the sighting."
    )
    species_ai_prediction: Optional[str] = Field(
        None, max_length=255, description="Species name predicted by AI."
    )
    health_status_ai_prediction: Optional[str] = Field(
        None, max_length=100, description="Health status predicted by AI."
    )
    ai_confidence_score: Optional[float] = Field(
        None, ge=0.0, le=1.0, description="Confidence score (0.0–1.0) of the AI prediction."
    )
    ai_processing_status: str = Field(
        "pending", max_length=50, description="Status of AI processing (e.g., pending, processing, completed, failed)."
    )
    ai_model_version: Optional[str] = Field(
        None, max_length=50, description="Version of the AI model used for predictions."
    )

# --- MediaItem Creation ---
class MediaItemCreate(MediaItemBase):
    latitude: Optional[float] = Field(
        None, description="Latitude of the sighting location (user input)."
    )
    longitude: Optional[float] = Field(
        None, description="Longitude of the sighting location (user input)."
    )
    sighting_timestamp: Optional[datetime] = Field(
        None, description="Timestamp of sighting (user input)."
    )
    description: Optional[str] = Field(
        None, description="User-provided description or notes (user input)."
    )

# --- MediaItem Update ---
class MediaItemUpdate(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    sighting_timestamp: Optional[datetime] = None
    description: Optional[str] = None
    original_filename: Optional[str] = Field(None, max_length=255)
    species_ai_prediction: Optional[str] = Field(None, max_length=255)
    health_status_ai_prediction: Optional[str] = Field(None, max_length=100)
    ai_confidence_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    ai_processing_status: Optional[str] = Field(None, max_length=50)
    ai_model_version: Optional[str] = Field(None, max_length=50)
    validated_species: Optional[str] = Field(None, max_length=255)
    validated_health_status: Optional[str] = Field(None, max_length=100)
    validation_score: Optional[int] = None
    is_validated_by_community: Optional[bool] = None

# --- MediaItem Response Model ---
class MediaItem(MediaItemBase):
    id: int
    user_id: int
    file_url: HttpUrl
    validated_species: Optional[str] = Field(None, max_length=255)
    validated_health_status: Optional[str] = Field(None, max_length=100)
    validation_score: int = 0
    is_validated_by_community: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- NEW SCHEMA FOR MAP DATA POINTS ---
class MapDataPoint(BaseModel):
    id: int  # MediaItem ID
    latitude: float  # Must have latitude for map display
    longitude: float  # Must have longitude for map display
    species_prediction: Optional[str] = Field(
        None, description="AI predicted species for map marker info."
    )
    health_prediction: Optional[str] = Field(
        None, description="AI predicted health for map marker info."
    )
    file_url: HttpUrl  # URL to the full media, could be used for onClick
    # thumbnail_url: Optional[HttpUrl] = None  # Future: for faster loading map markers

    class Config:
        from_attributes = True  # Allows creating from ORM objects if fields match
