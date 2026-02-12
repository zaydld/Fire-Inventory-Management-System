import strawberry
import uuid
from typing import List
from sqlalchemy import select, desc
from graphql import GraphQLError

from app.graphql.mutations import Mutation
from app.graphql.types import UserType, ProductType
from app.graphql.context import require_user

from app.db.session import SessionLocal
from app.models.product import Product


@strawberry.type
class Query:
    @strawberry.field
    def hello(self) -> str:
        return "Hello GraphQL"

    @strawberry.field
    def me(self, info) -> UserType:
        user = require_user(info)
        role_str = getattr(user.role, "value", str(user.role))
        return UserType(id=str(user.id), username=user.username, role=role_str)

    @strawberry.field
    def products(self, info) -> List[ProductType]:
        # 🔒 Requires authentication
        require_user(info)

        db = SessionLocal()
        try:
            items = db.execute(
                select(Product).order_by(desc(Product.created_at))
            ).scalars().all()

            return [
                ProductType(
                    id=str(p.id),
                    name=p.name,
                    description=p.description,
                    price=float(p.price),
                    quantity=p.quantity,
                )
                for p in items
            ]
        finally:
            db.close()

    @strawberry.field
    def productById(self, info, id: str) -> ProductType:
        # 🔒 Requires authentication
        require_user(info)

        # Option 1: UUID invalide => Product not found
        try:
            product_id = uuid.UUID(id)
        except Exception:
            raise GraphQLError("Product not found")

        db = SessionLocal()
        try:
            product = db.execute(
                select(Product).where(Product.id == product_id)
            ).scalar_one_or_none()

            if not product:
                raise GraphQLError("Product not found")

            return ProductType(
                id=str(product.id),
                name=product.name,
                description=product.description,
                price=float(product.price),
                quantity=product.quantity,
            )
        finally:
            db.close()


schema = strawberry.Schema(query=Query, mutation=Mutation)
