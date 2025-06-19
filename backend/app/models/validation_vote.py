from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base # <-- FIX: Import from the new base.py file

class ValidationVote(Base):
    __tablename__ = "validation_votes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    media_item_id = Column(Integer, ForeignKey("media_items.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    vote_on_species = Column(Boolean, nullable=True)
    corrected_species_name = Column(String(255), nullable=True)

    vote_on_health = Column(Boolean, nullable=True)
    corrected_health_status = Column(String(100), nullable=True)

    comment = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="validation_votes")
    media_item = relationship("MediaItem", back_populates="validation_votes")

    __table_args__ = (
        UniqueConstraint('user_id', 'media_item_id', name='uq_user_media_vote'),
    )

    def __repr__(self):
        return f"<ValidationVote(id={self.id}, user_id={self.user_id}, media_item_id={self.media_item_id})>"