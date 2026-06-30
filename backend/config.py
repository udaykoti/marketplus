import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = (os.getenv("GROQ_API_KEY") or "").strip()
NEWS_API_KEY = (os.getenv("NEWS_API_KEY") or "").strip()
CORS_ORIGINS = (os.getenv("CORS_ORIGINS") or "http://localhost:5173").strip()
ENVIRONMENT = (os.getenv("ENVIRONMENT") or "development").strip()
