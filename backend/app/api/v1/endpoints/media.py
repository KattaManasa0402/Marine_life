from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import logging

from app import schemas, crud
from app.db.database import get_db
from app.core import security
from app.models.user import User as UserModel
from app.services import upload_file_to_minio
from app.tasks.ai_tasks import process_media_with_gemini

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/upload", response_model=schemas.MediaItem, status_code=status.HTTP_201_CREATED)
async def upload_media(
    current_user: UserModel = Depends(security.get_current_active_user),
    db: AsyncSession = Depends(get_db),
    file: UploadFile = File(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None), # Changed from str to float
    description: Optional[str] = Form(None)
):
    try:
        file_url = await upload_file_to_minio(file)
        if not file_url:
            raise HTTPException(status_code=500, detail="File could not be uploaded to storage.")
    except Exception as e:
        logger.error(f"MinIO upload failed: {e}")
        raise HTTPException(status_code=503, detail="Storage service is currently unavailable.")

    # Prepare data for CRUD operation
    media_data = {
        "file_url": file_url,
        "original_filename": file.filename,
        "content_type": file.content_type,
        "file_size_bytes": file.size,
        "latitude": latitude,
        "longitude": longitude,
        "description": description,
        "ai_processing_status": "pending" # Explicitly set status
    }
    
    # Create the media item record in the database
    item = await crud.crud_media.create_media_item(db=db, media_item_data=media_data, user_id=current_user.id)
    
    # --- FIX IS HERE ---
    # Try to dispatch the AI task, but don't fail the entire request if the task queue is down.
    try:
        process_media_with_gemini.delay(item.id, item.file_url)
        logger.info(f"Successfully dispatched AI task for media item {item.id}")
    except Exception as e:
        # Log the error, but the user's upload is already safe.
        logger.error(f"Failed to dispatch Celery task for media item {item.id}. Error: {e}")
        # Optionally, update the item's status to 'failed_to_queue'
        item.ai_processing_status = "failed_queue"
        db.add(item)
        await db.commit()
    # --- END FIX ---

    # Award points for uploading
    await crud.crud_user.add_score_and_check_badges(db, user=current_user, points=10)
    
    await db.refresh(item)
    return item

@router.get("/", response_model=List[schemas.MediaItem])
async def list_media(db: AsyncSession = Depends(get_db), skip: int = 0, limit: int = 100):
    media_items = await crud.crud_media.get_media_items(db, skip, limit)
    logger.info(f"Retrieved {len(media_items)} media items for listing.")
    return media_items

@router.get("/{item_id}", response_model=schemas.MediaItem)
async def get_media(item_id: int, db: AsyncSession = Depends(get_db)):
    item = await crud.crud_media.get_media_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Media item not found")
    return item

@router.get("/user/{user_id}", response_model=List[schemas.MediaItem])
async def list_user_media(user_id: int, db: AsyncSession = Depends(get_db)):
    return await crud.crud_media.get_media_items_by_user(db=db, user_id=user_id)

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_media(item_id: int, db: AsyncSession = Depends(get_db), current_user: UserModel = Depends(security.get_current_active_user)):
    item = await crud.crud_media.get_media_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Media item not found")
    if item.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not authorized to delete this media item")
    await crud.crud_media.delete_media_item(db, item_id)
    return