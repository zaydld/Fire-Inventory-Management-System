import strawberry
from typing import Optional

@strawberry.type
class UserType:
    id: str
    username: str
    role: str

@strawberry.type
class AuthPayload:
    token: str
    user: UserType

@strawberry.type
class ProductType:
    id: str
    name: str
    description: str | None
    price: float
    quantity: int

@strawberry.input
class ProductInput:
    name: str
    description: Optional[str] = None
    price: float = 0
    quantity: int = 0

@strawberry.input
class ProductUpdateInput:
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None
