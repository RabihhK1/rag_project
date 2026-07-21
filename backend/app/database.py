from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings


client = AsyncIOMotorClient(
    settings.MONGO_URL
)


database = client[
    settings.DATABASE_NAME
]


# Mongo Collections

conversations_collection = database["conversations"]

messages_collection = database["messages"]

feedback_collection = database["feedback"]

telemetry_collection = database["telemetry"]



def get_database():

    return database