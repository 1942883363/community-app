from typing import Optional

from fastapi import APIRouter, Depends, Header, Query
from sqlalchemy import select, func, desc
from sqlalchemy.orm import Session

from database import get_db
from models.admin import AdminUser
from models.news import News, NewsLike
from routers.auth import get_current_user
from routers.upload import create_image_review, is_image_approved
from schemas.news import NewsCreate, NewsUpdate, NewsResponse, NewsListItem
from utils.response import success_response, error_response, paginated_response
from utils.user_service import get_or_create_user
from utils.sanitize import sanitize_html

router = APIRouter(prefix="/api/news", tags=["资讯管理"])


@router.get("")
def get_news_list(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category_id: Optional[int] = Query(None),
    status: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    base_query = select(News)
    count_query = select(func.count()).select_from(News)

    if category_id is not None:
        base_query = base_query.where(News.category_id == category_id)
        count_query = count_query.where(News.category_id == category_id)
    if status is not None:
        base_query = base_query.where(News.status == status)
        count_query = count_query.where(News.status == status)

    total = db.execute(count_query).scalar() or 0
    stmt = base_query.order_by(desc(News.is_top), desc(News.created_at)).offset((page - 1) * page_size).limit(page_size)
    news_list = db.execute(stmt).scalars().all()
    items = []
    for n in news_list:
        item = NewsListItem.model_validate(n).model_dump()
        if item["cover_image"] and not is_image_approved(db, item["cover_image"]):
            item["cover_image"] = ""
        items.append(item)

    return paginated_response(items=items, total=total, page=page, page_size=page_size)


@router.get("/my-likes")
def get_my_likes(
    x_user_id: str = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db),
):
    if not x_user_id:
        return success_response([])
    user = get_or_create_user(db, x_user_id)

    stmt = (
        select(News)
        .join(NewsLike, News.id == NewsLike.news_id)
        .where(NewsLike.user_id == user.id)
        .order_by(desc(NewsLike.created_at))
    )
    news_list = db.execute(stmt).scalars().all()
    items = [{"id": n.id, "title": n.title} for n in news_list]
    return success_response(items)


@router.get("/{news_id}")
def get_news_detail(news_id: int, db: Session = Depends(get_db)):
    stmt = select(News).where(News.id == news_id)
    news = db.execute(stmt).scalar_one_or_none()
    if news is None:
        return error_response(404, "资讯不存在")
    news.view_count += 1
    db.commit()
    db.refresh(news)
    return success_response(NewsResponse.model_validate(news).model_dump())


@router.post("")
def create_news(
    data: NewsCreate,
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    news = News(
        title=data.title,
        content=sanitize_html(data.content),
        summary=data.summary,
        cover_image=data.cover_image,
        category_id=data.category_id,
        status=data.status,
        is_top=data.is_top,
    )
    db.add(news)
    db.commit()
    db.refresh(news)
    create_image_review(db, data.cover_image, "news_cover", news.id, auto_approve=True)
    return success_response(NewsResponse.model_validate(news).model_dump(), "创建成功")


@router.put("/{news_id}")
def update_news(
    news_id: int,
    data: NewsUpdate,
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stmt = select(News).where(News.id == news_id)
    news = db.execute(stmt).scalar_one_or_none()
    if news is None:
        return error_response(404, "资讯不存在")
    update_data = data.model_dump(exclude_unset=True)
    if "content" in update_data:
        update_data["content"] = sanitize_html(update_data["content"])
    for key, value in update_data.items():
        setattr(news, key, value)
    if "cover_image" in update_data:
        create_image_review(db, update_data["cover_image"], "news_cover", news.id, auto_approve=True)
    db.commit()
    db.refresh(news)
    return success_response(NewsResponse.model_validate(news).model_dump(), "更新成功")


@router.delete("/{news_id}")
def delete_news(
    news_id: int,
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stmt = select(News).where(News.id == news_id)
    news = db.execute(stmt).scalar_one_or_none()
    if news is None:
        return error_response(404, "资讯不存在")
    db.delete(news)
    db.commit()
    return success_response(message="删除成功")


@router.post("/{news_id}/like")
def like_news(
    news_id: int,
    x_user_id: str = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db),
):
    if not x_user_id:
        return error_response(400, "缺少用户标识")
    user = get_or_create_user(db, x_user_id)

    stmt = select(News).where(News.id == news_id)
    news = db.execute(stmt).scalar_one_or_none()
    if news is None:
        return error_response(404, "资讯不存在")

    existing = db.execute(
        select(NewsLike).where(NewsLike.news_id == news_id, NewsLike.user_id == user.id)
    ).scalar_one_or_none()
    if existing:
        db.delete(existing)
        news.like_count = max(0, news.like_count - 1)
        db.commit()
        return success_response({"liked": False, "like_count": news.like_count}, "取消点赞")
    like = NewsLike(news_id=news_id, user_id=user.id)
    db.add(like)
    news.like_count += 1
    db.commit()
    return success_response({"liked": True, "like_count": news.like_count}, "点赞成功")


@router.get("/{news_id}/like-status")
def get_like_status(
    news_id: int,
    x_user_id: str = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db),
):
    if not x_user_id:
        return success_response({"liked": False, "like_count": 0})
    user = get_or_create_user(db, x_user_id)

    stmt = select(News).where(News.id == news_id)
    news = db.execute(stmt).scalar_one_or_none()
    if news is None:
        return error_response(404, "资讯不存在")
    existing = db.execute(
        select(NewsLike).where(NewsLike.news_id == news_id, NewsLike.user_id == user.id)
    ).scalar_one_or_none()
    return success_response({"liked": existing is not None, "like_count": news.like_count})
