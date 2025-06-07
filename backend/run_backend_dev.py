# E:\Marine_life\backend\run_backend_dev.py
import uvicorn
import os
import sys

# Add the backend root directory to Python's path
# This ensures that imports like 'app.main' are resolvable
project_root = os.path.dirname(os.path.abspath(__file__)) # This is E:\Marine_life\backend
if project_root not in sys.path:
    sys.path.insert(0, project_root)
    print(f"DEBUG: Added {project_root} to sys.path.")

if __name__ == "__main__":
    print("Starting FastAPI application...")
    # Use uvicorn.run directly, pointing to your app object by string.
    # --reload is usually fine with --workers 1 on Windows
    # If this still results in 404s, try setting reload=False for a stable test.
    uvicorn.run(
        "app.main:app",  # This string path is resolved relative to the current working directory
        host="0.0.0.0",
        port=8000,
        reload=True,     # Keep reload for development convenience
        workers=1        # Crucial for Windows stability with reload and multiprocessing
    )
    print("FastAPI application stopped.")