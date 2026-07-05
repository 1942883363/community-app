from sqlalchemy import select
from sqlalchemy.orm import Session

from models.user import User


def get_or_create_user(db: Session, openid: str, nickname: str = "", phone: str = "") -> User:
    if not openid:
        raise ValueError("openid 不能为空")

    stmt = select(User).where(User.openid == openid)
    user = db.execute(stmt).scalar_one_or_none()

    if user is None:
        user = User(openid=openid, nickname=nickname, phone=phone)
        db.add(user)
        db.commit()
        db.refresh(user)
    elif nickname and user.nickname != nickname:
        user.nickname = nickname
    if phone and user.phone != phone:
        user.phone = phone

    return user
