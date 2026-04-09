from pydantic import BaseModel
from typing import List, Optional

class VideoCreate(BaseModel):
    video_id: str

class VideoPreview(BaseModel):
    video_id: str
    video_title: str
    video_tags: List[str]
    video_thumbnail: str
    video_date: str

class Video(VideoPreview):
    video_url: Optional[str] = None