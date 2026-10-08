from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config.settings import settings

engine = create_engine(settings.DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit = False,
    autoflush=False,
    bind=engine
)

class Base(DeclarativeBase):
    pass

def check_database_connection():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        print("✅ Database connected successfully")

    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        

def get_db():
    db = SessionLocal()
    
    try:
        yield db
    finally:
        db.close()