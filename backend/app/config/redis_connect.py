import os
import redis
from app.config.settings import settings

client = redis.Redis(
     host=os.getenv("REDIS_HOST", "localhost"),
    port=6379,
    decode_responses=True
)

def check_redis_connection():
    try:
        client.ping()
        print("✅ Redis connected successfully")
    except Exception as e:
        print(f"Redis connection failed: {e}")