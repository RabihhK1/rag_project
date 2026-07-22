from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json

from app.services.rag_service import RAGService


router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)


rag_service = RAGService()



class ChatRequest(BaseModel):

    message: str

    conversation_id: str | None = None





# ============================
# Normal Chat Endpoint
# ============================

@router.post("")
async def chat(
    request: ChatRequest
):

    result = await rag_service.ask(
        request.message,
        request.conversation_id
    )

    return result





# ============================
# SSE Streaming Endpoint
# ============================

@router.post("/stream")
async def chat_stream(
    request: ChatRequest
):


    async def event_generator():


        async for event in rag_service.ask_stream(

            request.message,

            request.conversation_id

        ):


            # Convert dict -> JSON string
            yield (
                f"data: {json.dumps(event)}\n\n"
            )



        yield "data: [DONE]\n\n"




    return StreamingResponse(

        event_generator(),

        media_type="text/event-stream"

    )