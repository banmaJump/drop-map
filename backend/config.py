# backend/config.py
import os

class Config:
    GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
    validate_by_name = True