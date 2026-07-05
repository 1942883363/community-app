from datetime import datetime, date
from typing import Optional

from pydantic import BaseModel


class EventCreate(BaseModel):
    title: str
    content: str
    cover_image: str = ""
    event_date: date
    event_time: str = ""
    address: str = ""
    max_participants: int = 0
    status: int = 1


class EventUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    cover_image: Optional[str] = None
    event_date: Optional[date] = None
    event_time: Optional[str] = None
    address: Optional[str] = None
    max_participants: Optional[int] = None
    status: Optional[int] = None


class EventResponse(BaseModel):
    id: int
    title: str
    content: str
    cover_image: str
    event_date: date
    event_time: str
    address: str
    max_participants: int
    enrolled_count: int = 0
    status: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class RegistrationCreate(BaseModel):
    user_name: str = ""
    user_phone: str = ""
    remark: str = ""


class RegistrationResponse(BaseModel):
    id: int
    event_id: int
    user_id: int
    user_name: str
    user_phone: str
    remark: str
    created_at: datetime

    class Config:
        from_attributes = True
