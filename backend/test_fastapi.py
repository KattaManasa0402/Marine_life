# E:\Marine_life\backend\test_fastapi.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # Required for frontend test

app = FastAPI()

# Add CORS middleware to allow your React frontend
origins = [
    "http://localhost",
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/test-health")
async def test_health():
    return {"status": "ok", "message": "Test API is healthy!"}

@app.get("/test-root")
async def test_root():
    return {"message": "Hello from Test FastAPI!"}

# To run this: uvicorn test_fastapi:app --host 0.0.0.0 --port 8000