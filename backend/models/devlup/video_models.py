from pydantic import BaseModel
from typing import List, Optional

class Video(BaseModel):
    video_id: str
    video_title: str
    video_tags: List[str]
    video_thumbnail: str
    video_date: str
    video_url: Optional[str] = None

class VideoPreview(Video):
    video_url: Optional[str] = None