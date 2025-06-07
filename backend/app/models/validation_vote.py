from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base # Using absolute import path for clarity

class ValidationVote(Base):
    __tablename__ = "validation_votes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    media_item_id = Column(Integer, ForeignKey("media_items.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Vote on AI's species prediction
    # True: User confirms AI species prediction.
    # False: User disputes AI species prediction and provides a correction.
    # None: User did not vote on species.
    vote_on_species = Column(Boolean, nullable=True)
    corrected_species_name = Column(String(255), nullable=True) # Max length for corrected species name

    # Vote on AI's health status prediction
    # True: User confirms AI health prediction.
    # False: User disputes AI health prediction and provides a correction.
    # None: User did not vote on health.
    vote_on_health = Column(Boolean, nullable=True)
    corrected_health_status = Column(String(100), nullable=True) # Max length for corrected health status

    comment = Column(Text, nullable=True) # Optional general comment from the user

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships (back_populates will be set in User and MediaItem models)
    user = relationship("User", back_populates="validation_votes")
    media_item = relationship("MediaItem", back_populates="validation_votes")

    # Constraint to ensure a user can only submit one validation vote record per media item
    __table_args__ = (
        UniqueConstraint('user_id', 'media_item_id', name='uq_user_media_vote'),
    )

    def __repr__(self):
        return f"<ValidationVote(id={self.id}, user_id={self.user_id}, media_item_id={self.media_item_id})>"