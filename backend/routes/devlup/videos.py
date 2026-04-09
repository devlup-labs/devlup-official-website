from fastapi import APIRouter, HTTPException, status
from database import db
from models.devlup.video_models import VideoCreate

import requests
import os

router = APIRouter(prefix="/videos", tags=["Videos"])

API_KEY = os.getenv("YOUTUBE_API_KEY")


# 🔹 Fetch from YouTube
def fetch_youtube_data(video_ids: list):
    url = "https://www.googleapis.com/youtube/v3/videos"
    params = {
        "part": "snippet",
        "id": ",".join(video_ids),  # ✅ multiple IDs
        "key": API_KEY
    }

    try:
        res = requests.get(url, params=params)
        res.raise_for_status()
        data = res.json()
    except Exception:
        return []

    videos = []

    for item in data.get("items", []):
        snippet = item["snippet"]

        thumbnails = snippet.get("thumbnails", {})
        thumbnail_url = (
            thumbnails.get("medium", {}).get("url")
            or thumbnails.get("high", {}).get("url")
            or thumbnails.get("default", {}).get("url")
        )

        videos.append({
            "video_id": item["id"],
            "video_title": snippet.get("title"),
            "video_tags": snippet.get("tags", []),
            "video_thumbnail": thumbnail_url,
            "video_date": snippet.get("publishedAt"),
            "video_url": f"https://www.youtube.com/watch?v={item['id']}"
        })

    return videos


# 🔹 CREATE (store only ID)
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_video(video: VideoCreate):

    existing = db.videos.find_one({"video_id": video.video_id})
    if existing:
        raise HTTPException(status_code=400, detail="Video already exists")

    db.videos.insert_one({"video_id": video.video_id})

    return {
        "success": True,
        "message": "Video ID stored"
    }


# 🔹 GET all videos (FETCH LIVE DATA)
@router.get("/")
def get_videos():

    video_docs = list(db.videos.find({}, {"_id": 0}))
    video_ids = [v["video_id"] for v in video_docs]

    if not video_ids:
        return {
            "success": True,
            "data": [],
            "message": "No videos found"
        }

    videos = fetch_youtube_data(video_ids)

    return {
        "success": True,
        "data": videos,
        "message": "Videos fetched from YouTube"
    }


# 🔹 GET single video
@router.get("/{video_id}")
def get_video(video_id: str):

    exists = db.videos.find_one({"video_id": video_id})
    if not exists:
        raise HTTPException(status_code=404, detail="Video not found")

    video = fetch_youtube_data([video_id])

    if not video:
        raise HTTPException(status_code=400, detail="Invalid YouTube video")

    return {
        "success": True,
        "data": video[0],
        "message": "Video fetched"
    }


# 🔹 DELETE
@router.delete("/{video_id}")
def delete_video(video_id: str):
    result = db.videos.delete_one({"video_id": video_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Video not found")

    return {
        "success": True,
        "message": "Video deleted"
    }