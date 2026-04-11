from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from routes.devlup import blogs
from routes.devlup import videos
from routes.devlup import podcasts
from routes.devlup import team
from routes.devlup import timeline
from routes.devlup import auth, admin
from routes.devlup import comments
from routes.devlup import contact

#  Force load .env from correct path
load_dotenv(dotenv_path=".env")
app = FastAPI(redirect_slashes=True) #  It allows clients to access the same resource with or without a trailing slash (e.g., /items and /items/) without receiving a 404 Not Found error.

# 1. Define your allowed origins
origins = [
    "http://localhost:3000",  # React default
    "http://localhost:5173",  # Vite default
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",  # Vite default
    "http://127.0.0.1:5174",  # Alternate port
    "*",  # Allow all origins for development
]

# 2. Add CORS middleware FIRST (before routes)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,           # Allows specific origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],             # Allows all headers
)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(blogs.router)
app.include_router(videos.router)
app.include_router(podcasts.router)
app.include_router(team.router)
app.include_router(timeline.router)
app.include_router(comments.router)
app.include_router(contact.router)