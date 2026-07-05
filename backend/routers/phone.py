from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from database import get_db
from models.admin import AdminUser
from models.phone import PhoneCategory, PhoneEntry
from routers.auth import get_current_user
from schemas.phone import (
    PhoneCategoryCreate,
    PhoneCategoryUpdate,
    PhoneCategoryResponse,
    PhoneEntryCreate,
    PhoneEntryUpdate,
    PhoneEntryResponse,
)
from utils.response import success_response, error_response

router = APIRouter(prefix="/api", tags=["便民电话"])


@router.get("/phone-categories")
def get_phone_categories(db: Session = Depends(get_db)):
    stmt = select(PhoneCategory).order_by(PhoneCategory.sort_order)
    categories = db.execute(stmt).scalars().all()
    return success_response(
        [PhoneCategoryResponse.model_validate(c).model_dump() for c in categories]
    )


@router.post("/phone-categories")
def create_phone_category(
    data: PhoneCategoryCreate,
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    pc = PhoneCategory(name=data.name, sort_order=data.sort_order)
    db.add(pc)
    db.commit()
    db.refresh(pc)
    return success_response(PhoneCategoryResponse.model_validate(pc).model_dump(), "创建成功")


@router.put("/phone-categories/{category_id}")
def update_phone_category(
    category_id: int,
    data: PhoneCategoryUpdate,
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stmt = select(PhoneCategory).where(PhoneCategory.id == category_id)
    pc = db.execute(stmt).scalar_one_or_none()
    if pc is None:
        return error_response(404, "分类不存在")
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(pc, key, value)
    db.commit()
    db.refresh(pc)
    return success_response(PhoneCategoryResponse.model_validate(pc).model_dump(), "更新成功")


@router.delete("/phone-categories/{category_id}")
def delete_phone_category(
    category_id: int,
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stmt = select(PhoneCategory).where(PhoneCategory.id == category_id)
    pc = db.execute(stmt).scalar_one_or_none()
    if pc is None:
        return error_response(404, "分类不存在")
    db.delete(pc)
    db.commit()
    return success_response(message="删除成功")


@router.get("/phone-entries")
def get_phone_entries(
    category_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    stmt = select(PhoneEntry).order_by(PhoneEntry.sort_order)
    if category_id is not None:
        stmt = stmt.where(PhoneEntry.category_id == category_id)
    entries = db.execute(stmt).scalars().all()
    return success_response(
        [PhoneEntryResponse.model_validate(e).model_dump() for e in entries]
    )


@router.post("/phone-entries")
def create_phone_entry(
    data: PhoneEntryCreate,
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = PhoneEntry(
        category_id=data.category_id,
        name=data.name,
        phone=data.phone,
        address=data.address,
        description=data.description,
        sort_order=data.sort_order,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return success_response(PhoneEntryResponse.model_validate(entry).model_dump(), "创建成功")


@router.put("/phone-entries/{entry_id}")
def update_phone_entry(
    entry_id: int,
    data: PhoneEntryUpdate,
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stmt = select(PhoneEntry).where(PhoneEntry.id == entry_id)
    entry = db.execute(stmt).scalar_one_or_none()
    if entry is None:
        return error_response(404, "条目不存在")
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(entry, key, value)
    db.commit()
    db.refresh(entry)
    return success_response(PhoneEntryResponse.model_validate(entry).model_dump(), "更新成功")


@router.delete("/phone-entries/{entry_id}")
def delete_phone_entry(
    entry_id: int,
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stmt = select(PhoneEntry).where(PhoneEntry.id == entry_id)
    entry = db.execute(stmt).scalar_one_or_none()
    if entry is None:
        return error_response(404, "条目不存在")
    db.delete(entry)
    db.commit()
    return success_response(message="删除成功")
