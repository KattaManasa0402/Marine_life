from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class MediaItem(Base):
    __tablename__ = "media_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_url = Column(String, nullable=False)
    description = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # --- AI Prediction Fields ---

    # DEPRECATED: These fields will be replaced by the more detailed ones below.
    species_ai_prediction = Column(String, nullable=True)
    health_status_ai_prediction = Column(String, nullable=True)
    
    # NEW: Enhanced AI Prediction Fields
    ai_primary_species_name = Column(String, nullable=True)
    ai_primary_species_scientific = Column(String, nullable=True)
    ai_health_status = Column(String, nullable=True)
    ai_health_observations = Column(String, nullable=True)
    ai_habitat_type = Column(String, nullable=True)
    ai_environmental_notes = Column(String, nullable=True)
    ai_other_species_detected = Column(ARRAY(String), nullable=True)
    
    # General AI Fields
    ai_confidence_score = Column(Float, nullable=True)
    ai_model_version = Column(String, nullable=True)
    ai_processing_status = Column(String, default="pending", nullable=False)

    # --- Community Validation Fields ---
    validated_species = Column(String, nullable=True)
    validated_health = Column(String, nullable=True)
    community_votes_up = Column(Integer, default=0, nullable=False)
    community_votes_down = Column(Integer, default=0, nullable=False)
    is_community_validated = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="media_items")
    community_votes_received = relationship("CommunityVote", back_populates="media_item", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<MediaItem(id={self.id}, user_id={self.user_id}, species_ai='{self.ai_primary_species_name}')>"