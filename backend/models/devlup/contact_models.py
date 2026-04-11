from pydantic import BaseModel, EmailStr, Field

class ContactCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    query: str = Field(..., min_length=5, max_length=1000)


class ContactResponse(BaseModel):
    message: str