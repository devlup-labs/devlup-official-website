from pydantic import BaseModel
from typing import List, Optional

class Blog(BaseModel):
    blog_id: str
    blog_title: str
    blog_subtitle: str
    blog_tags: List[str]
    blog_thumbnail: str
    blog_author: str
    blog_date: str

    blog_type: str  # "internal" or "external"

    blog_content: Optional[str] = None
    blog_url: Optional[str] = None