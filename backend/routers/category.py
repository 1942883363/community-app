from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from database import get_db
from models.admin import AdminUser
from models.category import Category
from models.news import News
from routers.auth import get_current_user
from schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from utils.response import success_response, error_response

router = APIRouter(prefix="/api/categories", tags=["资讯分类"])


def build_category_tree(categories: List[Category]) -> List[dict]:
    category_dict = {}
    roots = []
    for cat in categories:
        cat_dict = {
            "id": cat.id,
            "name": cat.name,
            "parent_id": cat.parent_id,
            "sort_order": cat.sort_order,
            "children": [],
            "created_at": cat.created_at,
            "updated_at": cat.updated_at,
        }
        category_dict[cat.id] = cat_dict
    for cat in categories:
        if cat.parent_id and cat.parent_id in category_dict:
            category_dict[cat.parent_id]["children"].append(category_dict[cat.id])
        else:
            roots.append(category_dict[cat.id])
    return roots


@router.get("")
def get_categories(
    parent_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    stmt = select(Category).order_by(Category.sort_order)
    if parent_id is not None:
        stmt = stmt.where(Category.parent_id == parent_id)
    categories = db.execute(stmt).scalars().all()
    if parent_id is not None:
        result = [CategoryResponse.model_validate(c).model_dump() for c in categories]
    else:
        result = build_category_tree(categories)
    return success_response(result)


@router.post("")
def create_category(
    data: CategoryCreate,
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    category = Category(
        name=data.name,
        parent_id=data.parent_id,
        sort_order=data.sort_order,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return success_response(CategoryResponse.model_validate(category).model_dump(), "创建成功")


@router.put("/{category_id}")
def update_category(
    category_id: int,
    data: CategoryUpdate,
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stmt = select(Category).where(Category.id == category_id)
    category = db.execute(stmt).scalar_one_or_none()
    if category is None:
        return error_response(404, "分类不存在")
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(category, key, value)
    db.commit()
    db.refresh(category)
    return success_response(CategoryResponse.model_validate(category).model_dump(), "更新成功")


@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stmt = select(Category).where(Category.id == category_id)
    category = db.execute(stmt).scalar_one_or_none()
    if category is None:
        return error_response(404, "分类不存在")
    news_count = db.execute(
        select(func.count()).select_from(News).where(News.category_id == category_id)
    ).scalar()
    if news_count and news_count > 0:
        return error_response(400, "该分类下存在资讯，无法删除")
    sub_count = db.execute(
        select(func.count()).select_from(Category).where(Category.parent_id == category_id)
    ).scalar()
    if sub_count and sub_count > 0:
        return error_response(400, "该分类下存在子分类，无法删除")
    db.delete(category)
    db.commit()
    return success_response(message="删除成功")
