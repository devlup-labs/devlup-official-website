from fastapi import APIRouter, HTTPException
from datetime import datetime
import requests
import xml.etree.ElementTree as ET
from apscheduler.schedulers.background import BackgroundScheduler
import os

from database import db

router = APIRouter(prefix="/videos", tags=["Videos"])

CHANNEL_ID = "UCFaRxxB8-BB5GXH-wlwGqIw"
RSS_URL = f"https://www.youtube.com/feeds/videos.xml?channel_id={CHANNEL_ID}"

video_collection = db["videos"]


#  RSS parser
def fetch_rss_videos():
    try:
        res = requests.get(RSS_URL, timeout=10)
        res.raise_for_status()
        root = ET.fromstring(res.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    ns = {
        "atom": "http://www.w3.org/2005/Atom",
        "yt": "http://www.youtube.com/xml/schemas/2015",
        "media": "http://search.yahoo.com/mrss/"
    }

    videos = []

    for entry in root.findall("atom:entry", ns):
        try:
            def safe_text(node, path, ns, default=""):
                el = node.find(path, ns)
                return el.text if el is not None and el.text  else default
            video_id = safe_text(entry, "yt:videoId", ns)
            title = safe_text(entry, "atom:title", ns)
            link_node = entry.find("atom:link", ns)
            link = link_node.attrib.get("href") if link_node is not None else ""
            published = safe_text(entry, "atom:published", ns)
            updated = safe_text(entry, "atom:updated", ns)
            author = safe_text(entry, "atom:author/atom:name", ns)
            
            description = ""
            thumbnail = None

            media_group = entry.find("media:group", ns)


            if media_group is not None:
             desc = media_group.find("media:description", ns)
             if desc is not None and desc.text:
               description = desc.text

               thumb_node = media_group.find("media:thumbnail", ns)
               if thumb_node is not None:
                 thumbnail = thumb_node.attrib.get("url")
              

            videos.append({
                "videoId": video_id,
                "title": title,
                "link": link,
                "published": published,
                "updated": updated,
                "author": author,
                "thumbnail": thumbnail,
                "description": description,
                "source": "rss", 
                "fetchedAt": datetime.utcnow()
            })

        except Exception as e:
            print("RSS parse error:", e)

    return videos


#  UPDATE
@router.post("/update")
def update_videos():
    rss_videos = fetch_rss_videos()

    new_count = 0
    updated_count = 0
    unchanged_count = 0

    for video in rss_videos:
        existing = video_collection.find_one({"videoId": video["videoId"]})

        #  New video
        if not existing:
            video_collection.update_one(
                {"videoId": video["videoId"]},
                {"$set": video},
                upsert=True
            )
            new_count += 1
            print(f"New video added: {video['title']}")
            continue

        # Check if anything changed
        changes = {}
        fields = ["title", "link", "published", "updated", "author", "thumbnail", "description"]

        for field in fields:
            if existing.get(field) != video.get(field):
                changes[field] = {
                    "old": existing.get(field),
                    "new": video.get(field)
                }

        #  If changes exist → update
        if changes:
            video_collection.update_one(
                {"videoId": video["videoId"]},
                {"$set": {
                    "title": video["title"],
                    "link": video["link"],
                    "published": video["published"],
                    "updated": video["updated"],
                    "author": video["author"],
                    "thumbnail": video["thumbnail"],
                    "description": video["description"],
                    "source": "rss",
                    "fetchedAt": datetime.utcnow()
                }}
            )

            updated_count += 1
            print(f" Updated: {video['title']} -> Changes: {list(changes.keys())}")

        else:
            unchanged_count += 1

    # Final response
    if updated_count == 0 and new_count == 0:
        print(" Nothing has updated")

    return {
        "status": "success",
        "new": new_count,
        "updated": updated_count,
        "unchanged": unchanged_count
    }

#  GET all videos
@router.get("/")
def get_videos():
    videos = list(
        video_collection.find({"hidden": {"$ne": True}}, {"_id": 0}).sort("published", -1)
    )
    return videos


#  GET video IDs
@router.get("/ids")
async def get_video_ids():
    videos = []

    cursor = video_collection.find(
        {"hidden": {"$ne": True}},   # ignore hidden videos
        {"videoId": 1, "category": 1, "title": 1, "_id": 0}
    )

    for doc in cursor:
        if doc.get("videoId"):
            videos.append({
                "videoId": doc["videoId"],
                "category": doc.get("category", ""),
                "title": doc.get("title", "")
            })

    return videos

@router.put("/category/{video_id}")
def update_video_category(video_id: str, category: str):
    category = category.strip().lower()  #  normalize

    result = video_collection.update_one(
        {"videoId": video_id},
        {"$set": {"category": category}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Video not found")

    return {"status": "success", "category": category}

# RSS preview
@router.get("/rss-preview")
def preview_rss():
    return fetch_rss_videos()


#  Stats
@router.get("/stats")
def get_stats():
    total = video_collection.count_documents({})
    return {"total_videos": total}

#delete
@router.delete("/{video_id}")
def delete_video(video_id: str):

    video = video_collection.find_one({
        "$or": [
            {"videoId": video_id},
            {"video_id": video_id}
        ]
    })

    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

  

    #  SOFT DELETE (HIDE)
    video_collection.update_one(
        {"videoId": video_id},
        {"$set": {"hidden": True}}
    )

    return {
        "status": "success",
        "message": "Video hidden successfully"
    }

@router.patch("/restore/{video_id}")
def restore_video(video_id: str):

    result = video_collection.update_one(
        {"videoId": video_id},
        {"$set": {"hidden": False}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Video not found")

    return {
        "status": "success",
        "message": "Video restored successfully"
    }
#  Scheduler (simple + correct)
def auto_update():
    try:
        print("Running video update...")
        update_videos()
        print("Update done")
    except Exception as e:
        print("Scheduler error:", e)


if os.environ.get("RUN_MAIN") == "true":
    scheduler = BackgroundScheduler()
    scheduler.add_job(auto_update, "interval", hours=1)
    scheduler.start()