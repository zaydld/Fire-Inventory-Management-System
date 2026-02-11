from jose import JWTError, jwt
from app.core.settings import settings


def decode_token(token: str) -> dict:
    if not settings.JWT_SECRET or not settings.JWT_SECRET.strip():
        raise RuntimeError("JWT secret is missing")

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload
    except JWTError:
        # token invalide / expiré / signature incorrecte
        raise ValueError("Unauthorized")
