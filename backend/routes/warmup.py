# backend/routes/warmup.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/warmup")
async def ping():
    return {"status": "ok"}