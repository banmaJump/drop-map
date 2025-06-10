import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.route_search import router as route_search_router
from routes.cache import router as cache_router
from dotenv import load_dotenv

app = FastAPI()
load_dotenv()

# CORS設定をここに追加
app.add_middleware(
    CORSMiddleware,
    frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000"), # React開発サーバーのURL（本番なら本番のURLに変更）
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(route_search_router, prefix="/api")
app.include_router(cache_router, prefix="/api")
