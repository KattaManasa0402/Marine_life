import json
import logging
import requests
from io import BytesIO
from PIL import Image
import google.generativeai as genai
from app.core.config import settings

logger = logging.getLogger(__name__)

PROMPT_V3 = """
SYSTEM: You are an expert marine biologist AI...
{...}
"""

def analyze_image_with_gemini(file_url: str) -> dict:
    logger.info(f"Starting synchronous AI analysis for URL: {file_url}")
    try:
        if not settings.GOOGLE_API_KEY:
            raise ValueError("GOOGLE_API_KEY is not set.")
        genai.configure(api_key=settings.GOOGLE_API_KEY)
        model = genai.GenerativeModel('gemini-1.5-pro')

        response = requests.get(file_url, timeout=45)
        response.raise_for_status()
        image_bytes = BytesIO(response.content)
        image = Image.open(image_bytes)

        ai_response = model.generate_content([PROMPT_V3, image])
        
        cleaned_text = ai_response.text.strip().lstrip("```json").rstrip("```").strip()
        ai_data = json.loads(cleaned_text)
        
        primary_species = ai_data.get('primary_species', {}) or {}
        health = ai_data.get('health_assessment', {}) or {}

        return {
            "species_ai_prediction": primary_species.get("common_name", "N/A"),
            "health_status_ai_prediction": health.get("status", "N/A"),
            "ai_confidence_score": float(primary_species.get('identification_confidence', 0.0)),
            "ai_model_version": ai_data.get("ai_model_version", "gemini-1.5-pro-v1-task-fallback"),
            "ai_processing_status": "completed"
        }
    except Exception as e:
        logger.error(f"Synchronous AI analysis FAILED: {e}", exc_info=True)
        return {"ai_processing_status": "failed"}