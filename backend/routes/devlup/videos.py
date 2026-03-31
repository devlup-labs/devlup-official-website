from fastapi import APIRouter, HTTPException, status
from database import db
from models.devlup.video_models import Video, VideoPreview

router = APIRouter(prefix="/videos", tags=["Videos"])


# CREATE video
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_video(video: Video):
    db.videos.insert_one(video.model_dump())

    return {
        "success": True,
        "message": "Video created"
    }


# GET all videos (preview)
@router.get("/")
def get_videos():
    videos = list(
        db.videos.find({}, {"_id": 0, "video_url": 0})
    )

    return {
        "success": True,
        "data": videos,
        "message": "Videos fetched"
    }


# GET single video
@router.get("/{video_id}")
def get_video(video_id: str):
    video = db.videos.find_one({"video_id": video_id}, {"_id": 0})

    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    return {
        "success": True,
        "data": video,
        "message": "Video fetched"
    }


# UPDATE video
@router.put("/{video_id}")
def update_video(video_id: str, video: Video):
    result = db.videos.update_one(
        {"video_id": video_id},
        {"$set": video.model_dump(exclude_unset=True)}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Video not found")

    return {
        "success": True,
        "message": "Video updated"
    }


# DELETE video
@router.delete("/{video_id}")
def delete_video(video_id: str):
    result = db.videos.delete_one({"video_id": video_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Video not found")

    return {
        "success": True,
        "message": "Video deleted"
    }