from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, ARRAY, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base # <-- FIX: Import from the new base.py file

class MediaItem(Base):
    __tablename__ = "media_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_url = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    sighting_timestamp = Column(DateTime(timezone=True), nullable=True)
    original_filename = Column(String(255), nullable=True)
    content_type = Column(String(100), nullable=True)
    file_size_bytes = Column(Integer, nullable=True)

    species_ai_prediction = Column(String, nullable=True)
    health_status_ai_prediction = Column(String, nullable=True)
    ai_confidence_score = Column(Float, nullable=True)
    ai_model_version = Column(String, nullable=True)
    ai_processing_status = Column(String, default="pending", nullable=False)
    
    validated_species = Column(String, nullable=True)
    validated_health_status = Column(String, nullable=True)
    validation_score = Column(Integer, default=0, nullable=False)
    is_validated_by_community = Column(Boolean, default=False, nullable=False)

    # NEW AI Detailed Fields (from PROMPT_V3)
    ai_is_marine_life_present = Column(Boolean, nullable=True)
    ai_primary_species_scientific = Column(String, nullable=True)
    ai_primary_species_common = Column(String, nullable=True)
    ai_identification_justification = Column(String, nullable=True)
    ai_health_status_observations = Column(String, nullable=True)
    ai_environmental_habitat_type = Column(String, nullable=True)
    ai_environmental_water_clarity = Column(String, nullable=True)
    ai_environmental_notes = Column(String, nullable=True)
    ai_other_detected_species = Column(String, nullable=True) # Storing as JSON string

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    owner = relationship("User", back_populates="media_items")
    validation_votes = relationship("ValidationVote", back_populates="media_item", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<MediaItem(id={self.id}, user_id={self.user_id}, species_ai='{self.species_ai_prediction}')>"