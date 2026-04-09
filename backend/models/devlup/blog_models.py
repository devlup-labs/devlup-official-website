from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class BlogPreview(BaseModel):
    blog_id: str
    blog_title: str
    blog_subtitle: str
    blog_tags: List[str]
    blog_thumbnail: str
    blog_author: str
    blog_date: str

class Blog(BlogPreview):
    blog_type: str  # "internal" or "external"
    blog_content: Optional[str] = None
    blog_url: Optional[str] = None

class Comment(BaseModel):
    comment_id: Optional[str] = None
    blog_id: str
    comment_text: str
    created_at: Optional[str] = None