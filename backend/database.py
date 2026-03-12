from motor.motor_asyncio import AsyncIOMotorClient
from config import settings

client = AsyncIOMotorClient(settings.mongodb_uri)
db = client[settings.database_name]

users_collection = db["users"]
projects_collection = db["projects"]

async def init_db():
    await users_collection.create_index("email", unique=True)
    await projects_collection.create_index("created_by")
