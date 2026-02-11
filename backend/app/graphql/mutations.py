from graphql import GraphQLError
import strawberry
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.graphql.types import UserType, AuthPayload
from app.core.security import hash_password, verify_password
from app.core.jwt import create_access_token
from app.db.session import SessionLocal
from app.models.user import User


def _role_to_str(role) -> str:
    return getattr(role, "value", str(role))


def _default_user_role():
    try:
        from app.models.user import UserRole
        return UserRole.USER
    except Exception:
        return "USER"


@strawberry.type
class Mutation:
    @strawberry.mutation
    def register(self, username: str, email: str, password: str) -> AuthPayload:
        # --- Validation Rules ---
        if not username or not username.strip():
            raise GraphQLError("username required")
        if not email or not email.strip():
            raise GraphQLError("email required")
        if not password or not password.strip():
            raise GraphQLError("password required")
        if len(password) < 6:
            raise GraphQLError("password required (min 6)")

        db = SessionLocal()
        try:
            # --- Error cases: username/email exists ---
            existing_username = db.execute(
                select(User).where(User.username == username.strip())
            ).scalar_one_or_none()
            if existing_username:
                raise GraphQLError("Username already exists")

            existing_email = db.execute(
                select(User).where(User.email == email.strip())
            ).scalar_one_or_none()
            if existing_email:
                raise GraphQLError("Email already exists")

            user = User(
                username=username.strip(),
                email=email.strip(),
                password_hash=hash_password(password),
                role=_default_user_role(),  # USER par défaut
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            role_str = _role_to_str(user.role)
            token = create_access_token(user_id=str(user.id), username=user.username, role=role_str)

            return AuthPayload(
                token=token,
                user=UserType(id=str(user.id), username=user.username, role=role_str),
            )

        except IntegrityError:
            db.rollback()
            # si la contrainte unique DB déclenche quand même
            raise GraphQLError("Username already exists or Email already exists")
        finally:
            db.close()

    @strawberry.mutation
    def login(self, username: str, password: str) -> AuthPayload:
        # --- Validation Rules ---
        if not username or not username.strip():
            raise GraphQLError("username required")
        if not password or not password.strip():
            raise GraphQLError("password required")

        db = SessionLocal()
        try:
            user = db.execute(
                select(User).where(User.username == username.strip())
            ).scalar_one_or_none()
            if not user:
                raise GraphQLError("Invalid credentials")

            if not verify_password(password, user.password_hash):
                raise GraphQLError("Invalid credentials")

            role_str = _role_to_str(user.role)
            token = create_access_token(user_id=str(user.id), username=user.username, role=role_str)

            return AuthPayload(
                token=token,
                user=UserType(id=str(user.id), username=user.username, role=role_str),
            )
        finally:
            db.close()
