import os
from pathlib import Path

from dotenv import load_dotenv

SERVICE_DIR = Path(__file__).resolve().parent
REPO_DIR = SERVICE_DIR.parents[1]
load_dotenv(SERVICE_DIR / ".env")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip()

DATA_DIR = Path(os.getenv("DATA_DIR", str(REPO_DIR / "data")))
FAISS_DIR = Path(os.getenv("FAISS_DIR", str(DATA_DIR / "faiss_db")))
KNOWLEDGE_DIR = Path(os.getenv("KNOWLEDGE_DIR", str(DATA_DIR / "knowledge")))
OUTPUT_DIR = Path(os.getenv("OUTPUT_DIR", str(DATA_DIR / "outputs")))

HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "5000"))

FIREBASE_DB_URL = os.getenv("FIREBASE_DB_URL", "").strip().rstrip("/")
FIREBASE_API_KEY = os.getenv("FIREBASE_API_KEY", "").strip()

# If set, clients must send it in the X-Api-Token header (all non-GET routes).
API_TOKEN = os.getenv("API_TOKEN", "").strip()

CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "*").split(",") if o.strip()]
