import os
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, Header, Query, UploadFile
from sqlalchemy import select, func, desc
from sqlalchemy.orm import Session

from config import settings
from database import get_db
from models.admin import AdminUser
from models.feedback import Feedback
from routers.auth import get_current_user
from schemas.feedback import FeedbackUpdate, FeedbackResponse
from utils.response import success_response, error_response, paginated_response
from utils.user_service import get_or_create_user
from utils.sanitize import sanitize_html

router = APIRouter(prefix="/api/feedback", tags=["意见反馈"])


@router.post("")
async def create_feedback(
    title: str = Form(...),
    content: str = Form(...),
    x_user_id: str = Header(None, alias="X-User-Id"),
    user_name: str = Form(""),
    contact: str = Form(""),
    images: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    if not x_user_id:
        return error_response(400, "缺少用户标识")

    user = get_or_create_user(db, x_user_id, user_name)

    image_urls = ""
    if images:
        os.makedirs(os.path.join(settings.UPLOAD_DIR, "images"), exist_ok=True)
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
        filename = f"feedback_{timestamp}_{images.filename}"
        filepath = os.path.join(settings.UPLOAD_DIR, "images", filename)
        content_bytes = await images.read()
        with open(filepath, "wb") as f:
            f.write(content_bytes)
        image_urls = f"/uploads/images/{filename}"

    feedback = Feedback(
        user_id=user.id,
        title=title,
        content=sanitize_html(content),
        images=image_urls,
        contact=contact,
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return success_response(FeedbackResponse.model_validate(feedback).model_dump(), "提交成功")


@router.get("")
def get_feedback_list(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[int] = Query(None),
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    base_query = select(Feedback)
    count_query = select(func.count()).select_from(Feedback)
    if status is not None:
        base_query = base_query.where(Feedback.status == status)
        count_query = count_query.where(Feedback.status == status)

    total = db.execute(count_query).scalar() or 0
    stmt = base_query.order_by(desc(Feedback.created_at)).offset((page - 1) * page_size).limit(page_size)
    feedbacks = db.execute(stmt).scalars().all()
    items = [FeedbackResponse.model_validate(f).model_dump() for f in feedbacks]
    return paginated_response(items=items, total=total, page=page, page_size=page_size)


@router.get("/my")
def get_my_feedback(
    x_user_id: str = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db),
):
    if not x_user_id:
        return error_response(400, "缺少用户标识")
    user = get_or_create_user(db, x_user_id)
    stmt = select(Feedback).where(Feedback.user_id == user.id).order_by(desc(Feedback.created_at))
    feedbacks = db.execute(stmt).scalars().all()
    items = [FeedbackResponse.model_validate(f).model_dump() for f in feedbacks]
    return success_response(items)


@router.get("/{feedback_id}")
def get_feedback_detail(
    feedback_id: int,
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stmt = select(Feedback).where(Feedback.id == feedback_id)
    feedback = db.execute(stmt).scalar_one_or_none()
    if feedback is None:
        return error_response(404, "反馈不存在")
    return success_response(FeedbackResponse.model_validate(feedback).model_dump())


@router.put("/{feedback_id}/status")
def update_feedback_status(
    feedback_id: int,
    data: FeedbackUpdate,
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stmt = select(Feedback).where(Feedback.id == feedback_id)
    feedback = db.execute(stmt).scalar_one_or_none()
    if feedback is None:
        return error_response(404, "反馈不存在")
    feedback.status = data.status
    feedback.reply = data.reply or feedback.reply
    feedback.handler_id = current_user.id
    feedback.handled_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(feedback)
    return success_response(FeedbackResponse.model_validate(feedback).model_dump(), "处理成功")
