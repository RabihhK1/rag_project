from fastapi import APIRouter
from pydantic import BaseModel

from app.database import (
    conversations_collection,
    messages_collection,
    feedback_collection
)
from app.services.response_versions import group_assistant_messages


router = APIRouter(
    prefix="/conversations",
    tags=["Conversations"]
)



# =========================
# Models
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
    raw_messages = await messages_collection.find(
        {"conversation_id": conversation_id}
    ).sort("created_at", 1).to_list(length=None)

    feedback_by_message_id = {}
    for message in raw_messages:
        if message.get("role") != "assistant":
            continue

        saved_feedback = await feedback_collection.find_one(
            {"message_id": message.get("message_id")}
        )
        feedback_by_message_id[message.get("message_id")] = (
            saved_feedback.get("rating") if saved_feedback else None
        )

    def version_payload(version, root_message_id, version_number):
        return {
            "message_id": version.get("message_id"),
            "root_message_id": root_message_id,
            "content": version.get("content", ""),
            "sources": version.get("sources", []),
            "feedback": feedback_by_message_id.get(version.get("message_id")),
            "version_number": version_number,
        }

    def timestamp(value):
        try:
            return value.timestamp()
        except (AttributeError, OSError, OverflowError, ValueError):
            return 0

    timeline = []
    for index, message in enumerate(raw_messages):
        if message.get("role") != "user":
            continue

        timeline.append(
            (
                timestamp(message.get("created_at")),
                index,
                {
                    "message_id": message.get("message_id"),
                    "role": "user",
                    "content": message.get("content", ""),
                    "sources": [],
                    "feedback": None,
                },
            )
        )

    # One assistant slot is returned per root answer. Its selected content is
    # the active version, while every reply stays available in `versions`.
    for group_index, (root_message_id, versions) in enumerate(
        group_assistant_messages(raw_messages).items(),
        start=len(raw_messages),
    ):
        active_versions = [
            version for version in versions if version.get("is_active_version")
        ]
        active_version = active_versions[-1] if active_versions else versions[-1]
        public_versions = [
            version_payload(version, root_message_id, version_number)
            for version_number, version in enumerate(versions, start=1)
        ]
        selected_version_index = next(
            (
                index
                for index, version in enumerate(public_versions)
                if version["message_id"] == active_version.get("message_id")
            ),
            len(public_versions) - 1,
        )
        selected_version = public_versions[selected_version_index]
        root_version = next(
            (
                version
                for version in versions
                if version.get("message_id") == root_message_id
            ),
            versions[0],
        )
        turn_created_at = (
            root_version.get("turn_created_at")
            or root_version.get("created_at")
        )

        timeline.append(
            (
                timestamp(turn_created_at),
                group_index,
                {
                    "message_id": selected_version["message_id"],
                    "root_message_id": root_message_id,
                    "role": "assistant",
                    "content": selected_version["content"],
                    "sources": selected_version["sources"],
                    "feedback": selected_version["feedback"],
                    "version_number": selected_version["version_number"],
                    "selected_version_index": selected_version_index,
                    "versions": public_versions,
                },
            )
        )

    timeline.sort(key=lambda item: (item[0], item[1]))
    return [message for _, _, message in timeline]







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







# =========================
# Delete conversation
# =========================

@router.delete("/{conversation_id}")
async def delete_conversation(
    conversation_id: str
):


    # Delete conversation

    await conversations_collection.delete_one(

        {

            "conversation_id":
                conversation_id

        }

    )



    # Delete messages

    await messages_collection.delete_many(

        {

            "conversation_id":
                conversation_id

        }

    )



    # Delete feedback related to chat

    await feedback_collection.delete_many(

        {

            "conversation_id":
                conversation_id

        }

    )



    return {

        "success": True

    }
