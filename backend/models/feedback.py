from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import BigInteger, String, Integer, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class Feedback(Base):
    __tablename__ = "feedback"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    images: Mapped[str] = mapped_column(String(2000), default="")
    contact: Mapped[str] = mapped_column(String(100), default="")
    status: Mapped[int] = mapped_column(Integer, default=0)
    reply: Mapped[Optional[str]] = mapped_column(Text, default=None)
    handler_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("admin_users.id", ondelete="SET NULL"), default=None)
    handled_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=None)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), server_default=func.now(), onupdate=func.now()
    )
