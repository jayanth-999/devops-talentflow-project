import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session, DeclarativeBase

# Read directly from env so tests can override before import
_raw_url = os.environ.get("DATABASE_URL", "postgresql+psycopg2://postgres:postgres123@localhost:5432/userdb")
db_url = _raw_url.replace("postgresql+asyncpg://", "postgresql+psycopg2://")

connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {}

engine = create_engine(db_url, echo=False, pool_pre_ping=True, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
