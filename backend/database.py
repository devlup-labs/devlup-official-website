from pymongo import MongoClient
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()  # loads .env file

MONGO_URL = os.getenv("MONGO_URL")

if not MONGO_URL:
    raise ValueError("MONGO_URL not found in .env")

# Synchronous client for general operations
client_sync = MongoClient(MONGO_URL)
db = client_sync["devlup_db"]

# Asynchronous client for user operations
client_async = AsyncIOMotorClient(MONGO_URL)
user_collection = client_async["devlup_db"]["users"]