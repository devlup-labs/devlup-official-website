import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
# You should use passlib or bcrypt to hash this if your login logic expects it
# from passlib.context import CryptContext 

load_dotenv()
MONGO_URL = os.getenv("MONGO_URL")

async def create_test_user():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client["your_db_name"]
    user_collection = db["users"]
    
    # Check if user already exists
    exists = await user_collection.find_one({"email": "admin@gmail.com"})
    if not exists:
        test_user = {
            "email": "admin@gmail.com",
            "password": "admin123" # Make sure this matches your hashing logic!
        }
        await user_collection.insert_one(test_user)
        print("User created: admin@gmail.com / admin123")
    else:
        print("User already exists.")

if __name__ == "__main__":
    asyncio.run(create_test_user())