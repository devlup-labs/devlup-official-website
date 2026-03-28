from pymongo import MongoClient
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()  # loads .env file

MONGO_URL = os.getenv("MONGO_URL")

if not MONGO_URL:
    raise ValueError("MONGO_URL not found in .env")

client = AsyncIOMotorClient(MONGO_URL)
db = client["devlup_db"]
user_collection = db["users"]