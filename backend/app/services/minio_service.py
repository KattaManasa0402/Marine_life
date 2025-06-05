from minio import Minio
from minio.error import S3Error
from io import BytesIO
from fastapi import UploadFile
import uuid
from typing import Optional
from urllib.parse import urlparse # For parsing the file_url

from app.core.config import settings

minio_client: Optional[Minio] = None

try:
    print(f"Attempting to initialize MinIO client for endpoint: {settings.MINIO_ENDPOINT}...")
    minio_client = Minio(
        endpoint=settings.MINIO_ENDPOINT,
        access_key=settings.MINIO_ACCESS_KEY,
        secret_key=settings.MINIO_SECRET_KEY,
        secure=settings.MINIO_USE_SSL
    )
    print(f"MinIO client initialized successfully for endpoint: {settings.MINIO_ENDPOINT}")

    bucket_name_to_check = settings.MINIO_BUCKET_NAME
    found = minio_client.bucket_exists(bucket_name_to_check)
    if not found:
        minio_client.make_bucket(bucket_name_to_check)
        print(f"Bucket '{bucket_name_to_check}' created successfully in MinIO.")
    else:
        print(f"Bucket '{bucket_name_to_check}' already exists in MinIO.")

except S3Error as s3_err:
    print(f"MinIO S3Error during client initialization or bucket check: {s3_err}")
    minio_client = None
except Exception as e:
    print(f"An unexpected error occurred initializing MinIO client or checking bucket: {e}")
    minio_client = None

async def upload_file_to_minio(
    file: UploadFile,
    bucket_name: str = settings.MINIO_BUCKET_NAME,
) -> Optional[str]:
    if not minio_client:
        print("Error: MinIO client is not initialized. Cannot upload file.")
        return None

    try:
        await file.seek(0)
        file_content = await file.read()
        file_size = len(file_content)

        original_filename = file.filename if file.filename else "unknown_file"
        file_extension = ""
        if "." in original_filename:
            file_extension = original_filename.rsplit('.', 1)[1].lower()
        
        unique_id = uuid.uuid4().hex
        object_name_in_bucket = f"uploads/{unique_id}"
        if file_extension:
            object_name_in_bucket += f".{file_extension}"

        minio_client.put_object(
            bucket_name,
            object_name_in_bucket,
            data=BytesIO(file_content),
            length=file_size,
            content_type=file.content_type
        )
        
        print(f"Successfully uploaded '{original_filename}' as '{object_name_in_bucket}' "
              f"to bucket '{bucket_name}'. Size: {file_size} bytes.")

        protocol = "https" if settings.MINIO_USE_SSL else "http"
        file_url = f"{protocol}://{settings.MINIO_ENDPOINT}/{bucket_name}/{object_name_in_bucket}"
        
        return file_url

    except S3Error as s3_exc:
        print(f"MinIO S3 error occurred during file upload ('{original_filename}'): {s3_exc}")
        raise 
    except Exception as e:
        print(f"An unexpected error occurred during MinIO upload ('{original_filename}'): {e}")
        raise 
    finally:
        if hasattr(file, 'close') and callable(file.close):
            try:
                await file.close()
            except TypeError:
                file.close()

# --- NEW FUNCTION TO DELETE FILE FROM MINIO ---
def delete_file_from_minio(
    file_url: str, 
    bucket_name: str = settings.MINIO_BUCKET_NAME
) -> bool:
    """
    Deletes an object from the specified MinIO bucket based on its URL.

    Args:
        file_url: The full URL of the file in MinIO.
        bucket_name: The name of the bucket where the file resides.

    Returns:
        True if deletion was successful or object didn't exist, False on error.
    """
    if not minio_client:
        print("Error: MinIO client is not initialized. Cannot delete file.")
        return False

    try:
        # Parse the URL to extract the object name
        # Example URL: http://localhost:9000/marine-bucket/uploads/some_uuid.jpg
        # Object name would be: uploads/some_uuid.jpg
        parsed_url = urlparse(file_url)
        # The path will be /<bucket_name>/<object_name...>. We need to strip the leading / and bucket name.
        path_parts = parsed_url.path.strip('/').split('/', 1)
        if len(path_parts) > 1 and path_parts[0] == bucket_name:
            object_name = path_parts[1]
        else:
            # Fallback if URL structure is different or bucket name not in path
            # This might happen if MinIO endpoint itself contains the bucket or paths are weird
            # For our simple setup, the above should work.
            # A more robust way might be to store object_name directly in DB.
            print(f"Warning: Could not reliably parse object name from URL: {file_url}. Attempting with full path.")
            object_name = parsed_url.path.strip('/') # This might include bucket name if not careful

        if not object_name:
            print(f"Error: Could not extract object name from URL: {file_url}")
            return False

        print(f"Attempting to delete MinIO object '{object_name}' from bucket '{bucket_name}'...")
        minio_client.remove_object(bucket_name, object_name)
        print(f"Successfully deleted object '{object_name}' from bucket '{bucket_name}' (or it did not exist).")
        return True
    except S3Error as exc:
        print(f"MinIO S3 error occurred while deleting object for URL '{file_url}': {exc}")
        # Depending on the error, you might want to handle 'NoSuchKey' differently
        # For now, we consider it a non-failure for the deletion attempt.
        if "NoSuchKey" in str(exc): # A bit fragile check, but common for MinIO/S3
            print(f"Object for URL '{file_url}' not found in MinIO, considered deleted.")
            return True 
        return False
    except Exception as e:
        print(f"An unexpected error occurred during MinIO delete for URL '{file_url}': {e}")
        return False