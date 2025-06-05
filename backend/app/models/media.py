from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func # For default timestamp
from app.db.database import Base # Import Base from our database setup

class MediaItem(Base):
    __tablename__ = "media_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    owner = relationship("User", back_populates="media_items")

    file_url = Column(String(1024), nullable=False, unique=True)
    original_filename = Column(String(255), nullable=True)
    content_type = Column(String(100), nullable=True)
    file_size_bytes = Column(Integer, nullable=True)

    latitude = Column(Float, nullable=True, index=True)
    longitude = Column(Float, nullable=True, index=True)
    sighting_timestamp = Column(DateTime(timezone=True), nullable=True, index=True)
    
    species_ai_prediction = Column(String(255), nullable=True, index=True)
    health_status_ai_prediction = Column(String(100), nullable=True, index=True)
    ai_confidence_score = Column(Float, nullable=True)
    ai_processing_status = Column(String(50), default="pending", nullable=False, index=True)
    ai_model_version = Column(String(50), nullable=True)

    validated_species = Column(String(255), nullable=True, index=True)
    validated_health_status = Column(String(100), nullable=True, index=True)
    validation_score = Column(Integer, default=0)
    is_validated_by_community = Column(Boolean, default=False, index=True)

    description = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<MediaItem(id={self.id}, filename='{self.original_filename}', user_id={self.user_id})>"