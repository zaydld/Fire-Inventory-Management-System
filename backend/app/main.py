import logging
from fastapi import FastAPI
from sqlalchemy import text

from app.db.session import engine
from app.db.base import Base
from app.db.models import *  # noqa
from app.core.settings import settings

from strawberry.fastapi import GraphQLRouter
from app.graphql.schema import schema


from fastapi import Request

async def get_context(request: Request):
    return {"request": request}



logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("app")

app = FastAPI(title="Projet Fire API")


graphql_app = GraphQLRouter(
    schema,
    context_getter=get_context,
    graphql_ide="graphiql"
)


app.include_router(graphql_app, prefix="/graphql")


@app.on_event("startup")
def startup_event():
    if not settings.JWT_SECRET or not settings.JWT_SECRET.strip():
        logger.error("JWT secret is missing")
        raise RuntimeError("JWT secret is missing")
    try:
        Base.metadata.create_all(bind=engine)

        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("Database connection successful")
    except Exception:
        logger.exception("Database connection failed")


@app.get("/health")
def health():
    return {"status": "UP"}
