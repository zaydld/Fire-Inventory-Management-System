from datetime import datetime, timedelta, timezone
from jose import jwt

from app.core.settings import settings


def _require_jwt_secret() -> str:
    if not settings.JWT_SECRET or not settings.JWT_SECRET.strip():
        # Erreur demandée par le cahier des charges
        raise RuntimeError("JWT secret is missing")
    return settings.JWT_SECRET


def create_access_token(user_id: str, username: str, role: str) -> str:
    """
    Crée un JWT signé contenant:
    - userId
    - username
    - role
    - exp
    """
    secret = _require_jwt_secret()

    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRES_MINUTES)

    payload = {
        "userId": user_id,
        "username": username,
        "role": role,
        "exp": expire,
    }

    return jwt.encode(payload, secret, algorithm=settings.JWT_ALGORITHM)
