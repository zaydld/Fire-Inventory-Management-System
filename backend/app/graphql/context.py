from typing import Optional
from graphql import GraphQLError
from sqlalchemy import select

from app.core.jwt_decode import decode_token
from app.db.session import SessionLocal
from app.models.user import User


def get_current_user_from_request(request) -> Optional[User]:
    auth = request.headers.get("authorization") or request.headers.get("Authorization")
    if not auth:
        return None

    if not auth.lower().startswith("bearer "):
        return None

    token = auth.split(" ", 1)[1].strip()
    if not token:
        return None

    try:
        payload = decode_token(token)
    except Exception:
        return None

    user_id = payload.get("userId")
    if not user_id:
        return None

    db = SessionLocal()
    try:
        user = db.execute(select(User).where(User.id == user_id)).scalar_one_or_none()
        return user
    finally:
        db.close()


def require_user(info) -> User:
    request = info.context["request"]
    user = get_current_user_from_request(request)
    if not user:
        # message demandé par le cahier
        raise GraphQLError("Unauthorized")
    return user
