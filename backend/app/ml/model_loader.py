"""
Load pre-trained Random Forest models for the 6 nutritional deficiency
classifiers.  Models are loaded once at application startup and cached in
a module-level dictionary for fast inference.

Expected model files (joblib format) inside
``<MODEL_DIR>/random_forest_models/``:

* random_forest_model_Vitamin_D_Deficiency.joblib
* random_forest_model_Iron_Anemia_Deficiency.joblib
* random_forest_model_MAGN_Deficiency.joblib
* random_forest_model_R_Deficiency.joblib
* random_forest_model_SCA_Deficiency.joblib
* random_forest_model_SK_Deficiency.joblib
"""
import logging
from pathlib import Path
from typing import Dict, Optional

import joblib

from backend.app.config.settings import MODEL_DIR

logger = logging.getLogger(__name__)

# ── Module-level cache ───────────────────────────────────────────────────────
_models: Dict[str, object] = {}
_scaler: Optional[object] = None

# The six deficiency keys (must match the file-name suffixes exactly)
DEFICIENCY_KEYS = [
    "Vitamin_D_Deficiency",
    "Iron_Anemia_Deficiency",
    "MAGN_Deficiency",
    "R_Deficiency",
    "SCA_Deficiency",
    "SK_Deficiency",
]


def load_models() -> Dict[str, object]:
    """
    Load all Random Forest models from disk.  Safe to call multiple times —
    subsequent calls return the cached dict.
    """
    global _models, _scaler

    if _models:
        return _models

    rf_dir = MODEL_DIR / "random_forest_models"
    if not rf_dir.exists():
        logger.warning("Model directory not found: %s — predictions will be unavailable", rf_dir)
        return _models

    for key in DEFICIENCY_KEYS:
        model_path = rf_dir / f"random_forest_model_{key}.joblib"
        if model_path.exists():
            try:
                _models[key] = joblib.load(model_path)
                logger.info("Loaded model: %s", model_path.name)
            except Exception as exc:
                logger.error("Failed to load model %s: %s", model_path.name, exc)
        else:
            logger.warning("Model file missing: %s", model_path)

    # Optionally load a scaler if one was saved alongside the models
    scaler_path = rf_dir / "scaler.joblib"
    if scaler_path.exists():
        try:
            _scaler = joblib.load(scaler_path)
            logger.info("Loaded scaler from %s", scaler_path)
        except Exception as exc:
            logger.warning("Failed to load scaler: %s", exc)

    logger.info("Total models loaded: %d / %d", len(_models), len(DEFICIENCY_KEYS))
    return _models


def get_models() -> Dict[str, object]:
    """Return the cached model dict (call ``load_models`` first at startup)."""
    return _models


def get_scaler() -> Optional[object]:
    """Return the cached scaler, or ``None`` if not available."""
    return _scaler
