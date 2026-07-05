from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class PhoneCategoryCreate(BaseModel):
    name: str
    sort_order: int = 0


class PhoneCategoryUpdate(BaseModel):
    name: Optional[str] = None
    sort_order: Optional[int] = None


class PhoneCategoryResponse(BaseModel):
    id: int
    name: str
    sort_order: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PhoneEntryCreate(BaseModel):
    category_id: int
    name: str
    phone: str
    address: str = ""
    description: str = ""
    sort_order: int = 0


class PhoneEntryUpdate(BaseModel):
    category_id: Optional[int] = None
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    description: Optional[str] = None
    sort_order: Optional[int] = None


class PhoneEntryResponse(BaseModel):
    id: int
    category_id: int
    name: str
    phone: str
    address: str
    description: str
    sort_order: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
