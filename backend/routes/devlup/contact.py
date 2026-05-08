from fastapi import APIRouter, HTTPException
from models.devlup.contact_models import ContactCreate, ContactResponse
from database import db
from datetime import datetime
import uuid

router = APIRouter(
    prefix="/contact",
    tags=["Contact"]
)

#  POST - Submit contact form
@router.post("/", response_model=ContactResponse)
async def submit_contact(data: ContactCreate):
    try:
        contact_data = data.model_dump()

        #  Add ID + timestamp
        contact_data["contact_id"] = str(uuid.uuid4())
        contact_data["created_at"] = datetime.utcnow().isoformat()

        db.contacts.insert_one(contact_data)

        return ContactResponse(message="Query submitted successfully")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


#  GET - Get all contacts
@router.get("/")
async def get_all_contacts():
    try:
        contacts = list(
            db.contacts.find({}, {"_id": 0}).sort("created_at", -1)
        )

        return {
            "success": True,
            "data": contacts,
            "count": len(contacts)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


#  DELETE - Delete contact by ID
@router.delete("/{contact_id}")
async def delete_contact(contact_id: str):
    try:
        result = db.contacts.delete_one({"contact_id": contact_id})

        if result.deleted_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Contact not found"
            )

        return {
            "success": True,
            "message": "Contact deleted successfully"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))