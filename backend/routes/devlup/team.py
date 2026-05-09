from fastapi import APIRouter, HTTPException, status, UploadFile, File, Form
from database import db
from models.devlup.team_models import Member, MemberHidden
from services.image import upload_image
import uuid

router = APIRouter(prefix="/team", tags=["Team"])



# CREATE member

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_member(

    member_name: str = Form(...),
    member_roll_number: str = Form(...),
    member_designation: str = Form(...),
    member_tag: str = Form(...),
    member_about: str = Form(...),
    member_github_id: str = Form(None),
    member_linkedin: str = Form(None),
    member_email: str = Form(None),

    image: UploadFile = File(...)

):

    image_url = upload_image(image)

    generated_id = str(uuid.uuid4())

    tags_list = [
        tag.strip()
        for tag in member_tag.split(",")
        if tag.strip()
    ]

    member = Member(
        member_id=generated_id,
        member_name=member_name,
        member_image=image_url,
        member_roll_number=member_roll_number,
        member_designation=member_designation,
        member_tag=tags_list,
        member_about=member_about,
        member_github_id=member_github_id,
        member_linkedin=member_linkedin,
        member_email=member_email
    )

    db.team.insert_one(member.model_dump())

    return {
        "success": True,
        "message": "Member created"
    }

# GET all members (public only)
@router.get("/")
def get_members():
    members = list(db.team.find({}, {"_id": 0}))

    return {
        "success": True,
        "data": members,
        "message": "Members fetched"
    }


# GET single member (public)
@router.get("/{member_id}")
def get_member(member_id: str):
    member = db.team.find_one({"member_id": member_id}, {"_id": 0})

    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    return {
        "success": True,
        "data": member,
        "message": "Member fetched"
    }


#  GET member WITH hidden data (special route)
@router.get("/{member_id}/{code}")
def get_member_with_hidden(member_id: str, code: str):
    member = db.team.find_one({"member_id": member_id}, {"_id": 0})
    hidden = db.team_hidden.find_one({"member_id": member_id}, {"_id": 0})

    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    # check code
    if not hidden or hidden.get("member_hidden_code") != code:
        return {
            "success": True,
                "member": member,
                "hidden": None
            ,
            "message": "Invalid code, hidden data not accessible"
        }

    return {
        "success": True,
            "member": member,
            "hidden": hidden,
        "message": "Member full data fetched"
    }


# UPDATE member (public fields)
@router.put("/{member_id}")
async def update_member(

    member_id: str,

    member_name: str = Form(None),
    member_roll_number: str = Form(None),
    member_designation: str = Form(None),
    member_tag: str = Form(None),
    member_about: str = Form(None),
    member_github_id: str = Form(None),
    member_linkedin: str = Form(None),
    member_email: str = Form(None),

    image: UploadFile = File(None)

):

    existing_member = db.team.find_one(
        {"member_id": member_id},
        {"_id": 0}
    )

    if not existing_member:
        raise HTTPException(
            status_code=404,
            detail="Member not found"
        )

    update_data = {}

    if member_name is not None:
        update_data["member_name"] = member_name

    if member_roll_number is not None:
        update_data["member_roll_number"] = member_roll_number

    if member_designation is not None:
        update_data["member_designation"] = member_designation

    if member_tag is not None:
        update_data["member_tag"] = member_tag

    if member_about is not None:
        update_data["member_about"] = member_about

    if member_github_id is not None:
        update_data["member_github_id"] = member_github_id

    if member_linkedin is not None:
        update_data["member_linkedin"] = member_linkedin

    if member_email is not None:
        update_data["member_email"] = member_email

    # Upload new image if provided
    if image is not None:

        image_url = upload_image(image)

        update_data["member_image"] = image_url

    db.team.update_one(
        {"member_id": member_id},
        {"$set": update_data}
    )

    updated_member = db.team.find_one(
        {"member_id": member_id},
        {"_id": 0}
    )

    return {
        "success": True,
        "data": updated_member,
        "message": "Member updated"
    }


@router.delete("/cleanup-empty")
def cleanup_empty():
    result = db.team.delete_many({
        "$or": [
            {"member_id": ""},
            {"member_id": {"$exists": False}}
        ]
    })

    return {
        "deleted": result.deleted_count
    }

# DELETE member
@router.delete("/{member_id}")
def delete_member(member_id: str):
    result = db.team.delete_one({"member_id": member_id})
    db.team_hidden.delete_one({"member_id": member_id})  # also delete hidden

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Member not found")

    return {
        "success": True,
        "message": "Member deleted"
    }



#  CREATE / UPDATE hidden data
@router.post("/hidden/{member_id}")
def create_hidden(member_id: str, hidden: MemberHidden):
    db.team_hidden.update_one(
        {"member_id": member_id},
        {"$set": hidden.model_dump()},
        upsert=True
    )

    return {
        "success": True,
        "message": "Hidden data saved"
    }