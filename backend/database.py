from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()  # loads .env file

MONGO_URL = os.getenv("MONGO_URL")

if not MONGO_URL:
    raise ValueError("MONGO_URL not found in .env")

client = MongoClient(MONGO_URL)

db = client[os.getenv("DB_NAME")]