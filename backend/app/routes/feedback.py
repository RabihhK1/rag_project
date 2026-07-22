from fastapi import APIRouter
from pydantic import BaseModel
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

    rating: str  
    # "up" or "down"

    comment: str | None = None

    reasons: list[str] = []





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