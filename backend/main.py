from fastapi import FastAPI
from routes.devlup import blogs
from routes.devlup import videos
from routes.devlup import podcasts

app = FastAPI()

app.include_router(blogs.router)
app.include_router(videos.router)
app.include_router(podcasts.router)