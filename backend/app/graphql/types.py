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
