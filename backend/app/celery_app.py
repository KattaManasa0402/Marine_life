from celery import Celery
from app.core.config import settings

# This file should ONLY define the Celery app.
# It should not import any other parts of the application like routers or endpoints.

celery_app = Celery(
    "worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    # The 'include' tells Celery where to find the tasks. This is correct.
    include=["app.tasks.ai_tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)