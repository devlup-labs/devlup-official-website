from fastapi import APIRouter, HTTPException, status, File, Form
from database import db
from models.devlup.timeline_models import Event
import uuid

router = APIRouter(prefix="/timeline", tags=["Timeline"])


# CREATE event (clean, no tags)
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_event(

    event_title: str = Form(...),
    event_subtitle: str = Form(...),
    event_description: str = Form(...),
    event_date: str = Form(...),

):

    event_id = str(uuid.uuid4())

    event = Event(
        event_id=event_id,
        event_title=event_title,
        event_subtitle=event_subtitle,
        event_description=event_description,
        event_date=event_date
    )

    db.timeline.insert_one(event.model_dump())

    return {
        "success": True,
        "message": "Event created",
        "event_id": event_id
    }


# GET all events
@router.get("/")
def get_events():
    events = list(db.timeline.find({}, {"_id": 0}))

    return {
        "success": True,
        "data": events,
        "message": "Timeline fetched"
    }


# GET single event
@router.get("/{event_id}")
def get_event(event_id: str):
    event = db.timeline.find_one({"event_id": event_id}, {"_id": 0})

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    return {
        "success": True,
        "data": event,
        "message": "Event fetched"
    }


# UPDATE event 
@router.put("/{event_id}")
async def update_event(

    event_id: str,

    event_title: str = Form(None),
    event_subtitle: str = Form(None),
    event_description: str = Form(None),
    event_date: str = Form(None),

):

    existing_event = db.timeline.find_one(
        {"event_id": event_id},
        {"_id": 0}
    )

    if not existing_event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    update_data = {}

    if event_title is not None:
        update_data["event_title"] = event_title

    if event_subtitle is not None:
        update_data["event_subtitle"] = event_subtitle

    if event_description is not None:
        update_data["event_description"] = event_description

    if event_date is not None:
        update_data["event_date"] = event_date

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No fields provided for update"
        )

    db.timeline.update_one(
        {"event_id": event_id},
        {"$set": update_data}
    )

    updated_event = db.timeline.find_one(
        {"event_id": event_id},
        {"_id": 0}
    )

    return {
        "success": True,
        "data": updated_event,
        "message": "Event updated"
    }


# DELETE event
@router.delete("/{event_id}")
def delete_event(event_id: str):
    result = db.timeline.delete_one({"event_id": event_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")

    return {
        "success": True,
        "message": "Event deleted"
    }