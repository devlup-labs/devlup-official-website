from fastapi import APIRouter, HTTPException, status
from database import db
from models.devlup.team_models import Member, MemberHidden

router = APIRouter(prefix="/team", tags=["Team"])



# CREATE member

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_member(member: Member):

    #  Validate FIRST
    if not member.member_id:
        raise HTTPException(status_code=400, detail="Member ID required")

    # Then insert
    db.team.insert_one(member.model_dump())
    # OR auto-generate:-
    # member.member_id = str(uuid.uuid4())


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
def update_member(member_id: str, member: Member):
    result = db.team.update_one(
        {"member_id": member_id},
        {"$set": member.model_dump(exclude_unset=True)}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Member not found")

    return {
        "success": True,
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