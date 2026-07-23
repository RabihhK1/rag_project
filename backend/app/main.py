from fastapi import FastAPI
from app.database import client


app = FastAPI(
    title="RAG Backend API",
    version="1.0.0"
)


@app.on_event("startup")
async def startup_db():
    try:
        await client.admin.command("ping")
        print("MongoDB connection successful")
    except Exception as e:
        print("MongoDB connection failed:", e)


@app.get("/")
async def root():
    return {
        "message": "RAG Backend is running"
    }