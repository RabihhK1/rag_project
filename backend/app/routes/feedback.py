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
# Feedback Model
# =========================

class FeedbackRequest(BaseModel):

    conversation_id: str | None = None

    message_id: str

    rating: str   # "up" or "down"





# =========================
# Submit / Update Feedback
# =========================

@router.post("")
async def submit_feedback(
    request: FeedbackRequest
):


    # Check if this message already has feedback

    existing_feedback = await feedback_collection.find_one(

        {

            "message_id":
                request.message_id

        }

    )



    # If exists -> update rating

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


                    "updated_at":
                        datetime.now(timezone.utc)

                }

            }

        )



        return {

            "success": True,

            "action": "updated"

        }





    # First time feedback

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



            "created_at":
                datetime.now(timezone.utc)

        }

    )



    return {

        "success": True,

        "action": "created"

    }