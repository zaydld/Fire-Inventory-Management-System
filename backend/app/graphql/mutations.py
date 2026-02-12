import strawberry
from strawberry.types import Info
from graphql import GraphQLError

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.graphql.types import UserType, AuthPayload, ProductType, ProductInput, ProductUpdateInput
from app.core.security import hash_password, verify_password
from app.core.jwt import create_access_token
from app.db.session import SessionLocal

from app.models.user import User
from app.models.product import Product

from app.graphql.context import require_user


def _role_to_str(role) -> str:
    return getattr(role, "value", str(role))


def _default_user_role():
    try:
        from app.models.user import UserRole
        return UserRole.USER
    except Exception:
        return "USER"


def _validation_error(field: str):
    raise GraphQLError(f"Validation error: {field}")


# =========================
# ADMIN helper (US-5.5) - adapté à ton context.py
# =========================
def _require_admin(info: Info):
    user = require_user(info)  # "Unauthorized" si pas de token

    role = getattr(user.role, "value", user.role)  # support Enum ou str
    if str(role) != "ADMIN":
        raise GraphQLError("Forbidden")


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
            token = create_access_token(
                user_id=str(user.id),
                username=user.username,
                role=role_str
            )

            return AuthPayload(
                token=token,
                user=UserType(id=str(user.id), username=user.username, role=role_str),
            )

        except IntegrityError:
            db.rollback()
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
            token = create_access_token(
                user_id=str(user.id),
                username=user.username,
                role=role_str
            )

            return AuthPayload(
                token=token,
                user=UserType(id=str(user.id), username=user.username, role=role_str),
            )
        finally:
            db.close()

    @strawberry.mutation(name="createProduct")
    def create_product(self, info: Info, input: ProductInput) -> ProductType:
        require_user(info)

        name = (input.name or "").strip()
        if not name or len(name) < 2:
            _validation_error("name")

        try:
            price = float(input.price)
        except (TypeError, ValueError):
            _validation_error("price")
        if price < 0:
            _validation_error("price")

        try:
            quantity = int(input.quantity)
        except (TypeError, ValueError):
            _validation_error("quantity")
        if quantity < 0:
            _validation_error("quantity")

        description = input.description.strip() if input.description else None

        db = SessionLocal()
        try:
            product = Product(
                name=name,
                description=description,
                price=price,
                quantity=quantity,
            )
            db.add(product)
            db.commit()
            db.refresh(product)

            return ProductType(
                id=str(product.id),
                name=product.name,
                description=product.description,
                price=float(product.price),
                quantity=int(product.quantity),
            )
        finally:
            db.close()

    @strawberry.mutation(name="updateProduct")
    def update_product(self, info: Info, id: str, input: ProductUpdateInput) -> ProductType:
        require_user(info)

        from uuid import UUID
        try:
            UUID(id)
        except Exception:
            raise GraphQLError("Product not found")

        db = SessionLocal()
        try:
            product = db.get(Product, id)
            if not product:
                raise GraphQLError("Product not found")

            if input.name is not None:
                name = input.name.strip()
                if not name or len(name) < 2:
                    raise GraphQLError("Validation error")
                product.name = name

            if input.description is not None:
                desc = input.description.strip()
                product.description = desc if desc != "" else None

            if input.price is not None:
                try:
                    price = float(input.price)
                except (TypeError, ValueError):
                    raise GraphQLError("Validation error")
                if price < 0:
                    raise GraphQLError("Validation error")
                product.price = price

            if input.quantity is not None:
                try:
                    quantity = int(input.quantity)
                except (TypeError, ValueError):
                    raise GraphQLError("Validation error")
                if quantity < 0:
                    raise GraphQLError("Validation error")
                product.quantity = quantity

            db.commit()
            db.refresh(product)

            return ProductType(
                id=str(product.id),
                name=product.name,
                description=product.description,
                price=float(product.price),
                quantity=int(product.quantity),
            )
        finally:
            db.close()

    # =========================
    # US-5.5 Delete product (ADMIN only)
    # =========================
    @strawberry.mutation(name="deleteProduct")
    def delete_product(self, info: Info, id: str) -> bool:
        _require_admin(info)  # Unauthorized / Forbidden

        from uuid import UUID
        try:
            UUID(id)
        except Exception:
            raise GraphQLError("Product not found")

        db = SessionLocal()
        try:
            product = db.get(Product, id)
            if not product:
                raise GraphQLError("Product not found")

            db.delete(product)
            db.commit()
            return True
        finally:
            db.close()
