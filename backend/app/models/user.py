from sqlalchemy import Column, Integer, String, Boolean, DateTime, ARRAY, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base  # <-- FIX: Import from the new base.py file

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    
    score = Column(Integer, default=0, nullable=False)
    earned_badges = Column(ARRAY(String(50)), default=[], nullable=False) 

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    media_items = relationship("MediaItem", back_populates="owner", cascade="all, delete-orphan")
    validation_votes = relationship("ValidationVote", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}')>"