from fastapi import FastAPI
from dotenv import load_dotenv
import os

#  Force load .env from correct path
load_dotenv(dotenv_path=".env")

from api.routes import auth, admin

app = FastAPI()

app.include_router(auth.router)
app.include_router(admin.router)