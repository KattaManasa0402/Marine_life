from minio import Minio
from io import BytesIO
from fastapi import UploadFile
import uuid
from typing import Optional
from app.core.config import settings

def initialize_minio_client():
    """
    Initializes and returns the MinIO client, also ensures the bucket exists.
    
    NOTE: Temporarily disabled for Render deployment until a cloud storage solution is configured.
    """
    print("MinIO initialization is currently disabled for deployment.")
    return None # This is the crucial change.

# Initialize the client when this module is loaded
minio_client: Optional[Minio] = initialize_minio_client()

async def upload_file_to_minio(file: UploadFile) -> Optional[str]:
    """
    Uploads a file to the configured MinIO bucket and returns its public URL.
    """
    if not minio_client:
        print("ERROR: MinIO client is not available. Cannot upload file.")
        return None
    
    try:
        content = await file.read()
        # Create a unique object name using UUID and the original file extension
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else ''
        object_name = f"uploads/{uuid.uuid4().hex}.{file_extension}"

        # Upload the object
        minio_client.put_object(
            bucket_name=settings.MINIO_BUCKET_NAME,
            object_name=object_name,
            data=BytesIO(content),
            length=len(content),
            content_type=file.content_type
        )
        
        # Construct the public URL
        protocol = "https" if settings.MINIO_USE_SSL else "http"
        file_url = f"{protocol}://{settings.MINIO_ENDPOINT}/{settings.MINIO_BUCKET_NAME}/{object_name}"
        
        print(f"Successfully uploaded {file.filename} to {file_url}")
        return file_url
    except Exception as e:
        print(f"ERROR: An exception occurred during MinIO upload: {e}")
        return None