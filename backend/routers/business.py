from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from database import get_db
from models.admin import AdminUser
from models.business import BusinessCategory, Business
from routers.auth import get_current_user
from schemas.business import (
    BusinessCategoryCreate,
    BusinessCategoryUpdate,
    BusinessCategoryResponse,
    BusinessCreate,
    BusinessUpdate,
    BusinessResponse,
)
from utils.response import success_response, error_response

router = APIRouter(prefix="/api", tags=["周边商家"])


@router.get("/business-categories")
def get_business_categories(db: Session = Depends(get_db)):
    stmt = select(BusinessCategory).order_by(BusinessCategory.sort_order)
    categories = db.execute(stmt).scalars().all()
    return success_response(
        [BusinessCategoryResponse.model_validate(c).model_dump() for c in categories]
    )


@router.post("/business-categories")
def create_business_category(
    data: BusinessCategoryCreate,
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    bc = BusinessCategory(name=data.name, icon=data.icon, sort_order=data.sort_order)
    db.add(bc)
    db.commit()
    db.refresh(bc)
    return success_response(BusinessCategoryResponse.model_validate(bc).model_dump(), "创建成功")


@router.put("/business-categories/{category_id}")
def update_business_category(
    category_id: int,
    data: BusinessCategoryUpdate,
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stmt = select(BusinessCategory).where(BusinessCategory.id == category_id)
    bc = db.execute(stmt).scalar_one_or_none()
    if bc is None:
        return error_response(404, "分类不存在")
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(bc, key, value)
    db.commit()
    db.refresh(bc)
    return success_response(BusinessCategoryResponse.model_validate(bc).model_dump(), "更新成功")


@router.delete("/business-categories/{category_id}")
def delete_business_category(
    category_id: int,
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stmt = select(BusinessCategory).where(BusinessCategory.id == category_id)
    bc = db.execute(stmt).scalar_one_or_none()
    if bc is None:
        return error_response(404, "分类不存在")
    db.delete(bc)
    db.commit()
    return success_response(message="删除成功")


@router.get("/businesses")
def get_businesses(
    category_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    stmt = select(Business).order_by(Business.sort_order)
    if category_id is not None:
        stmt = stmt.where(Business.category_id == category_id)
    businesses = db.execute(stmt).scalars().all()
    return success_response(
        [BusinessResponse.model_validate(b).model_dump() for b in businesses]
    )


@router.post("/businesses")
def create_business(
    data: BusinessCreate,
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    business = Business(
        category_id=data.category_id,
        name=data.name,
        logo=data.logo,
        description=data.description,
        address=data.address,
        phone=data.phone,
        business_hours=data.business_hours,
        sort_order=data.sort_order,
        status=data.status,
    )
    db.add(business)
    db.commit()
    db.refresh(business)
    return success_response(BusinessResponse.model_validate(business).model_dump(), "创建成功")


@router.put("/businesses/{business_id}")
def update_business(
    business_id: int,
    data: BusinessUpdate,
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stmt = select(Business).where(Business.id == business_id)
    business = db.execute(stmt).scalar_one_or_none()
    if business is None:
        return error_response(404, "商家不存在")
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(business, key, value)
    db.commit()
    db.refresh(business)
    return success_response(BusinessResponse.model_validate(business).model_dump(), "更新成功")


@router.delete("/businesses/{business_id}")
def delete_business(
    business_id: int,
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stmt = select(Business).where(Business.id == business_id)
    business = db.execute(stmt).scalar_one_or_none()
    if business is None:
        return error_response(404, "商家不存在")
    db.delete(business)
    db.commit()
    return success_response(message="删除成功")
