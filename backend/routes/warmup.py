# backend/routes/warmup.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/warmup")
async def ping():
    print("バックサーバーのウォーミングアップ完了")
    return {"status": "ok"}