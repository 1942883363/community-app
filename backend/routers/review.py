from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, desc
from sqlalchemy.orm import Session

from database import get_db
from models.admin import AdminUser
from models.image_review import ImageReview
from routers.auth import get_current_user
from utils.response import success_response, error_response, paginated_response

router = APIRouter(prefix="/api/reviews", tags=["图片审核"])

STATUS_MAP = {0: "待审核", 1: "已通过", 2: "已拒绝"}


def _build_item(r: ImageReview) -> dict:
    return {
        "id": r.id,
        "owner_type": r.owner_type,
        "owner_id": r.owner_id,
        "url": r.url,
        "status": r.status,
        "status_text": STATUS_MAP.get(r.status, "未知"),
        "reviewer_id": r.reviewer_id,
        "reject_reason": r.reject_reason,
        "created_at": r.created_at.isoformat() if r.created_at else "",
        "updated_at": r.updated_at.isoformat() if r.updated_at else "",
    }


@router.get("")
def get_reviews(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[int] = Query(None),
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    base_query = select(ImageReview)
    count_query = select(func.count()).select_from(ImageReview)
    if status is not None:
        base_query = base_query.where(ImageReview.status == status)
        count_query = count_query.where(ImageReview.status == status)

    total = db.execute(count_query).scalar() or 0
    stmt = base_query.order_by(desc(ImageReview.created_at)).offset((page - 1) * page_size).limit(page_size)
    reviews = db.execute(stmt).scalars().all()
    items = [_build_item(r) for r in reviews]
    return paginated_response(items=items, total=total, page=page, page_size=page_size)


@router.put("/{review_id}/approve")
def approve_review(
    review_id: int,
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stmt = select(ImageReview).where(ImageReview.id == review_id)
    review = db.execute(stmt).scalar_one_or_none()
    if review is None:
        return error_response(404, "审核记录不存在")
    review.status = 1
    review.reviewer_id = current_user.id
    review.reject_reason = ""
    db.commit()
    return success_response(_build_item(review), "审核通过")


@router.put("/{review_id}/reject")
def reject_review(
    review_id: int,
    reason: str = Query("", description="拒绝原因"),
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stmt = select(ImageReview).where(ImageReview.id == review_id)
    review = db.execute(stmt).scalar_one_or_none()
    if review is None:
        return error_response(404, "审核记录不存在")
    review.status = 2
    review.reviewer_id = current_user.id
    review.reject_reason = reason or "违规内容"
    db.commit()
    return success_response(_build_item(review), "已拒绝")


@router.get("/check")
def check_url_approved(
    url: str = Query(..., description="图片URL"),
    db: Session = Depends(get_db),
):
    stmt = select(ImageReview).where(ImageReview.url == url).order_by(desc(ImageReview.id))
    review = db.execute(stmt).scalars().first()
    if review is None:
        return success_response({"approved": False, "reason": "not_found"})
    return success_response({
        "approved": review.status == 1,
        "status": review.status,
        "status_text": STATUS_MAP.get(review.status, "未知"),
        "reason": review.reject_reason if review.status == 2 else "",
    })
