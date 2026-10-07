from fastapi import FastAPI
from app.config.db_connect import check_database_connection
from app.config.redis_connect import check_redis_connection
from contextlib import asynccontextmanager
from app.routes.generate_diet_route import router as generate_routes


@asynccontextmanager
async def lifespan(app:FastAPI):
    check_database_connection()
    check_redis_connection()
    
    yield
    
    
app = FastAPI(
    title="AI Diet Planner",
    description="AI-generated meal planning for educational/general wellness purposes, not medical treatment.",
    version="1.0.0",
    lifespan=lifespan,
)



@app.get("/")
async def root():
    return {"message": "HELLO"}

app.include_router(generate_routes)