# E:\Marine_life\backend\app\schemas\media.py
from pydantic import BaseModel, HttpUrl, Field
from typing import Optional
from datetime import datetime

# --- Base MediaItem Properties ---
class MediaItemBase(BaseModel):
    original_filename: Optional[str] = Field(None, max_length=255, description="Original filename of the uploaded media.")
    content_type: Optional[str] = Field(None, max_length=100, description="MIME type of the media (e.g., image/jpeg, video/mp4).")
    file_size_bytes: Optional[int] = Field(None, description="Size of the file in bytes.")
    latitude: Optional[float] = Field(None, description="Latitude of the sighting location.")
    longitude: Optional[float] = Field(None, description="Longitude of the sighting location.")
    sighting_timestamp: Optional[datetime] = Field(None, description="Timestamp of when the marine life was sighted.")
    description: Optional[str] = Field(None, description="User-provided description or notes about the sighting.")
    species_ai_prediction: Optional[str] = Field(None, max_length=255, description="Species name predicted by AI.")
    health_status_ai_prediction: Optional[str] = Field(None, max_length=100, description="Health status predicted by AI.")
    ai_confidence_score: Optional[float] = Field(None, ge=0.0, le=1.0, description="Confidence score (0.0-1.0) of the AI prediction.")
    ai_processing_status: str = Field("pending", max_length=50, description="Status of AI processing (e.g., pending, processing, completed, failed).")
    ai_model_version: Optional[str] = Field(None, max_length=50, description="Version of the AI model used for predictions.")

# --- MediaItem Creation ---
class MediaItemCreate(MediaItemBase):
    latitude: Optional[float] = Field(None, description="Latitude of the sighting location (user input).")
    longitude: Optional[float] = Field(None, description="Longitude of the sighting location (user input).")
    sighting_timestamp: Optional[datetime] = Field(None, description="Timestamp of sighting (user input).")
    description: Optional[str] = Field(None, description="User-provided description or notes (user input).")

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
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# --- MapDataPoint Model (for map markers, etc.) ---
class MapDataPoint(BaseModel):
    id: int
    latitude: float
    longitude: float
    species: Optional[str] = None
    health_status: Optional[str] = None
    sighting_timestamp: Optional[datetime] = None
    file_url: Optional[HttpUrl] = None

# --- ResearchDataPoint Model (placeholder, define as needed) ---
class ResearchDataPoint(BaseModel):
    id: int
    latitude: float
    longitude: float
    species: Optional[str] = None
    sighting_timestamp: Optional[datetime] = None