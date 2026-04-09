from fastapi import APIRouter, HTTPException, status
from database import db
from models.devlup.podcast_models import Podcast, PodcastPreview

router = APIRouter(prefix="/podcasts", tags=["Podcasts"])

# CREATE podcast
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_podcast(podcast: Podcast):
    # .dict() is deprecated in Pydantic v2; use .model_dump() if using newer versions
    db.podcasts.insert_one(podcast.dict())
    return {
        "success": True,
        "message": "Podcast created"
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

# UPDATE podcast
@router.put("/{podcast_id}")
def update_podcast(podcast_id: str, podcast: Podcast):
    result = db.podcasts.update_one(
        {"podcast_id": podcast_id},
        {"$set": podcast.dict(exclude_unset=True)} # exclude_unset prevents overwriting with defaults
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Podcast not found")
        
    return {
        "success": True,
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