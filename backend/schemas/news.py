from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class NewsCreate(BaseModel):
    title: str
    content: str
    summary: str = ""
    cover_image: str = ""
    category_id: int
    status: int = 1
    is_top: int = 0


class NewsUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    summary: Optional[str] = None
    cover_image: Optional[str] = None
    category_id: Optional[int] = None
    status: Optional[int] = None
    is_top: Optional[int] = None


class NewsResponse(BaseModel):
    id: int
    title: str
    content: str
    summary: str
    cover_image: str
    category_id: int
    status: int
    is_top: int
    view_count: int
    like_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NewsListItem(BaseModel):
    id: int
    title: str
    summary: str
    cover_image: str
    category_id: int
    status: int
    is_top: int
    view_count: int
    like_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
