from fastapi import FastAPI
from dotenv import load_dotenv
import os
from routes.devlup import blogs
from routes.devlup import videos
from routes.devlup import podcasts
from routes.devlup import auth, admin
from fastapi.middleware.cors import CORSMiddleware

#  Force load .env from correct path
load_dotenv(dotenv_path=".env")
app = FastAPI(redirect_slashes=True) #  It allows clients to access the same resource with or without a trailing slash (e.g., /items and /items/) without receiving a 404 Not Found error.

# 1. Define your allowed origins
origins = [
    "http://localhost:3000",  # React default
    "http://localhost:5173",  # Vite default
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",#but our request on this
]

# 2. Add the middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,           # Allows specific origins
    allow_credentials=True,
    allow_methods=["*"],             # Allows GET, POST, OPTIONS, etc.
    allow_headers=["*"],             # Allows all headers
)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(blogs.router)
app.include_router(videos.router)
app.include_router(podcasts.router)