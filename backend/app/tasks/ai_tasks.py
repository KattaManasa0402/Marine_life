# E:\Marine_life\backend\app\tasks\ai_tasks.py

import json
import requests
from io import BytesIO
from PIL import Image
from datetime import datetime, timezone
from sqlalchemy import update
from sqlalchemy.exc import SQLAlchemyError

from app.db.sync_database import SyncSessionLocal
import google.generativeai as genai
from app.celery_app import celery_app
from app.models.media import MediaItem
from app.core.config import settings

# NEW, V3 PROMPT for Google Gemini AI - More detailed and structured
PROMPT_V3 = """
SYSTEM: You are an expert marine biologist AI. Your task is to conduct a detailed analysis of the provided image of marine life.
Your response MUST be a single, valid JSON object and nothing else. Do not include markdown formatting like ```json.

Follow these steps for your analysis:
1.  **Initial Assessment:** Briefly think about what you see in the image. Is it clear? What is the main subject?
2.  **Species Identification:** Identify the most prominent marine species. If you are uncertain, provide your best guess and state your uncertainty. If multiple species are present, identify the primary one and list others.
3.  **Health & Condition Analysis:** Assess the visible health of the primary species. Look for signs of disease (lesions, discoloration), injury (scars, damaged fins), stress (bleaching in corals), or normal behavior.
4.  **Environmental Context:** Analyze the surrounding habitat. Note the water clarity, substrate (sandy, rocky, coral reef), and any visible flora or other fauna.
5.  **Confidence & Justification:** Provide a confidence score for your identification and a brief justification for your conclusions based on visual evidence.

Now, provide your final analysis in the following JSON format:

{
  "is_marine_life_present": boolean,
  "primary_species": {
    "scientific_name": "string",
    "common_name": "string",
    "identification_confidence": float,
    "justification": "string"
  },
  "health_assessment": {
    "status": "string",
    "observations": "string"
  },
  "environmental_context": {
    "habitat_type": "string",
    "water_clarity": "string",
    "notes": "string"
  },
  "other_detected_species": ["string"],
  "ai_model_version": "gemini-1.5-pro-v1-task"
}

If no marine life is detected, the JSON should be:
{
  "is_marine_life_present": false,
  "primary_species": null,
  "health_assessment": null,
  "environmental_context": null,
  "other_detected_species": [],
  "ai_model_version": "gemini-1.5-pro-v1-task"
}
"""

def update_db_sync_operation(media_item_id: int, ai_data: dict, status: str):
    """
    Synchronous database operation to update MediaItem record with detailed AI results.
    """
    db = SyncSessionLocal()
    try:
        # Safely extract data from the new, richer JSON structure
        primary_species = ai_data.get('primary_species', {}) or {}
        health = ai_data.get('health_assessment', {}) or {}
        env = ai_data.get('environmental_context', {}) or {}

        update_data = {
            "ai_processing_status": status,
            "updated_at": datetime.now(timezone.utc),
            "ai_model_version": ai_data.get("ai_model_version", "gemini-1.5-pro-v1-task-fallback"),

            # Map to existing columns in MediaItem model
            "species_ai_prediction": primary_species.get("common_name", "N/A"),
            "health_status_ai_prediction": health.get("status", "N/A"),
            "ai_confidence_score": float(primary_species.get('identification_confidence', 0.0)),
        }
        
        stmt = update(MediaItem).where(MediaItem.id == media_item_id).values(**update_data)
        db.execute(stmt)
        db.commit()
        print(f"MediaItem {media_item_id} updated successfully with DETAILED AI results and status '{status}'.")
    except SQLAlchemyError as e:
        db.rollback()
        print(f"Database error updating MediaItem {media_item_id}: {e}")
    except Exception as e:
        print(f"Unexpected error in update_db_sync_operation for MediaItem {media_item_id}: {e}")
    finally:
        db.close()

@celery_app.task(name="tasks.process_media_with_gemini", bind=True, max_retries=3, default_retry_delay=60)
def process_media_with_gemini(self, media_item_id: int, file_url: str):
    """
    Celery task to download an image, send it to Google Gemini PRO for analysis,
    and update the database with the detailed AI report.
    """
    print(f"Starting DETAILED AI task for media_item_id: {media_item_id}, file_url: {file_url}")
    
    # --- NEW: Mock AI Response for Debugging ---
    if settings.DEBUG_AI_MOCK:
        print(f"DEBUG_AI_MOCK is True. Skipping actual Gemini API call for media_item_id {media_item_id}.")
        mock_ai_results = {
            "is_marine_life_present": True,
            "primary_species": {
                "scientific_name": "Delphinapterus leucas",
                "common_name": "Beluga Whale",
                "identification_confidence": 0.95,
                "justification": "Recognized by distinctive white coloration and melon head."
            },
            "health_assessment": {
                "status": "Healthy",
                "observations": "Skin appears clear, no visible injuries."
            },
            "environmental_context": {
                "habitat_type": "Ocean",
                "water_clarity": "Clear",
                "notes": "Appears to be in a natural habitat."
            },
            "other_detected_species": [],
            "ai_model_version": "mock-gemini-1.5-pro-v1-task"
        }
        update_db_sync_operation(media_item_id, mock_ai_results, "completed")
        return {"media_item_id": media_item_id, "final_status": "completed", "ai_results": mock_ai_results}
    # --- END MOCK ---

    try:
        genai.configure(api_key=settings.GOOGLE_API_KEY)
    except Exception as e:
        print(f"FATAL: Could not configure Google Gemini in task for media_item_id {media_item_id}: {e}")
        update_db_sync_operation(media_item_id, {}, "failed")
        return {"media_item_id": media_item_id, "final_status": "failed"}

    # UPGRADED MODEL
    model = genai.GenerativeModel('gemini-1.5-pro')
    ai_results = {}
    final_status = "failed"

    try:
        print(f"Downloading image from {file_url} for media_item_id {media_item_id}...")
        response = requests.get(file_url, timeout=30)
        response.raise_for_status()
        print(f"Downloaded {len(response.content)} bytes for media_item_id {media_item_id}")
        print(f"First 20 bytes: {response.content[:20]}")
        print(f"Content-Type header: {response.headers.get('Content-Type')}")
        image_bytes = BytesIO(response.content)
        image = Image.open(image_bytes)
        print(f"Image downloaded and opened successfully for media_item_id {media_item_id}.")

        print(f"Sending image to Google Gemini PRO for media_item_id {media_item_id}...")
        # USE THE NEW PROMPT
        ai_response = model.generate_content([PROMPT_V3, image])
        
        cleaned_text = ai_response.text.strip().lstrip("```json").rstrip("```").strip()
        ai_results = json.loads(cleaned_text)
        
        if not ai_results.get("is_marine_life_present"):
            # Handle the specific case where no marine life is detected
            ai_results = {
                "is_marine_life_present": False,
                "primary_species": {"common_name": "No Marine Life Detected"},
                "health_assessment": {"status": "N/A"},
                "environmental_context": {},
                "other_detected_species": [],
                "ai_model_version": "gemini-1.5-pro-v1-task"
            }

        final_status = "completed"
        print(f"AI analysis completed successfully for media_item_id {media_item_id}.")

    except requests.exceptions.RequestException as req_err:
        print(f"Network/Request error for media_item_id {media_item_id}: {req_err}")
        try:
            self.retry(exc=req_err, countdown=60)
        except Exception as retry_exc:
            print(f"Failed to retry task for media_item_id {media_item_id}: {retry_exc}")
        final_status = "failed_network"
    except json.JSONDecodeError as json_err:
        print(f"JSON parsing error for media_item_id {media_item_id}: {json_err}. Raw AI response: '{ai_response.text}'")
        final_status = "failed_ai_parse"
    except Exception as e:
        print(f"Unhandled error in AI Task for media_item_id {media_item_id}: {e}")
        try:
            self.retry(exc=e, countdown=120)
        except Exception as retry_exc:
            print(f"Failed to retry task for media_item_id {media_item_id}: {retry_exc}")
        final_status = "failed_unhandled"
    finally:
        print(f"Updating DB with AI results and status '{final_status}' for media_item_id {media_item_id}...")
        update_db_sync_operation(media_item_id, ai_results, final_status)
        print(f"AI task finished for media_item_id {media_item_id} with status: {final_status}.")
        return {"media_item_id": media_item_id, "final_status": final_status, "ai_results": ai_results}