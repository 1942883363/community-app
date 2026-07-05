from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class FeedbackCreate(BaseModel):
    user_name: str = ""
    title: str
    content: str
    images: str = ""
    contact: str = ""


class FeedbackUpdate(BaseModel):
    status: int
    reply: str = ""


class FeedbackResponse(BaseModel):
    id: int
    user_id: int
    title: str
    content: str
    images: str
    contact: str
    status: int
    reply: Optional[str] = None
    handler_id: Optional[int] = None
    handled_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
