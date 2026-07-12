from datetime import datetime, timezone

from sqlalchemy import BigInteger, String, Integer, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class ImageReview(Base):
    __tablename__ = "image_reviews"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    owner_type: Mapped[str] = mapped_column(String(30), nullable=False, comment="所属类型: user_avatar/business_logo/feedback_image")
    owner_id: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0, comment="关联对象ID")
    url: Mapped[str] = mapped_column(String(500), nullable=False, comment="图片URL")
    status: Mapped[int] = mapped_column(Integer, default=0, comment="0:待审核 1:已通过 2:已拒绝")
    reviewer_id: Mapped[int] = mapped_column(BigInteger, nullable=True, default=None, comment="审核人ID")
    reject_reason: Mapped[str] = mapped_column(String(200), default="", comment="拒绝原因")
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), server_default=func.now(), onupdate=func.now()
    )
