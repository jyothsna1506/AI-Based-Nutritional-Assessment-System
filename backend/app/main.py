"""
AI-Based Nutritional Assessment System – FastAPI Application Entry Point
========================================================================
Registers all API routers, configures CORS, initialises the database
and food catalogue on startup, and exposes a health-check root endpoint.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ── API routers ──────────────────────────────────────────────────────────
from backend.app.api.auth import router as auth_router
from backend.app.api.profile import router as profile_router
from backend.app.api.assessment import router as assessment_router
from backend.app.api.meal_plan import router as meal_plan_router
from backend.app.api.food import router as food_router
from backend.app.api.dashboard import router as dashboard_router
from backend.app.api.admin import router as admin_router
from backend.app.api.admin_settings import router as admin_settings_router
from backend.app.api.external import router as external_router
from backend.app.api.ai import router as ai_router

# ── Database & seeder ────────────────────────────────────────────────────
from backend.app.database.db import init_db
from backend.app.services.food_seeder import seed_foods

# ── Config ───────────────────────────────────────────────────────────────
from backend.app.config.settings import ALLOWED_ORIGINS

# ── Logging setup ────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.getLogger(__name__)


# ── Lifespan (startup / shutdown) ────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Runs once on application startup and shutdown."""
    # --- Startup ---
    logger.info("Initialising database …")
    init_db()
    logger.info("Database initialised successfully.")

    try:
        logger.info("Seeding food database …")
        seed_foods()
        logger.info("Food database seeded successfully.")
    except Exception as exc:
        logger.warning("Food seeding skipped or failed: %s", exc)

    import gc
    gc.collect()

    logger.info("🚀 AI Nutrition Assessment API is ready.")

    yield  # ← application runs here

    # --- Shutdown ---
    logger.info("Shutting down AI Nutrition Assessment API.")


# ── Application instance ─────────────────────────────────────────────────
app = FastAPI(
    title="AI Nutrition Assessment",
    description="AI-powered nutritional deficiency assessment and meal planning",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS middleware ──────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)

# ── Register routers ────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(assessment_router)
app.include_router(meal_plan_router)
app.include_router(food_router)
app.include_router(dashboard_router)
app.include_router(admin_router)
app.include_router(admin_settings_router)
app.include_router(external_router, prefix="/api")
app.include_router(ai_router)

# ── Mount Uploads Directory for Audio Files ──────────────────────────────
import os
from fastapi.staticfiles import StaticFiles
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


# ── Root health-check endpoint ───────────────────────────────────────────
@app.api_route("/", methods=["GET", "HEAD"], tags=["Health"])
async def root():
    """Health-check endpoint supporting both GET and HEAD for Render deployments."""
    return {"status": "running", "app": "AI Nutrition Assessment"}


@app.api_route("/health", methods=["GET", "HEAD"], tags=["Health"])
async def health_check():
    """Alternative health-check endpoint for cloud deployments."""
    return {"status": "healthy"}
