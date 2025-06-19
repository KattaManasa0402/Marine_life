from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone # Ensure timezone is imported for manual timestamp updates

from app.models.media import MediaItem as MediaItemModel # Your SQLAlchemy model for MediaItem
from app.schemas.media import MediaItemCreate, MediaItemUpdate # Your Pydantic schemas for MediaItem

# --- CREATE MediaItem ---
async def create_media_item(
    db: AsyncSession, 
    media_item_data: Dict[str, Any], # Expecting a dictionary of data to create the MediaItem
    user_id: int                     # The ID of the user who owns this media item
) -> MediaItemModel:
    """
    Create a new media item metadata record in the database.
    
    Args:
        db: The asynchronous database session.
        media_item_data: A dictionary containing the fields for the new MediaItem.
                         This typically includes server-generated data like 'file_url'
                         and user-provided data like 'original_filename', 'latitude', etc.
        user_id: The ID of the user uploading/owning the media.
        
    Returns:
        The newly created MediaItemModel instance.
    """
    # Unpack the media_item_data dictionary into keyword arguments for the MediaItemModel constructor.
    # Add the user_id separately.
    db_media_item = MediaItemModel(
        **media_item_data,
        user_id=user_id,
        updated_at=datetime.now(timezone.utc) # Explicitly set updated_at on creation
    )
    db.add(db_media_item) # Add the new object to the session
    await db.commit()      # Commit the transaction to save to the database
    await db.refresh(db_media_item) # Refresh the instance to get DB-generated values (ID, created_at)
    return db_media_item

# --- GET MediaItem by ID ---
async def get_media_item(db: AsyncSession, media_item_id: int) -> Optional[MediaItemModel]:
    """
    Retrieve a single media item by its ID from the database.
    
    Args:
        db: The asynchronous database session.
        media_item_id: The ID of the media item to retrieve.
        
    Returns:
        The MediaItemModel instance if found, otherwise None.
    """
    result = await db.execute(
        select(MediaItemModel).filter(MediaItemModel.id == media_item_id)
    )
    return result.scalar_one_or_none() # Efficiently gets one result or None

# --- GET Multiple MediaItems (with pagination and potential filtering) ---
async def get_media_items(
    db: AsyncSession, 
    skip: int = 0, 
    limit: int = 100,
    user_id: Optional[int] = None,        # Optional filter: get items for a specific user
    species_filter: Optional[str] = None, # Optional filter: search by AI predicted species
    # Add more filters here as needed: location (bounding box), date range, validated status, etc.
) -> List[MediaItemModel]:
    """
    Retrieve a list of media items from the database, with pagination and optional filters.
    
    Args:
        db: The asynchronous database session.
        skip: Number of records to skip (for pagination).
        limit: Maximum number of records to return.
        user_id: Optional user ID to filter media items by owner.
        species_filter: Optional string to filter media items by AI predicted species (case-insensitive like search).
        
    Returns:
        A list of MediaItemModel instances.
    """
    query = select(MediaItemModel) # Start with a base query to select all MediaItems
    
    # Apply filters if they are provided
    if user_id is not None:
        query = query.filter(MediaItemModel.user_id == user_id)
    
    if species_filter:
        # Using ilike for case-insensitive partial string matching
        query = query.filter(MediaItemModel.species_ai_prediction.ilike(f"%{species_filter}%"))
            
    # Add other filters here (e.g., for location, date, validation status)

    # Apply ordering (e.g., newest first) and pagination
    query = query.order_by(MediaItemModel.created_at.desc()).offset(skip).limit(limit)
    
    result = await db.execute(query)
    return result.scalars().all() # Get all matching MediaItemModel instances

# --- UPDATE MediaItem ---
# This can be used for various updates: user editing metadata, AI updating predictions,
# community updating validation status, etc.
async def update_media_item(
    db: AsyncSession, 
    db_media_item: MediaItemModel,   # The existing ORM model instance retrieved from the DB
    media_item_in: MediaItemUpdate # Pydantic schema containing the update data
) -> MediaItemModel:
    """
    Update an existing media item in the database.
    
    Args:
        db: The asynchronous database session.
        db_media_item: The SQLAlchemy MediaItemModel instance to update.
        media_item_in: A Pydantic MediaItemUpdate schema with the fields to update.
                       Only fields explicitly set in media_item_in will be updated.
                       
    Returns:
        The updated MediaItemModel instance.
    """
    # Get a dictionary of only the fields that were explicitly provided in the input schema
    update_data = media_item_in.model_dump(exclude_unset=True) 

    for field_name, value in update_data.items():
        # Update the attribute on the SQLAlchemy model instance if the value is not None.
        # If a field in MediaItemUpdate can be legitimately set to None (and DB column is nullable),
        # you might need to adjust this logic (e.g., `if field_name in update_data:`).
        # For now, this prevents accidentally setting non-nullable fields to None if client sends `null`.
        if value is not None: 
            setattr(db_media_item, field_name, value)
        # If you want to allow clearing a field by sending `null`, and the DB column is nullable,
        # you would use: `setattr(db_media_item, field_name, value)` without the `if value is not None`.
        # But be careful with NOT NULL constraints.

    db.add(db_media_item) # Add the modified object to the session
    await db.commit()      # Commit the changes to the database
    await db.refresh(db_media_item) # Refresh to get any DB-side updates (like updated_at)
    return db_media_item

# --- DELETE MediaItem ---
async def delete_media_item(db: AsyncSession, media_item_id: int) -> Optional[MediaItemModel]:
    """
    Delete a media item by its ID from the database.
    NOTE: This function ONLY deletes the database record. It does NOT delete the
    corresponding file from object storage (e.g., MinIO). That would require
    separate logic.
    
    Args:
        db: The asynchronous database session.
        media_item_id: The ID of the media item to delete.
        
    Returns:
        The deleted MediaItemModel instance if found and deleted, otherwise None.
    """
    db_media_item = await get_media_item(db, media_item_id=media_item_id)
    if db_media_item:
        await db.delete(db_media_item)
        await db.commit()
        return db_media_item # The object is now marked as deleted in the session
    return None
        
# --- Helper to update AI processing results for a MediaItem ---
async def update_media_item_ai_results(
    db: AsyncSession,
    media_item_id: int,
    species: Optional[str],
    health: Optional[str],
    confidence: Optional[float],
    model_version: Optional[str],
    status: str = "completed" # Default to "completed", can also be "failed", "processing"
) -> Optional[MediaItemModel]:
    """
    A specific helper function to update AI-related fields of a MediaItem.
    
    Args:
        db: The asynchronous database session.
        media_item_id: ID of the media item to update.
        species: Predicted species name.
        health: Predicted health status.
        confidence: AI confidence score.
        model_version: Version of the AI model used.
        status: New AI processing status for the item.
        
    Returns:
        The updated MediaItemModel instance, or None if not found.
    """
    db_media_item = await get_media_item(db, media_item_id=media_item_id)
    if not db_media_item:
        return None # Media item not found

    # Update fields if new values are provided
    if species is not None:
        db_media_item.species_ai_prediction = species
    if health is not None:
        db_media_item.health_status_ai_prediction = health
    if confidence is not None:
        db_media_item.ai_confidence_score = confidence
    if model_version is not None:
        db_media_item.ai_model_version = model_version
    
    db_media_item.ai_processing_status = status
    # Manually set updated_at because onupdate in model might not trigger for all such changes
    db_media_item.updated_at = datetime.now(timezone.utc) 

    db.add(db_media_item)
    await db.commit()
    await db.refresh(db_media_item)
    return db_media_item

# --- GET MediaItems by User ---
async def get_media_items_by_user(db: AsyncSession, user_id: int, skip: int = 0, limit: int = 100):
    """
    Retrieve a list of media items for a specific user, with pagination.
    
    Args:
        db: The asynchronous database session.
        user_id: The ID of the user whose media items you want to retrieve.
        skip: Number of records to skip (for pagination).
        limit: Maximum number of records to return.
        
    Returns:
        A list of MediaItemModel instances belonging to the specified user.
    """
    result = await db.execute(
        select(MediaItemModel)
        .filter(MediaItemModel.user_id == user_id)
        .order_by(MediaItemModel.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()