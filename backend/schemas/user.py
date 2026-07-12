from datetime import datetime
from typing import Optional

from pydantic import BaseModel, field_validator


class UserUpdate(BaseModel):
    nickname: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None
    password: Optional[str] = None


class UserRegister(BaseModel):
    mode: str = "register"
    nickname: str
    phone: str
    password: str
    avatar: Optional[str] = ""

    @field_validator("mode")
    @classmethod
    def validate_mode(cls, v: str) -> str:
        if v not in ("register",):
            raise ValueError("mode 必须为 register")
        return v


class UserLogin(BaseModel):
    mode: str = "login"
    phone: str
    password: str

    @field_validator("mode")
    @classmethod
    def validate_mode(cls, v: str) -> str:
        if v not in ("login",):
            raise ValueError("mode 必须为 login")
        return v


class UserUpdateSelf(BaseModel):
    nickname: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None
    password: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    openid: str
    nickname: str
    phone: str
    avatar: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
