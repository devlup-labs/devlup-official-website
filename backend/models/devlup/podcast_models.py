from pydantic import BaseModel
from typing import List, Optional

class PodcastPreview(BaseModel):
    podcast_id: str
    podcast_title: str
    podcast_subtitle: str
    podcast_tags: List[str]
    podcast_thumbnail: str
    podcast_author: str
    podcast_date: str


class Podcast(PodcastPreview):
    podcast_media_url: Optional[str] = None
    podcast_external_url: Optional[str] = None