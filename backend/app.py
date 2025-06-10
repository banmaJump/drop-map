# backend/app.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.route_search import router as route_search_router
from routes.cache import router as cache_router
from dotenv import load_dotenv

load_dotenv()  

app = FastAPI()

frontend_origin = os.getenv("FRONTEND_ORIGIN")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin, "http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(route_search_router, prefix="/api")
app.include_router(cache_router, prefix="/api")
