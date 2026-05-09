from fastapi import APIRouter, HTTPException, status, UploadFile, File, Form
from database import db
from models.devlup.podcast_models import Podcast
from services.image import upload_image
from services.media import upload_media
import uuid

router = APIRouter(prefix="/podcasts", tags=["Podcasts"])


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_podcast(

    podcast_title: str = Form(...),
    podcast_subtitle: str = Form(...),
    podcast_author: str = Form(...),
    podcast_date: str = Form(...),

    podcast_tags: str = Form(...),

    thumbnail: UploadFile = File(...),
    podcast_file: UploadFile = File(None),
    podcast_external_url: str = Form(None)

):

    thumbnail_url = upload_image(thumbnail)

    podcast_media_url = None

    if podcast_file is not None:
      podcast_media_url = upload_media(podcast_file)

    if podcast_file is None and not podcast_external_url:
     raise HTTPException(
        status_code=400,
        detail="Either podcast file or external link is required"
    )

    generated_id = str(uuid.uuid4())

    tags_list = [
        tag.strip()
        for tag in podcast_tags.split(",")
        if tag.strip()
    ]

    podcast = Podcast(
        podcast_id=generated_id,
        podcast_title=podcast_title,
        podcast_subtitle=podcast_subtitle,
        podcast_tags=tags_list,
        podcast_thumbnail=thumbnail_url,
        podcast_author=podcast_author,
        podcast_date=podcast_date,
        podcast_media_url=podcast_media_url,
        podcast_external_url=podcast_external_url
    )

    db.podcasts.insert_one(podcast.model_dump())

    return {
        "success": True,
        "message": "Podcast created",
        "podcast_id": generated_id
    }

# GET all podcasts
@router.get("/")
def get_podcasts():
    # Convert cursor to list and exclude internal MongoDB _id
  #  REMOVE podcast_url from exclusion
    podcasts = list(db.podcasts.find({}, {"_id": 0}))
    return {
        "success": True,
        "data": podcasts,
        "message": "Podcasts fetched"
    }

# GET single podcast
@router.get("/{podcast_id}")
def get_podcast(podcast_id: str):
    podcast = db.podcasts.find_one({"podcast_id": podcast_id}, {"_id": 0})
    if not podcast:
        raise HTTPException(status_code=404, detail="Podcast not found")
    
    return {
        "success": True,
        "data": podcast,
        "message": "Podcast fetched"
    }

# UPDATE podcast (blog-style partial update)
@router.put("/{podcast_id}")
def update_podcast(

    podcast_id: str,

    podcast_title: str = Form(None),
    podcast_subtitle: str = Form(None),
    podcast_author: str = Form(None),
    podcast_date: str = Form(None),

    podcast_tags: str = Form(None),

    podcast_external_url: str = Form(None),

    podcast_file: UploadFile = File(None),
    thumbnail: UploadFile = File(None)

):

    existing_podcast = db.podcasts.find_one(
        {"podcast_id": podcast_id},
        {"_id": 0}
    )

    if not existing_podcast:
        raise HTTPException(
            status_code=404,
            detail="Podcast not found"
        )

    update_data = {}

    if podcast_title is not None:
        update_data["podcast_title"] = podcast_title

    if podcast_subtitle is not None:
        update_data["podcast_subtitle"] = podcast_subtitle

    if podcast_author is not None:
        update_data["podcast_author"] = podcast_author

    if podcast_date is not None:
        update_data["podcast_date"] = podcast_date

    if podcast_tags is not None:
        update_data["podcast_tags"] = [
            tag.strip()
            for tag in podcast_tags.split(",")
            if tag.strip()
        ]

    if podcast_external_url is not None:
        update_data["podcast_external_url"] = podcast_external_url

    if podcast_file is not None:
        update_data["podcast_media_url"] = upload_media(podcast_file)

    if thumbnail is not None:
        update_data["podcast_thumbnail"] = upload_image(thumbnail)

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No fields provided for update"
        )

    db.podcasts.update_one(
        {"podcast_id": podcast_id},
        {"$set": update_data}
    )

    updated_podcast = db.podcasts.find_one(
        {"podcast_id": podcast_id},
        {"_id": 0}
    )

    return {
        "success": True,
        "data": updated_podcast,
        "message": "Podcast updated"
    }

# DELETE podcast
@router.delete("/{podcast_id}")
def delete_podcast(podcast_id: str):
    result = db.podcasts.delete_one({"podcast_id": podcast_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Podcast not found")
        
    return {
        "success": True,
        "message": "Podcast deleted"
    }