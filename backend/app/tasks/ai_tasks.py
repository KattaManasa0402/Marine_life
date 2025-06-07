import json
import requests
from io import BytesIO
from PIL import Image
from datetime import datetime, timezone

# --- NEW: Import from our dedicated sync_database file ---
from app.db.sync_database import SyncSessionLocal
from sqlalchemy import update

import google.generativeai as genai
from app.celery_app import celery_app
from app.models.media import MediaItem

# ADVANCED PROMPT V2 (remains the same)
PROMPT_V2 = """
SYSTEM: You are a helpful and knowledgeable marine biologist assistant. Your task is to analyze images and identify marine life...
... [The rest of the long prompt text] ...
Now, analyze the following image.
"""

def update_db_sync_operation(media_item_id: int, ai_data: dict, status: str):
    """A standard, synchronous function to update the database using its own isolated session."""
    print(f"SYNC DB UPDATE: Attempting to update media_item_id: {media_item_id}")
    db = SyncSessionLocal() # Get a session from our dedicated sync factory
    try:
        update_data = {
            "species_ai_prediction": ai_data.get('species', 'Unknown'),
            "health_status_ai_prediction": ai_data.get('health_status', 'Unknown'),
            "ai_confidence_score": float(ai_data.get('confidence', 0.0)),
            "ai_model_version": "gemini-1.5-flash-v4-sync", # New version name
            "ai_processing_status": status,
            "updated_at": datetime.now(timezone.utc)
        }
        stmt = (
            update(MediaItem)
            .where(MediaItem.id == media_item_id)
            .values(**update_data)
        )
        db.execute(stmt)
        db.commit()
        print(f"SYNC DB UPDATE: Successfully committed update for media_item_id: {media_item_id}")
    except Exception as e:
        print(f"SYNC DB UPDATE ERROR: Rolling back for media_item_id: {media_item_id} - {e}")
        db.rollback()
    finally:
        db.close()

@celery_app.task(name="tasks.process_media_with_gemini")
def process_media_with_gemini(media_item_id: int, file_url: str):
    """Celery task using a synchronous DB update for maximum reliability."""
    print("\n--- RUNNING AI TASK WITH SYNC DATABASE HANDLER v4 ---\n")
    
    # AI analysis part
    model = genai.GenerativeModel('gemini-1.5-flash')
    ai_results = {
        "species": "Unknown",
        "health_status": "Unknown",
        "confidence": 0.0
    }
    final_status = "failed"
    try:
        response = requests.get(file_url, timeout=30)
        response.raise_for_status()
        image = Image.open(BytesIO(response.content))
        ai_response = model.generate_content([PROMPT_V2, image])
        cleaned_text = ai_response.text.strip().lstrip("```json").rstrip("```").strip()
        ai_results_temp = json.loads(cleaned_text)
        
        # Ensure the AI results match the expected format for display
        if ai_results_temp.get("is_marine_life_present") is False:
            ai_results["species"] = "No Marine Life Detected"
            ai_results["health_status"] = "N/A"
        else:
            ai_results["species"] = ai_results_temp.get("species", "Unknown")
            ai_results["health_status"] = ai_results_temp.get("health_status", "Unknown")
            ai_results["confidence"] = ai_results_temp.get("confidence", 0.0)
        final_status = "completed"
    except Exception as e:
        print(f"ERROR in AI Task for media_item_id {media_item_id}: {e}")
        final_status = "failed"

    # Update the database with the AI results
    update_db_sync_operation(media_item_id, ai_results, final_status)

    # Return the results in a format that matches the UI
    return {
        "media_item_id": media_item_id,
        "final_status": final_status,
        "ai_prediction": {
            "species": ai_results["species"],
            "health": ai_results["health_status"]
        },
        "community_validated": {
            "species": "Not yet validated",  # Placeholder for community validation
            "health": "Not yet validated"
        }
    }