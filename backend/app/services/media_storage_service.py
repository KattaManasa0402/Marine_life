import cloudinary
import cloudinary.uploader
from fastapi import UploadFile
from typing import Optional
from app.core.config import settings

def initialize_cloudinary():
    """Initializes the Cloudinary client with credentials from settings."""
    try:
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True
        )
        print("Cloudinary client initialized successfully.")
    except Exception as e:
        print(f"FATAL: Cloudinary client initialization failed: {e}")

# Call the initialization function when this module is loaded
initialize_cloudinary()

async def upload_file_to_storage(file: UploadFile) -> Optional[str]:
    """Uploads a file to Cloudinary and returns its public URL."""
    try:
        # The upload is done synchronously here, but it's fast.
        # For very large files, you might consider a background task.
        upload_result = cloudinary.uploader.upload(
            file.file,
            folder="marine_life_uploads", # Optional: organize uploads in a folder
            resource_type="auto" # Let Cloudinary detect if it's an image or video
        )
        
        file_url = upload_result.get("secure_url")
        if file_url:
            print(f"Successfully uploaded {file.filename} to {file_url}")
            return file_url
        else:
            print("ERROR: Cloudinary upload result did not contain a URL.")
            return None
    except Exception as e:
        print(f"ERROR: An exception occurred during Cloudinary upload: {e}")
        return None