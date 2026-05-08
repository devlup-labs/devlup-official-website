from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from database import user_collection
from core.security import verify_password, create_access_token, hash_password
import os

router = APIRouter()

#  LOGIN
@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await user_collection.find_one({"email": form_data.username})

    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({
        "id": str(user["_id"]),
        "role": user["role"]
    })

    return {"access_token": token, "token_type": "bearer"}


#CREATE ADMIN (run once)
@router.get("/create-admin")
async def create_admin():
    email = os.getenv("ADMIN_EMAIL")
    password = os.getenv("ADMIN_PASSWORD")

    if not email or not password:
        raise HTTPException(status_code=500, detail="Env not set")

    # prevent duplicates
    existing = await user_collection.find_one({"email": email})
    if existing:
        return {"msg": "Admin already exists"}

    hashed = hash_password(password)

    await user_collection.insert_one({
        "email": email,
        "password": hashed,
        "role": "admin"
    })

    return {"msg": "Admin created"}