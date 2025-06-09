# backend/app.py
from fastapi import FastAPI
from routes.route_search import router as route_search_router
from routes.cache import router as cache_router

app = FastAPI()

app.include_router(route_search_router, prefix="/api")
app.include_router(cache_router, prefix="/api")