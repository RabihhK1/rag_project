from fastapi import APIRouter
from typing import Literal

from pydantic import BaseModel, Field
from datetime import datetime, timezone
from uuid import uuid4

from app.database import feedback_collection


router = APIRouter(
    prefix="/feedback",
    tags=["Feedback"]
)



# =========================
# Feedback Request Model
# =========================

class FeedbackRequest(BaseModel):

    conversation_id: str | None = None

    message_id: str

    rating: Literal["up", "down"]

    comment: str | None = None

    reasons: list[str] = Field(default_factory=list)





# =========================
# Submit / Update Feedback
# =========================

@router.post("")
async def submit_feedback(
    request: FeedbackRequest
):


    existing_feedback = await feedback_collection.find_one(
        {
            "message_id":
                request.message_id
        }
    )



    # =========================
    # Update existing feedback
    # =========================

    if existing_feedback:


        await feedback_collection.update_one(

            {
                "message_id":
                    request.message_id
            },


            {

                "$set":

                {

                    "rating":
                        request.rating,


                    "comment":
                        request.comment,


                    "reasons":
                        request.reasons,


                    "updated_at":
                        datetime.now(timezone.utc)

                }

            }

        )


        return {

            "success": True,

            "action": "updated"

        }





    # =========================
    # Create new feedback
    # =========================

    await feedback_collection.insert_one(

        {

            "feedback_id":
                str(uuid4()),


            "conversation_id":
                request.conversation_id,


            "message_id":
                request.message_id,


            "rating":
                request.rating,


            "comment":
                request.comment,


            "reasons":
                request.reasons,


            "created_at":
                datetime.now(timezone.utc)

        }

    )



    return {

        "success": True,

        "action": "created"

    }







# =========================
# Delete Feedback
# =========================

@router.delete("/{message_id}")
async def delete_feedback(
    message_id: str
):


    result = await feedback_collection.delete_one(

        {

            "message_id":
                message_id

        }

    )



    if result.deleted_count == 0:

        return {

            "success": False,

            "message":
                "Feedback not found"

        }



    return {

        "success": True,

        "message":
            "Feedback deleted"

    }

# =========================
# Feedback Analytics
# =========================

@router.get("/stats")
async def feedback_stats():


    total_feedback = await feedback_collection.count_documents({})



    positive_feedback = await feedback_collection.count_documents(

        {
            "rating":
                "up"
        }

    )



    negative_feedback = await feedback_collection.count_documents(

        {
            "rating":
                "down"
        }

    )



    satisfaction = 0


    if total_feedback > 0:

        satisfaction = round(

            (positive_feedback / total_feedback) * 100,

            2

        )




    return {


        "total_feedback":
            total_feedback,


        "positive":
            positive_feedback,


        "negative":
            negative_feedback,


        "satisfaction_rate":
            satisfaction

    }
# =========================
# Feedback List
# =========================

@router.get("")
async def get_feedback():

    feedbacks = []


    cursor = feedback_collection.find(
        {}
    ).sort(
        "created_at",
        -1
    )


    async for item in cursor:


        feedbacks.append({

            "feedback_id":
                item.get("feedback_id"),


            "conversation_id":
                item.get("conversation_id"),


            "message_id":
                item.get("message_id"),


            "rating":
                item.get("rating"),


            "comment":
                item.get("comment"),


            "reasons":
                item.get("reasons", []),


            "created_at":
                item.get("created_at")

        })


    return feedbacks
