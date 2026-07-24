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



class RegenerateRequest(BaseModel):
    conversation_id: str
    message_id: str

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

# ============================
# Regenerate Endpoint (non-streaming)
# ============================
@router.post("/regenerate")
async def chat_regenerate(request: RegenerateRequest):
    result = await rag_service.regenerate(
        request.message_id,
        request.conversation_id,
    )
    return result


# ============================
# Regenerate Endpoint (SSE Streaming)
# ============================
@router.post("/regenerate/stream")
async def chat_regenerate_stream(request: RegenerateRequest):

    async def event_generator():
        async for event in rag_service.regenerate_stream(
            request.message_id,
            request.conversation_id,
        ):
            yield f"data: {json.dumps(event)}\n\n"

        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
    )


# ============================
# List versions for an assistant message
# ============================
@router.get("/messages/{message_id}/versions")
async def get_message_versions(message_id: str):
    """Return a complete v1/v2/... group for any selected version id."""

    result = await rag_service.get_response_versions(message_id)
    return result or {"versions": []}
