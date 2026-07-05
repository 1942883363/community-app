from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel


class CategoryCreate(BaseModel):
    name: str
    parent_id: Optional[int] = None
    sort_order: int = 0


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    parent_id: Optional[int] = None
    sort_order: Optional[int] = None


class CategoryResponse(BaseModel):
    id: int
    name: str
    parent_id: Optional[int] = None
    sort_order: int
    children: List["CategoryResponse"] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
