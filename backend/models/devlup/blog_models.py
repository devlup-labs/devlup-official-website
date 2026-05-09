from pydantic import BaseModel
from typing import List, Optional


class BlogPreview(BaseModel):
    blog_id: Optional[str] = None
    blog_title: str
    blog_subtitle: str
    blog_tags: List[str]
    blog_thumbnail: str
    blog_author: str
    blog_date: str


class Blog(BlogPreview):

    # internal or external
    blog_type: str

    # INTERNAL BLOG
    blog_content: Optional[str] = None
    blog_media_url: Optional[str] = None

    # EXTERNAL BLOG
    blog_external_url: Optional[str] = None


class Comment(BaseModel):
    comment_id: Optional[str] = None
    blog_id: str
    comment_text: str
    created_at: Optional[str] = None