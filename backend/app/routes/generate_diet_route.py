from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.services.generate_diet_plan_service import generate_diet_plan
from app.schema.generate_diet_schema import RequestData
from app.config.db_connect import get_db
import json
import hashlib
from app.config.redis_connect import client

router = APIRouter(
    prefix="/generate"
)

@router.post("/")
def generate_routes(req_data : RequestData, db : Session = Depends(get_db)):
    
    input_data= json.dumps(req_data.model_dump(), sort_keys=True)
    hash_value = hashlib.sha256(
        input_data.encode("utf-8")
    ).hexdigest()
    
    cache_key = f"diet:{hash_value}"
    
    cached_data = client.get(cache_key)
    
    if cached_data:
        cached_data = json.loads(cached_data)
        return cached_data

    
    return generate_diet_plan(req_data, db, cache_key)
    