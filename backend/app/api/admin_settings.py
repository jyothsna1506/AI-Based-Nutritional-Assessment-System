import os
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from dotenv import set_key

from backend.app.auth.jwt_handler import get_current_admin_user
from backend.app.models.user import User

router = APIRouter(prefix="/api/admin/settings", tags=["admin_settings"])

# Get the path to the .env file in the backend directory
_THIS_DIR = Path(__file__).resolve().parent
_BACKEND_DIR = _THIS_DIR.parent.parent
ENV_PATH = _BACKEND_DIR / ".env"


class APIKeyUpdate(BaseModel):
    spoonacular_api_key: Optional[str] = None
    gemini_api_key: Optional[str] = None


class SettingsResponse(BaseModel):
    spoonacular_api_key_masked: str
    gemini_api_key_masked: str


def mask_api_key(key: str) -> str:
    if not key:
        return ""
    if len(key) <= 8:
        return "***"
    return f"{key[:4]}...{key[-4:]}"


@router.get("", response_model=SettingsResponse)
def get_settings(
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Get current masked API settings for external services.
    """
    sp_key = os.getenv("SPOONACULAR_API_KEY", "")
    gem_key = os.getenv("GEMINI_API_KEY", "")
    return SettingsResponse(
        spoonacular_api_key_masked=mask_api_key(sp_key),
        gemini_api_key_masked=mask_api_key(gem_key),
    )


@router.post("", response_model=SettingsResponse)
def update_settings(
    payload: APIKeyUpdate,
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Update Spoonacular and/or Gemini API Keys.
    Writes to backend/.env and hot-reloads in os.environ.
    """
    if not ENV_PATH.exists():
        ENV_PATH.touch()

    try:
        if payload.spoonacular_api_key is not None:
            val = payload.spoonacular_api_key.strip()
            set_key(
                dotenv_path=str(ENV_PATH),
                key_to_set="SPOONACULAR_API_KEY",
                value_to_set=val,
                quote_mode="never"
            )
            os.environ["SPOONACULAR_API_KEY"] = val

        if payload.gemini_api_key is not None:
            val = payload.gemini_api_key.strip()
            set_key(
                dotenv_path=str(ENV_PATH),
                key_to_set="GEMINI_API_KEY",
                value_to_set=val,
                quote_mode="never"
            )
            os.environ["GEMINI_API_KEY"] = val

        sp_key = os.getenv("SPOONACULAR_API_KEY", "")
        gem_key = os.getenv("GEMINI_API_KEY", "")
        return SettingsResponse(
            spoonacular_api_key_masked=mask_api_key(sp_key),
            gemini_api_key_masked=mask_api_key(gem_key),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update settings: {str(e)}")
