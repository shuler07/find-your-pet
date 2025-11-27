from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from os import environ


URL_DATABASE = environ.get("URL_DATABASE")
if not URL_DATABASE:
    raise EnvironmentError("URL_DATABASE отсутсвует в переменных окружения")

engine = create_async_engine(URL_DATABASE)
new_session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


class Base(DeclarativeBase):
    pass


async def get_session():
    async with new_session() as session:
        yield session
