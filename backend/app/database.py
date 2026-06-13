import os
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv(override=True)

# We will use Supabase Postgres connection string.
# Format: postgresql://user:password@host:port/database
# For local testing if DATABASE_URL is missing, we fallback to sqlite.
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")

if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    # ASYNC_SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("sqlite://", "sqlite+aiosqlite://")
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
    # async_engine = create_async_engine(
    #     ASYNC_SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    # )
    async_engine = None
else:
    if SQLALCHEMY_DATABASE_URL.startswith("postgresql://"):
        ASYNC_SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
    else:
        ASYNC_SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL
        
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    async_engine = create_async_engine(ASYNC_SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
if async_engine:
    AsyncSessionLocal = sessionmaker(async_engine, class_=AsyncSession, expire_on_commit=False)
else:
    AsyncSessionLocal = None

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_async_db():
    async with AsyncSessionLocal() as db:
        try:
            yield db
        finally:
            await db.close()
