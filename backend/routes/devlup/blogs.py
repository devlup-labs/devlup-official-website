from fastapi import APIRouter, HTTPException, status, UploadFile, File, Form
from database import db
from models.devlup.blog_models import Blog
from services.image import upload_image
from services.media import upload_media
import uuid

router = APIRouter(prefix="/blogs", tags=["Blogs"])


# CREATE blog
@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_blog(

    blog_title: str = Form(...),
    blog_subtitle: str = Form(...),
    blog_tags: str = Form(...),

    blog_author: str = Form(...),
    blog_date: str = Form(...),

    blog_type: str = Form(...),

    blog_content: str = Form(None),

    blog_external_url: str = Form(None),
    blog_media: UploadFile = File(None),

    thumbnail: UploadFile = File(...)

):
    
    media_url = None

    if blog_media is not None:
      media_url = upload_media(blog_media)

    thumbnail_url = upload_image(thumbnail)

    generated_id = str(uuid.uuid4())

    tags_list = [
        tag.strip()
        for tag in blog_tags.split(",")
        if tag.strip()
    ]

    blog = Blog(
        blog_id=generated_id,
        blog_title=blog_title,
        blog_subtitle=blog_subtitle,
        blog_tags=tags_list,
        blog_thumbnail=thumbnail_url,
        blog_author=blog_author,
        blog_date=blog_date,
        blog_type=blog_type,
        blog_content=blog_content,
        blog_media_url=media_url,
        blog_external_url=blog_external_url
    )

    db.blogs.insert_one(blog.model_dump())

    return {
        "success": True,
        "message": "Blog created",
        "blog_id": generated_id
    }


# GET all blogs (preview only)
@router.get("/")
def get_blogs():

    blogs = list(
        db.blogs.find(
            {},
            {
                "_id": 0,
                "blog_content": 0,
                "blog_media_url": 0,
                "blog_external_url": 0
            }
        )
    )

    return {
        "success": True,
        "data": blogs,
        "message": "Blogs fetched"
    }


# GET single blog
@router.get("/{blog_id}")
def get_blog(blog_id: str):

    blog = db.blogs.find_one(
        {"blog_id": blog_id},
        {"_id": 0}
    )

    if not blog:
        raise HTTPException(
            status_code=404,
            detail="Blog not found"
        )

    return {
        "success": True,
        "data": blog,
        "message": "Blog fetched"
    }


# UPDATE blog
@router.put("/{blog_id}")
async def update_blog(

    blog_id: str,

    blog_title: str = Form(None),
    blog_subtitle: str = Form(None),
    blog_tags: str = Form(None),

    blog_author: str = Form(None),
    blog_date: str = Form(None),

    blog_type: str = Form(None),

    blog_content: str = Form(None),

    blog_external_url: str = Form(None),
    blog_media: UploadFile = File(None),

    thumbnail: UploadFile = File(None)

):

    existing_blog = db.blogs.find_one(
        {"blog_id": blog_id},
        {"_id": 0}
    )

    if not existing_blog:
        raise HTTPException(
            status_code=404,
            detail="Blog not found"
        )

    update_data = {}

    if blog_title is not None:
        update_data["blog_title"] = blog_title

    if blog_subtitle is not None:
        update_data["blog_subtitle"] = blog_subtitle

    if blog_tags is not None:

        update_data["blog_tags"] = [
            tag.strip()
            for tag in blog_tags.split(",")
            if tag.strip()
        ]

    if blog_author is not None:
        update_data["blog_author"] = blog_author

    if blog_date is not None:
        update_data["blog_date"] = blog_date

    if blog_type is not None:
        update_data["blog_type"] = blog_type

    if blog_content is not None:
        update_data["blog_content"] = blog_content

    if blog_external_url is not None:
        update_data["blog_external_url"] = blog_external_url

    if blog_media is not None:

        media_url = upload_media(blog_media)

        update_data["blog_media_url"] = media_url

    if thumbnail is not None:

        thumbnail_url = upload_image(thumbnail)

        update_data["blog_thumbnail"] = thumbnail_url

    db.blogs.update_one(
        {"blog_id": blog_id},
        {"$set": update_data}
    )

    updated_blog = db.blogs.find_one(
        {"blog_id": blog_id},
        {"_id": 0}
    )

    return {
        "success": True,
        "data": updated_blog,
        "message": "Blog updated"
    }


# DELETE blog
@router.delete("/{blog_id}")
def delete_blog(blog_id: str):

    result = db.blogs.delete_one(
        {"blog_id": blog_id}
    )

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Blog not found"
        )

    return {
        "success": True,
        "message": "Blog deleted"
    }