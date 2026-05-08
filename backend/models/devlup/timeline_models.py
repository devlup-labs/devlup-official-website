from pydantic import BaseModel
from typing import List


#  Event Model
class Event(BaseModel):
    event_id: str
    event_title: str
    event_subtitle: str
    event_description: str
    event_date: str
    event_photos: List[str]


#  Timeline Response (optional but useful)
class Timeline(BaseModel):
    events: List[Event]