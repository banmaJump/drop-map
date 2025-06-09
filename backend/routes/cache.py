# routes/cache.py (FastAPI用)
from fastapi import APIRouter
from services.route_cache import clear_cache, get_cache_keys

router = APIRouter()

@router.post("/clear_cache")
async def clear_cache_endpoint():
    clear_cache()
    return {
        "message": "Cache cleared",
        "cache_keys_after": get_cache_keys()  # デバッグ目的（空のはず）
    }

@router.get("/ping")
async def ping():
    return {"message": "pong"}