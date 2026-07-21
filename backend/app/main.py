from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import client
from app.routes.chat import router as chat_router
from app.routes.conversations import router as conversations_router

app = FastAPI(
    title="RAG Backend API",
    version="1.0.0"
)


# -------------------------
# CORS (Frontend connection)
# -------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------
# API Routes
# -------------------------
app.include_router(chat_router)

app.include_router(conversations_router)
# -------------------------
# MongoDB Check
# -------------------------
@app.on_event("startup")
async def startup_db():

    try:
        await client.admin.command("ping")
        print("MongoDB connection successful")

    except Exception as e:
        print(
            "MongoDB connection failed:",
            e
        )


# -------------------------
# Health Check
# -------------------------
@app.get("/")
async def root():

    return {
        "message": "RAG Backend is running"
    }