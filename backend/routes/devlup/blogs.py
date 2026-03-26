from fastapi import APIRouter
from database import db
from models.devlup.blog_models import Blog

router = APIRouter()

# CREATE blog
@router.post("/blogs")
def create_blog(blog: Blog):
    db.blogs.insert_one(blog.dict())
    return {
        "success": True,
        "data": [],
        "message": "Blog added"
    }

# GET all blogs
@router.get("/blogs")
def get_blogs():
    blogs = list(db.blogs.find({}, {"_id": 0}))
    return {
        "success": True,
        "data": blogs,
        "message": "Blogs fetched"
    }

# GET single blog
@router.get("/blogs/{blog_id}")
def get_blog(blog_id: str):
    blog = db.blogs.find_one({"blog_id": blog_id}, {"_id": 0})
    return {
        "success": True,
        "data": blog,
        "message": "Blog fetched"
    }

# UPDATE blog
@router.put("/blogs/{blog_id}")
def update_blog(blog_id: str, updated_data: dict):
    db.blogs.update_one(
        {"blog_id": blog_id},
        {"$set": updated_data}
    )
    return {
        "success": True,
        "data": [],
        "message": "Blog updated"
    }

# DELETE blog
@router.delete("/blogs/{blog_id}")
def delete_blog(blog_id: str):
    db.blogs.delete_one({"blog_id": blog_id})
    return {
        "success": True,
        "data": [],
        "message": "Blog deleted"
    }