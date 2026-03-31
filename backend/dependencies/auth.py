from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
import os

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"


def admin_required(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Not authorized")

        return payload

    except Exception as e:
        print("JWT ERROR:", e)  # ADD THIS
        raise HTTPException(status_code=401, detail="Invalid token")