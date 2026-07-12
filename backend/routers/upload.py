import os
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, UploadFile, File, Header
from sqlalchemy.orm import Session

from config import settings
from database import get_db
from models.admin import AdminUser
from models.image_review import ImageReview
from routers.auth import get_current_user
from utils.response import success_response, error_response

router = APIRouter(prefix="/api/upload", tags=["文件上传"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}


def _do_upload(file: UploadFile, prefix: str = "upload"):
    upload_dir = os.path.join(settings.UPLOAD_DIR, "images")
    os.makedirs(upload_dir, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S%f")
    ext = os.path.splitext(file.filename)[1] or ".jpg"
    filename = f"{prefix}_{timestamp}{ext}"
    filepath = os.path.join(upload_dir, filename)
    return filename, filepath


def _create_review(db: Session, url: str, owner_type: str, owner_id: int = 0, auto_approve: bool = False):
    status = 1 if auto_approve else 0
    review = ImageReview(owner_type=owner_type, owner_id=owner_id, url=url, status=status)
    db.add(review)
    db.commit()


def create_image_review(db: Session, url: str, owner_type: str, owner_id: int, auto_approve: bool = False):
    if not url:
        return
    _create_review(db, url, owner_type, owner_id, auto_approve)


def is_image_approved(db: Session, url: str) -> bool:
    if not url:
        return True
    from sqlalchemy import select, desc
    existing = db.execute(
        select(ImageReview).where(ImageReview.url == url).order_by(desc(ImageReview.id))
    ).scalars().first()
    if existing is None:
        return True
    return existing.status == 1


@router.post("")
async def upload_image(
    file: UploadFile = File(...),
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if file.content_type not in ALLOWED_TYPES:
        return error_response(400, "仅支持 JPEG、PNG、GIF、WEBP 格式的图片")

    filename, filepath = _do_upload(file, "upload")
    content = await file.read()
    with open(filepath, "wb") as f:
        f.write(content)

    url = f"/uploads/images/{filename}"
    _create_review(db, url, "admin_upload", auto_approve=True)
    return success_response({"url": url, "filename": filename}, "上传成功")


@router.post("/public")
async def upload_public(
    file: UploadFile = File(...),
    x_user_id: str = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db),
):
    content = await file.read()
    if not content:
        return error_response(400, "上传文件为空")

    upload_dir = os.path.join(settings.UPLOAD_DIR, "images")
    os.makedirs(upload_dir, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S%f")
    filename = f"user_{timestamp}.jpg"
    filepath = os.path.join(upload_dir, filename)

    try:
        from PIL import Image
        from io import BytesIO
        img = Image.open(BytesIO(content))
        img = img.convert("RGB")
        img.save(filepath, "JPEG", quality=85)
    except Exception:
        with open(filepath, "wb") as f:
            f.write(content)

    url = f"/uploads/images/{filename}"
    _create_review(db, url, "user_avatar", auto_approve=True)
    return success_response({"url": url, "filename": filename}, "上传成功")
