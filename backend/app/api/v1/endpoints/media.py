from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import logging

from app import schemas, crud
from app.db.database import get_db
from app.core import security
from app.models.user import User as UserModel
from app.services.media_storage_service import upload_file_to_storage
from app.services.ai_service import analyze_image_with_gemini

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/upload", response_model=schemas.MediaItem, status_code=status.HTTP_201_CREATED)
async def upload_media(
    current_user: UserModel = Depends(security.get_current_active_user),
    db: AsyncSession = Depends(get_db),
    file: UploadFile = File(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    description: Optional[str] = Form(None)
):
    try:
        file_url = await upload_file_to_storage(file)
        if not file_url:
            raise HTTPException(status_code=500, detail="File could not be uploaded to storage.")
    except Exception as e:
        logger.error(f"Cloudinary upload failed: {e}")
        raise HTTPException(status_code=503, detail="Storage service is currently unavailable.")

    media_data = {
        "file_url": file_url, "original_filename": file.filename, "content_type": file.content_type,
        "file_size_bytes": file.size, "latitude": latitude, "longitude": longitude,
        "description": description, "ai_processing_status": "processing"
    }
    item = await crud.crud_media.create_media_item(db=db, media_item_data=media_data, user_id=current_user.id)
    
    ai_results = analyze_image_with_gemini(item.file_url)

    for key, value in ai_results.items():
        setattr(item, key, value)
    db.add(item)
    await db.commit()
    await db.refresh(item)

    await crud.crud_user.add_score_and_check_badges(db, user=current_user, points=10)
    
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