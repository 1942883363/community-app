from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy import select
from sqlalchemy.orm import Session

from database import get_db
from models.admin import AdminUser
from schemas.auth import LoginRequest, TokenResponse, UserInfo
from utils.auth import verify_password, create_access_token, verify_token
from utils.response import success_response, error_response

router = APIRouter(prefix="/api/auth", tags=["认证管理"])


def get_current_user(
    authorization: str = Header(None), db: Session = Depends(get_db)
) -> AdminUser:
    if not authorization:
        raise HTTPException(status_code=401, detail="未提供认证令牌")
    token = authorization.replace("Bearer ", "")
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="认证令牌无效或已过期")
    user_id = payload.get("user_id")
    if user_id is None:
        raise HTTPException(status_code=401, detail="认证令牌无效")
    stmt = select(AdminUser).where(AdminUser.id == user_id)
    user = db.execute(stmt).scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=401, detail="用户不存在")
    return user


@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    stmt = select(AdminUser).where(AdminUser.username == req.username)
    user = db.execute(stmt).scalar_one_or_none()
    if user is None or not verify_password(req.password, user.password_hash):
        return error_response(401, "用户名或密码错误")
    access_token = create_access_token(data={"user_id": user.id, "username": user.username})
    return success_response(
        {"access_token": access_token, "token_type": "bearer"}
    )


@router.get("/me")
def get_me(current_user: AdminUser = Depends(get_current_user)):
    user_info = UserInfo.model_validate(current_user)
    return success_response(user_info.model_dump())
