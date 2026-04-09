from fastapi import APIRouter, HTTPException, status
from database import db
from models.devlup.blog_models import Blog, BlogPreview
import uuid

router = APIRouter(prefix="/blogs", tags=["Blogs"])


# CREATE blog
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_blog(blog: Blog):
    blog_data = blog.model_dump()
    blog_data["blog_id"] = str(uuid.uuid4())
    db.blogs.insert_one(blog_data)

    return {
        "success": True,
        "message": "Blog created"
    }


# GET all blogs (preview only)
@router.get("/")
def get_blogs():
    blogs = list(
        db.blogs.find({}, {"_id": 0, "blog_content": 0, "blog_url": 0})
    )

    return {
        "success": True,
        "data": blogs,
        "message": "Blogs fetched"
    }


# GET single blog
@router.get("/{blog_id}")
def get_blog(blog_id: str):
    blog = db.blogs.find_one({"blog_id": blog_id}, {"_id": 0})

    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    return {
        "success": True,
        "data": blog,
        "message": "Blog fetched"
    }


# UPDATE blog
@router.put("/{blog_id}")
def update_blog(blog_id: str, blog: Blog):
    result = db.blogs.update_one(
        {"blog_id": blog_id},
        {"$set": blog.model_dump(exclude_unset=True)}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Blog not found")

    return {
        "success": True,
        "message": "Blog updated"
    }


# DELETE blog
@router.delete("/{blog_id}")
def delete_blog(blog_id: str):
    result = db.blogs.delete_one({"blog_id": blog_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Blog not found")

    return {
        "success": True,
        "message": "Blog deleted"
    }