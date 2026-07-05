import os
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, UploadFile, File

from config import settings
from models.admin import AdminUser
from routers.auth import get_current_user
from utils.response import success_response, error_response

router = APIRouter(prefix="/api/upload", tags=["文件上传"])


@router.post("")
async def upload_image(
    file: UploadFile = File(...),
    current_user: AdminUser = Depends(get_current_user),
):
    allowed_types = {"image/jpeg", "image/png", "image/gif", "image/webp"}
    if file.content_type not in allowed_types:
        return error_response(400, "仅支持 JPEG、PNG、GIF、WEBP 格式的图片")

    upload_dir = os.path.join(settings.UPLOAD_DIR, "images")
    os.makedirs(upload_dir, exist_ok=True)

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S%f")
    ext = os.path.splitext(file.filename)[1] or ".jpg"
    filename = f"upload_{timestamp}{ext}"
    filepath = os.path.join(upload_dir, filename)

    content = await file.read()
    with open(filepath, "wb") as f:
        f.write(content)

    url = f"/uploads/images/{filename}"
    return success_response({"url": url, "filename": filename}, "上传成功")
