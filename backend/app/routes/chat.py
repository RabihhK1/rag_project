from fastapi import APIRouter
from pydantic import BaseModel

from app.services.rag_service import RAGService


router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)


rag_service = RAGService()


class ChatRequest(BaseModel):
    message: str



@router.post("")
async def chat(request: ChatRequest):

    result = rag_service.ask(
        request.message
    )

    return result