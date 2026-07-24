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


async def ensure_indexes():
    await conversations_collection.create_index([("user_id", 1), ("updated_at", -1)])
    await messages_collection.create_index([("user_id", 1), ("conversation_id", 1), ("created_at", 1)])
    await messages_collection.create_index([("user_id", 1), ("message_id", 1)], unique=True)
    await feedback_collection.create_index([("user_id", 1), ("message_id", 1)], unique=True)
