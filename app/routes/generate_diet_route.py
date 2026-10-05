from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.services.generate_diet_plan_service import generate_diet_plan
from app.schema.generate_diet_schema import RequestData
from app.config.db_connect import get_db

router = APIRouter(
    prefix="/generate"
)

@router.post("/")
def generate_routes(req_data : RequestData, db : Session = Depends(get_db)):
    return generate_diet_plan(req_data, db)
    