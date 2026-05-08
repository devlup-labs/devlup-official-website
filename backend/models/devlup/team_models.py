from pydantic import BaseModel
from typing import List, Optional


#  Contribution Model
class Contribution(BaseModel):
    contribution_id: str
    contribution_title: str
    contribution_description: str


#  Member (Public Data)
class Member(BaseModel):
    member_id: str
    member_name: str
    member_image: str
    member_roll_number: str
    member_designation: str
    member_tag: str
    member_about: str
    member_github_id: Optional[str] = None
    member_linkedin: Optional[str] = None
    member_email: Optional[str] = None


#  Hidden Member Data (protected via code)
class MemberHidden(BaseModel):
    member_hidden_code: str
    member_hidden_avatar: Optional[str] = None
    member_hidden_quote: Optional[str] = None
    member_hidden_contributions: Optional[List[Contribution]] = None
    member_hidden_comments: Optional[List[str]] = None


#  Member Details (for /team/{member_id, code})
class MemberDetails(BaseModel):
    member_id: str
    member_hidden_contributions: List[Contribution]


#  Combined Response Model
class MemberFull(BaseModel):
    member: Member
    hidden: Optional[MemberHidden] = None