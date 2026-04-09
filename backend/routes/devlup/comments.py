from fastapi import APIRouter, HTTPException, status
from datetime import datetime
from database import db
from models.devlup.blog_models import Comment
import uuid

router = APIRouter(prefix="/comments", tags=["Comments"])


# POST - Add a comment to a blog
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_comment(comment: Comment):
    """
    Create a comment on a blog with word limit validation.
    """
    # Validate comment length
    comment_length = len(comment.comment_text.split())
    if comment_length > 250:
        raise HTTPException(
            status_code=400,
            detail=f"Comment exceeds 250 words limit. Your comment has {comment_length} words."
        )
    
    # Generate comment ID and timestamp
    comment_data = comment.model_dump(exclude_none=True)
    comment_data["comment_id"] = str(uuid.uuid4())
    comment_data["created_at"] = datetime.utcnow().isoformat()
    
    try:
        # Save to database
        result = db.comments.insert_one(comment_data)
        print(f"[COMMENT] Comment inserted successfully: blog_id={comment_data['blog_id']}, comment_id={comment_data['comment_id']}")
        
        return {
            "success": True,
            "message": "Comment posted successfully"
        }
    except Exception as e:
        print(f"[ERROR] Failed to insert comment: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save comment: {str(e)}"
        )

# GET - Get all comments (for admin panel)
@router.get("/admin/all")
def get_all_comments():
    """
    Get all comments from all blogs (admin only).
    """
    try:
        comments = list(
            db.comments.find(
                {},
                {"_id": 0}
            ).sort("created_at", -1)
        )
        
        print(f"[COMMENT] Retrieved {len(comments)} total comments for admin")
        
        return {
            "success": True,
            "data": comments,
            "message": f"Retrieved {len(comments)} comment(s)"
        }
    except Exception as e:
        print(f"[ERROR] Failed to retrieve comments: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve comments: {str(e)}"
        )



# GET - Retrieve all comments for a blog
@router.get("/{blog_id}")
def get_blog_comments(blog_id: str):
    """
    Get all comments for a specific blog, sorted by most recent first.
    """
    try:
        comments = list(
            db.comments.find(
                {"blog_id": blog_id},
                {"_id": 0}
            ).sort("created_at", -1)
        )
        
        print(f"[COMMENT] Retrieved {len(comments)} comments for blog {blog_id}")
        
        return {
            "success": True,
            "data": comments,
            "message": f"Retrieved {len(comments)} comment(s)"
        }
    except Exception as e:
        print(f"[ERROR] Failed to retrieve comments: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve comments: {str(e)}"
        )


# DELETE - Delete a comment
@router.delete("/delete/{comment_id}")
def delete_comment(comment_id: str):
    """
    Delete a comment by ID.
    """
    try:
        result = db.comments.delete_one({"comment_id": comment_id})
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=404,
                detail=f"Comment not found: {comment_id}"
            )
        
        print(f"[COMMENT] Comment deleted: {comment_id}")
        
        return {
            "success": True,
            "message": "Comment deleted successfully"
        }
    except Exception as e:
        print(f"[ERROR] Failed to delete comment: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete comment: {str(e)}"
        )


