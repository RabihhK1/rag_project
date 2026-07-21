from fastapi import APIRouter
from pydantic import BaseModel

from app.database import (
    conversations_collection,
    messages_collection
)


router = APIRouter(
    prefix="/conversations",
    tags=["Conversations"]
)


# =========================
# Rename model
# =========================

class RenameRequest(BaseModel):
    title: str



# =========================
# Get all conversations
# Sidebar
# =========================

@router.get("")
async def get_conversations():

    conversations = []

    cursor = conversations_collection.find(
        {}
    ).sort(
        "updated_at",
        -1
    )


    async for conversation in cursor:

        conversations.append({

            "conversation_id":
                conversation.get(
                    "conversation_id"
                ),

            "title":
                conversation.get(
                    "title",
                    "New Chat"
                ),

            "created_at":
                conversation.get(
                    "created_at"
                ),

            "updated_at":
                conversation.get(
                    "updated_at"
                )

        })


    return conversations




# =========================
# Load messages
# =========================

@router.get("/{conversation_id}/messages")
async def get_messages(
    conversation_id: str
):

    messages = []


    cursor = messages_collection.find({

        "conversation_id":
            conversation_id

    }).sort(

        "created_at",
        1

    )


    async for message in cursor:

        messages.append({

            "role":
                message.get(
                    "role"
                ),

            "content":
                message.get(
                    "content"
                ),

            "sources":
                message.get(
                    "sources",
                    []
                )

        })


    return messages





# =========================
# Rename conversation
# =========================

@router.patch("/{conversation_id}")
async def rename_conversation(
    conversation_id: str,
    request: RenameRequest
):


    await conversations_collection.update_one(

        {
            "conversation_id":
                conversation_id
        },

        {

            "$set":
            {

                "title":
                    request.title

            }

        }

    )


    return {

        "success": True,

        "title":
            request.title

    }