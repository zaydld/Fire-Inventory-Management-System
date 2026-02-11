import strawberry
from app.graphql.mutations import Mutation
from app.graphql.types import UserType
from app.graphql.context import require_user


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


schema = strawberry.Schema(query=Query, mutation=Mutation)
