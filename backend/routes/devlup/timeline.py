from fastapi import APIRouter, HTTPException, status
from database import db
from models.devlup.timeline_models import Event

router = APIRouter(prefix="/timeline", tags=["Timeline"])


# CREATE event
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_event(event: Event):
    db.timeline.insert_one(event.model_dump())

    return {
        "success": True,
        "message": "Event created"
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
def update_event(event_id: str, event: Event):
    result = db.timeline.update_one(
        {"event_id": event_id},
        {"$set": event.model_dump(exclude_unset=True)}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")

    return {
        "success": True,
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