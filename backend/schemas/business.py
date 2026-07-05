from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class BusinessCategoryCreate(BaseModel):
    name: str
    icon: str = ""
    sort_order: int = 0


class BusinessCategoryUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None
    sort_order: Optional[int] = None


class BusinessCategoryResponse(BaseModel):
    id: int
    name: str
    icon: str
    sort_order: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BusinessCreate(BaseModel):
    category_id: int
    name: str
    logo: str = ""
    description: str = ""
    address: str = ""
    phone: str = ""
    business_hours: str = ""
    sort_order: int = 0
    status: int = 1


class BusinessUpdate(BaseModel):
    category_id: Optional[int] = None
    name: Optional[str] = None
    logo: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    business_hours: Optional[str] = None
    sort_order: Optional[int] = None
    status: Optional[int] = None


class BusinessResponse(BaseModel):
    id: int
    category_id: int
    name: str
    logo: str
    description: Optional[str] = None
    address: str
    phone: str
    business_hours: str
    sort_order: int
    status: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
