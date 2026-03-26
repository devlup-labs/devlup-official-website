from fastapi import APIRouter
from database import db
from models.devlup.podcast_models import (
    Podcast,
    PodcastPreview
)

router = APIRouter()

# CREATE podcast
@router.post("/podcasts")
def create_podcast(podcast: Podcast):
    db.podcasts.insert_one(podcast.dict())

    return {
        "success": True,
        "data": None,
        "message": "Podcast created"
    }

# GET all podcasts
@router.get("/podcasts", response_model=list[PodcastPreview])
def get_podcasts():
    podcasts = list(db.podcasts.find({}, {"_id": 0},{"podcast_url": 0}))
    return {
        "success": True,
        "data": podcasts,
        "message": "Podcasts fetched"
    }

# GET single podcast
@router.get("/podcasts/{podcast_id}",response_model=Podcast)
def get_podcast(podcast_id: str):
    podcast = db.podcasts.find_one({"podcast_id": podcast_id}, {"_id": 0})
    if not podcast:
        return {
            "success": False,
            "data": None,
            "message": "Podcast not found"
        }
    return {
        "success": True,
        "data": podcast,
        "message": "Podcast fetched"
    }

# UPDATE podcast
@router.put("/podcasts/{podcast_id}")
def update_podcast(podcast_id: str, podcast: Podcast):
    result = db.podcasts.update_one(
        {"podcast_id": podcast_id},
        {"$set": podcast.dict()}
    )
    if result.matched_count == 0:
        return {
            "success": False,
            "data": None,
            "message": "Podcast not found"
        }
    return {
        "success": True,
        "data": [],
        "message": "Podcast updated"
    }

# DELETE podcast
@router.delete("/podcasts/{podcast_id}")
def delete_podcast(podcast_id: str):
    result = db.podcasts.delete_one({"podcast_id": podcast_id})
    if result.deleted_count == 0:
        return {
            "success": False,
            "data": None,
            "message": "Podcast not found"
        }
    return {
        "success": True,
        "data": [],
        "message": "Podcast deleted"
    }