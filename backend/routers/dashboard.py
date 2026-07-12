from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from database import get_db
from models.admin import AdminUser
from models.news import News
from models.feedback import Feedback
from models.phone import PhoneEntry
from models.event import Event
from models.business import Business
from models.user import User
from routers.auth import get_current_user
from utils.response import success_response

router = APIRouter(prefix="/api/dashboard", tags=["仪表盘"])


@router.get("/stats")
def get_stats(
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    news_count = db.execute(select(func.count()).select_from(News)).scalar() or 0
    feedback_count = db.execute(select(func.count()).select_from(Feedback)).scalar() or 0
    phone_count = db.execute(select(func.count()).select_from(PhoneEntry)).scalar() or 0
    event_count = db.execute(select(func.count()).select_from(Event)).scalar() or 0
    business_count = db.execute(select(func.count()).select_from(Business)).scalar() or 0
    user_count = db.execute(select(func.count()).select_from(User)).scalar() or 0

    return success_response({
        "news_count": news_count,
        "feedback_count": feedback_count,
        "phone_count": phone_count,
        "event_count": event_count,
        "business_count": business_count,
        "user_count": user_count,
    })
