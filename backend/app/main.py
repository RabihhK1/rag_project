from fastapi import FastAPI
from fastapi import Depends

from app.database import client, ensure_indexes
from app.routes.chat import router as chat_router
from app.routes.conversations import router as conversations_router
from app.routes.feedback import router as feedback_router
from app.security import require_internal_request
app = FastAPI(
    title="RAG Backend API",
    version="1.0.0"
)


# -------------------------
# API Routes
# -------------------------
app.include_router(chat_router, dependencies=[Depends(require_internal_request)])
app.include_router(feedback_router, dependencies=[Depends(require_internal_request)])
app.include_router(conversations_router, dependencies=[Depends(require_internal_request)])
# -------------------------
# MongoDB Check
# -------------------------
@app.on_event("startup")
async def startup_db():

    try:
        await client.admin.command("ping")
        await ensure_indexes()
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


@app.get("/health")
async def health():
    return {"status": "ok"}
