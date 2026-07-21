from fastapi import APIRouter
from pydantic import BaseModel

from app.services.rag_service import RAGService


router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)


rag_service = RAGService()



from pydantic import BaseModel, Field

class ChatRequest(BaseModel):
    message:str
    conversation_id:str | None = None



@router.post("")
async def chat(request: ChatRequest):

    result = await rag_service.ask(
        request.message,
        request.conversation_id
    )

    return result

