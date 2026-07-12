from typing import Optional

from fastapi import APIRouter, Depends, Header, Query
from sqlalchemy import select, func, desc, or_
from sqlalchemy.orm import Session

from database import get_db
from models.admin import AdminUser
from models.user import User
from routers.auth import get_current_user
from utils.password import pwd_context
from routers.upload import is_image_approved
from schemas.user import UserUpdate, UserUpdateSelf, UserResponse, UserRegister, UserLogin
from utils.response import success_response, error_response, paginated_response

router = APIRouter(prefix="/api/users", tags=["用户管理"])


def _filter_avatar(user: User, db: Session) -> dict:
    data = UserResponse.model_validate(user).model_dump()
    if data["avatar"] and not is_image_approved(db, data["avatar"]):
        data["avatar"] = ""
    data["is_registered"] = bool(user.nickname and user.nickname.strip())
    return data


def _build_empty_user(openid: str) -> dict:
    return {
        "id": 0,
        "openid": openid,
        "nickname": "",
        "phone": "",
        "avatar": "",
        "created_at": "",
        "updated_at": "",
        "is_registered": False,
    }


def _update_user_fields(user: User, data: dict) -> None:
    for key, value in data.items():
        if value is not None and value != "":
            setattr(user, key, value)


@router.get("/me")
def get_self(
    x_user_id: str = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db),
):
    if not x_user_id:
        return error_response(400, "缺少用户标识")
    user = db.execute(
        select(User).where(User.openid == x_user_id)
    ).scalar_one_or_none()
    if user is None:
        return success_response(_build_empty_user(x_user_id))
    return success_response(_filter_avatar(user, db))


@router.put("/me")
def update_self(
    data: UserUpdateSelf,
    x_user_id: str = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db),
):
    if not x_user_id:
        return error_response(400, "缺少用户标识")
    user = db.execute(
        select(User).where(User.openid == x_user_id)
    ).scalar_one_or_none()
    if user is None:
        return error_response(404, "用户不存在，请先注册")
    update_data = data.model_dump(exclude_unset=True)
    if "password" in update_data and update_data["password"]:
        raw = update_data.pop("password").strip()
        if len(raw) >= 6:
            user.password_hash = pwd_context.hash(raw)
    _update_user_fields(user, update_data)
    db.commit()
    db.refresh(user)
    return success_response(_filter_avatar(user, db), "更新成功")


@router.get("/search")
def search_users(
    keyword: str = Query(..., min_length=1, description="按昵称搜索"),
    x_user_id: str = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db),
):
    like_pattern = f"%{keyword}%"
    stmt = select(User).where(
        User.nickname.like(like_pattern),
        User.nickname != ""
    ).limit(20)
    users = db.execute(stmt).scalars().all()
    items = [{"id": u.id, "nickname": u.nickname, "phone_mask": _mask_phone(u.phone)} for u in users]
    return success_response(items)


def _mask_phone(phone: str) -> str:
    if not phone or len(phone) < 7:
        return phone or ""
    return phone[:3] + "****" + phone[-4:]


@router.put("/register")
def register_user(
    data: UserRegister,
    x_user_id: str = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db),
):
    if not x_user_id:
        return error_response(400, "缺少用户标识")

    nickname = data.nickname.strip()
    phone = data.phone.strip()
    password = data.password.strip() if data.password else ""

    if not nickname:
        return error_response(400, "昵称不能为空")
    if not phone or len(phone) != 11:
        return error_response(400, "请输入正确的11位手机号")
    if not password or len(password) < 6:
        return error_response(400, "密码至少6位")

    existing = db.execute(
        select(User).where(User.nickname == nickname)
    ).scalar_one_or_none()
    if existing is not None:
        return error_response(409, "该昵称已被注册，请换一个")

    phone_existing = db.execute(
        select(User).where(User.phone == phone)
    ).scalar_one_or_none()
    if phone_existing is not None:
        return error_response(409, "该手机号已被注册")

    current = db.execute(
        select(User).where(User.openid == x_user_id)
    ).scalar_one_or_none()
    if current is not None:
        current.openid = ""
        db.flush()

    user = User(openid=x_user_id, nickname=nickname, phone=phone)
    user.password_hash = pwd_context.hash(password)
    if data.avatar:
        user.avatar = data.avatar
    db.add(user)
    db.commit()
    db.refresh(user)
    return success_response(_filter_avatar(user, db), "注册成功")


@router.post("/login")
def login_user(
    data: UserLogin,
    x_user_id: str = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db),
):
    if not x_user_id:
        return error_response(400, "缺少用户标识")

    phone = data.phone.strip()
    password = data.password.strip() if data.password else ""

    if not phone or len(phone) != 11:
        return error_response(400, "请输入正确的11位手机号")
    if not password:
        return error_response(400, "请输入密码")

    target = db.execute(
        select(User).where(User.phone == phone)
    ).scalar_one_or_none()

    if target is None:
        return error_response(404, "该手机号未注册，请先注册")

    if not target.password_hash:
        return error_response(400, "密码错误")

    if not pwd_context.verify(password, target.password_hash):
        return error_response(400, "密码错误")

    current = db.execute(
        select(User).where(User.openid == x_user_id)
    ).scalar_one_or_none()

    if current is not None and current.id == target.id:
        return success_response(_filter_avatar(target, db), "登录成功")

    if current is not None:
        current.openid = ""
        db.flush()

    target.openid = x_user_id
    db.commit()
    db.refresh(target)
    return success_response(_filter_avatar(target, db), "登录成功")


@router.post("/logout")
def logout_user(
    x_user_id: str = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db),
):
    if not x_user_id:
        return error_response(400, "缺少用户标识")
    current = db.execute(
        select(User).where(User.openid == x_user_id)
    ).scalar_one_or_none()
    if current is not None:
        current.openid = ""
        db.commit()
    return success_response(message="已退出")


@router.get("")
def get_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    keyword: Optional[str] = Query(None),
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    base_query = select(User)
    count_query = select(func.count()).select_from(User)

    if keyword:
        like_pattern = f"%{keyword}%"
        base_query = base_query.where(
            (User.nickname.like(like_pattern)) | (User.openid.like(like_pattern))
        )
        count_query = count_query.where(
            (User.nickname.like(like_pattern)) | (User.openid.like(like_pattern))
        )

    total = db.execute(count_query).scalar() or 0
    stmt = base_query.order_by(desc(User.created_at)).offset((page - 1) * page_size).limit(page_size)
    users = db.execute(stmt).scalars().all()
    items = [UserResponse.model_validate(u).model_dump() for u in users]
    return paginated_response(items=items, total=total, page=page, page_size=page_size)


@router.get("/{user_id}")
def get_user(
    user_id: int,
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stmt = select(User).where(User.id == user_id)
    user = db.execute(stmt).scalar_one_or_none()
    if user is None:
        return error_response(404, "用户不存在")
    return success_response(UserResponse.model_validate(user).model_dump())


@router.put("/{user_id}")
def update_user(
    user_id: int,
    data: UserUpdate,
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stmt = select(User).where(User.id == user_id)
    user = db.execute(stmt).scalar_one_or_none()
    if user is None:
        return error_response(404, "用户不存在")
    update_data = data.model_dump(exclude_unset=True)
    if "password" in update_data and update_data["password"]:
        raw = update_data.pop("password").strip()
        if len(raw) >= 6:
            user.password_hash = pwd_context.hash(raw)
    _update_user_fields(user, update_data)
    db.commit()
    db.refresh(user)
    return success_response(UserResponse.model_validate(user).model_dump(), "更新成功")


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stmt = select(User).where(User.id == user_id)
    user = db.execute(stmt).scalar_one_or_none()
    if user is None:
        return error_response(404, "用户不存在")
    db.delete(user)
    db.commit()
    return success_response(message="删除成功")
