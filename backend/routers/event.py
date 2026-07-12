from typing import Optional

from fastapi import APIRouter, Depends, Header, Query
from sqlalchemy import select, func, desc
from sqlalchemy.orm import Session

from database import get_db
from models.admin import AdminUser
from models.event import Event, Registration
from routers.auth import get_current_user
from routers.upload import create_image_review, is_image_approved
from schemas.event import (
    EventCreate,
    EventUpdate,
    EventResponse,
    RegistrationCreate,
    RegistrationResponse,
)
from utils.response import success_response, error_response, paginated_response
from utils.user_service import get_or_create_user
from utils.sanitize import sanitize_html

router = APIRouter(prefix="/api/events", tags=["社区活动"])


def _get_enrolled_count(db: Session, event_id: int) -> int:
    stmt = select(func.count()).select_from(Registration).where(Registration.event_id == event_id)
    return db.execute(stmt).scalar() or 0


def _build_event_response(event: Event, db: Session) -> dict:
    data = EventResponse.model_validate(event).model_dump()
    data["enrolled_count"] = _get_enrolled_count(db, event.id)
    if data["cover_image"] and not is_image_approved(db, data["cover_image"]):
        data["cover_image"] = ""
    return data


@router.get("")
def get_events(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    base_query = select(Event)
    count_query = select(func.count()).select_from(Event)
    if status is not None:
        base_query = base_query.where(Event.status == status)
        count_query = count_query.where(Event.status == status)

    total = db.execute(count_query).scalar() or 0
    stmt = base_query.order_by(desc(Event.created_at)).offset((page - 1) * page_size).limit(page_size)
    events = db.execute(stmt).scalars().all()
    items = [_build_event_response(e, db) for e in events]
    return paginated_response(items=items, total=total, page=page, page_size=page_size)


@router.get("/my")
def get_my_events(
    x_user_id: str = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db),
):
    if not x_user_id:
        return error_response(400, "缺少用户标识")
    user = get_or_create_user(db, x_user_id)
    stmt = (
        select(Event)
        .join(Registration, Event.id == Registration.event_id)
        .where(Registration.user_id == user.id)
        .order_by(desc(Event.event_date))
    )
    events = db.execute(stmt).scalars().all()
    items = [_build_event_response(e, db) for e in events]
    return success_response(items)


@router.get("/{event_id}")
def get_event_detail(event_id: int, db: Session = Depends(get_db)):
    stmt = select(Event).where(Event.id == event_id)
    event = db.execute(stmt).scalar_one_or_none()
    if event is None:
        return error_response(404, "活动不存在")
    return success_response(_build_event_response(event, db))


@router.post("")
def create_event(
    data: EventCreate,
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    event = Event(
        title=data.title,
        content=sanitize_html(data.content),
        cover_image=data.cover_image,
        event_date=data.event_date,
        event_time=data.event_time,
        address=data.address,
        max_participants=data.max_participants,
        status=data.status,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    create_image_review(db, data.cover_image, "event_cover", event.id, auto_approve=True)
    return success_response(_build_event_response(event, db), "创建成功")


@router.put("/{event_id}")
def update_event(
    event_id: int,
    data: EventUpdate,
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stmt = select(Event).where(Event.id == event_id)
    event = db.execute(stmt).scalar_one_or_none()
    if event is None:
        return error_response(404, "活动不存在")
    update_data = data.model_dump(exclude_unset=True)
    if "content" in update_data:
        update_data["content"] = sanitize_html(update_data["content"])
    for key, value in update_data.items():
        setattr(event, key, value)
    if "cover_image" in update_data:
        create_image_review(db, update_data["cover_image"], "event_cover", event.id, auto_approve=True)
    db.commit()
    db.refresh(event)
    return success_response(_build_event_response(event, db), "更新成功")


@router.delete("/{event_id}")
def delete_event(
    event_id: int,
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stmt = select(Event).where(Event.id == event_id)
    event = db.execute(stmt).scalar_one_or_none()
    if event is None:
        return error_response(404, "活动不存在")
    db.delete(event)
    db.commit()
    return success_response(message="删除成功")


@router.post("/{event_id}/register")
def register_event(
    event_id: int,
    data: RegistrationCreate,
    x_user_id: str = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db),
):
    if not x_user_id:
        return error_response(400, "缺少用户标识")

    user = get_or_create_user(db, x_user_id, data.user_name, data.user_phone)

    stmt = select(Event).where(Event.id == event_id).with_for_update()
    event = db.execute(stmt).scalar_one_or_none()
    if event is None:
        return error_response(404, "活动不存在")

    if event.status != 1:
        return error_response(400, "当前活动未开放报名")

    registered_count = _get_enrolled_count(db, event_id)
    if event.max_participants > 0 and registered_count >= event.max_participants:
        return error_response(400, "报名名额已满")

    existing = db.execute(
        select(Registration).where(
            Registration.event_id == event_id, Registration.user_id == user.id
        )
    ).scalar_one_or_none()
    if existing:
        return error_response(400, "您已报名该活动")

    registration = Registration(
        event_id=event_id,
        user_id=user.id,
        user_name=data.user_name or user.nickname,
        user_phone=data.user_phone or user.phone,
        remark=data.remark,
    )
    db.add(registration)
    db.commit()
    db.refresh(registration)
    return success_response(
        RegistrationResponse.model_validate(registration).model_dump(), "报名成功"
    )


@router.post("/{event_id}/cancel")
def cancel_registration(
    event_id: int,
    x_user_id: str = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db),
):
    """取消报名：直接删除报名记录，用户可重新报名"""
    if not x_user_id:
        return error_response(400, "缺少用户标识")

    user = get_or_create_user(db, x_user_id)
    existing = db.execute(
        select(Registration).where(
            Registration.event_id == event_id, Registration.user_id == user.id
        )
    ).scalar_one_or_none()

    if existing is None:
        return error_response(404, "未找到报名记录")

    db.delete(existing)
    db.commit()
    return success_response(message="已取消报名")


@router.get("/{event_id}/registrations")
def get_event_registrations(
    event_id: int,
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stmt = select(Registration).where(Registration.event_id == event_id).order_by(Registration.created_at)
    registrations = db.execute(stmt).scalars().all()
    items = [RegistrationResponse.model_validate(r).model_dump() for r in registrations]
    return success_response(items)
