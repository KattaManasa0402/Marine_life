from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app import schemas, crud
from app.db.database import get_db
from app.core import security
from app.models.user import User as UserModel
# CORRECT: Import the specific client and function we exported from services
from app.services import minio_client, upload_file_to_minio
from app.tasks.ai_tasks import process_media_with_gemini

router = APIRouter()

@router.post("/upload", response_model=schemas.MediaItem)
async def upload_media(
    current_user: UserModel = Depends(security.get_current_active_user),
    db: AsyncSession = Depends(get_db),
    file: UploadFile = File(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    description: Optional[str] = Form(None)
):
    # Check for the client directly
    if not minio_client:
        raise HTTPException(status_code=503, detail="Storage service is not available")
    
    # Use the upload function directly    file_url = await upload_file_to_minio(file)
    if not file_url:
        raise HTTPException(status_code=500, detail="File upload failed")
    
    media_data = {
        "file_url": file_url, "original_filename": file.filename, "content_type": file.content_type,
        "latitude": latitude, "longitude": longitude, "description": description
    }
    item = await crud.crud_media.create_media_item(db, media_data, current_user.id)
    process_media_with_gemini.delay(item.id, item.file_url)
    
    # Award points to the user (function already includes commit)
    await crud.crud_user.add_score_and_check_badges(db, current_user, 10)
    
    return item

# The rest of the endpoints in this file are correct.
@router.get("/", response_model=List[schemas.MediaItem])
async def list_media(db: AsyncSession = Depends(get_db), skip: int = 0, limit: int = 100):
    return await crud.crud_media.get_media_items(db, skip, limit)

@router.get("/{item_id}", response_model=schemas.MediaItem)
async def get_media(item_id: int, db: AsyncSession = Depends(get_db)):
    item = await crud.crud_media.get_media_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Media item not found")
    return item

@router.get("/user/me", response_model=List[schemas.MediaItem])
async def list_my_media(
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(security.get_current_active_user)
):
    return await crud.crud_media.get_media_items_by_user(db=db, user_id=current_user.id)