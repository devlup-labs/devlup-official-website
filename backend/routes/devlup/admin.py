from fastapi import APIRouter, Depends,HTTPException
from dependencies.auth import admin_required
from database import user_collection
from bson import ObjectId 
router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/dashboard")
def dashboard(user = Depends(admin_required)):
    return {"message": "Welcome Admin"}

@router.get("/users")
async def get_users(user = Depends(admin_required)):
    users = []
    async for u in user_collection.find():
        users.append({"id": str(u["_id"]), "email": u["email"], "role": u["role"]})
    return users

@router.delete("/users/{user_id}")
async def delete_user(user_id: str):
    result = await user_collection.delete_one({"_id": ObjectId(user_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"msg": "User deleted"}