"""
Application settings loaded from environment variables with sensible defaults.
"""
import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

# ── Project root ─────────────────────────────────────────────────────────────
_THIS_DIR = Path(__file__).resolve().parent          # backend/app/config
_APP_DIR = _THIS_DIR.parent                          # backend/app
_BACKEND_DIR = _APP_DIR.parent                       # backend
PROJECT_ROOT = _BACKEND_DIR.parent                   # AI-Based-Nutritional-Assessment-System

load_dotenv(_BACKEND_DIR / ".env")

# ── JWT ──────────────────────────────────────────────────────────────────────
JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-key-change-in-production-ai-nutrition")
JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

# ── Database (Supports SQLite & Supabase PostgreSQL) ─────────────────────────
_raw_db_url: str = os.getenv("DATABASE_URL", "sqlite:///./nutrition.db")
if _raw_db_url.startswith("postgres://"):
    DATABASE_URL: str = _raw_db_url.replace("postgres://", "postgresql://", 1)
else:
    DATABASE_URL: str = _raw_db_url

# ── CORS ─────────────────────────────────────────────────────────────────────
_origins_env: str = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,https://*.vercel.app"
)
ALLOWED_ORIGINS: List[str] = [o.strip() for o in _origins_env.split(",") if o.strip()]

# ── ML models ────────────────────────────────────────────────────────────────
MODEL_DIR: Path = Path(
    os.getenv(
        "MODEL_DIR",
        str(PROJECT_ROOT / "ml" / "saved_models"),
    )
)

# ── Food CSV ─────────────────────────────────────────────────────────────────
FOOD_CSV_PATH: Path = Path(
    os.getenv(
        "FOOD_CSV_PATH",
        str(PROJECT_ROOT / "ml" / "datasets" / "processed" / "food_database_final.csv"),
    )
)

# ── Third Party APIs ─────────────────────────────────────────────────────────
SPOONACULAR_API_KEY: str = os.getenv("SPOONACULAR_API_KEY", "")
GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
