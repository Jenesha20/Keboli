import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    KEBOLI_BACKEND_URL = os.getenv("KEBOLI_BACKEND_URL", "http://localhost:8000")
    LLM_MODEL = "llama-3.3-70b-versatile"

config = Config()
