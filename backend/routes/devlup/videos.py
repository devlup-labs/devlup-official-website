from fastapi import APIRouter
from database import db
from models.devlup.video_models import Video

router = APIRouter()

# CREATE video
@router.post("/videos")
def create_video(video: Video):
    db.videos.insert_one(video.dict())
    return {
        "success": True,
        "data": [],
        "message": "Video added"
    }

# GET all videos
@router.get("/videos")
def get_videos():
    videos = list(db.videos.find({}, {"_id": 0}))
    return {
        "success": True,
        "data": videos,
        "message": "Videos fetched"
    }

# GET single video
@router.get("/videos/{video_id}")
def get_video(video_id: str):
    video = db.videos.find_one({"video_id": video_id}, {"_id": 0})
    return {
        "success": True,
        "data": video,
        "message": "Video fetched"
    }

# UPDATE video
@router.put("/videos/{video_id}")
def update_video(video_id: str, updated_data: dict):
    db.videos.update_one(
        {"video_id": video_id},
        {"$set": updated_data}
    )
    return {
        "success": True,
        "data": [],
        "message": "Video updated"
    }

# DELETE video
@router.delete("/videos/{video_id}")
def delete_video(video_id: str):
    db.videos.delete_one({"video_id": video_id})
    return {
        "success": True,
        "data": [],
        "message": "Video deleted"
    }