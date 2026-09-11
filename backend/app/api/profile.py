"""
User profile & health profile endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database.db import get_db
from backend.app.auth.jwt_handler import get_current_user
from backend.app.models.user import User
from backend.app.models.health_profile import HealthProfile
from backend.app.schemas.auth import UserResponse, UserUpdate
from backend.app.schemas.health import HealthProfileCreate, HealthProfileResponse

router = APIRouter(prefix="/api/profile", tags=["Profile"])


# ── User profile ─────────────────────────────────────────────────────────────

@router.get("", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    """Get the current user's basic profile."""
    return current_user


@router.put("", response_model=UserResponse)
def update_profile(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update basic user info (full_name, phone). Uses a typed Pydantic schema."""
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(current_user, key, value)
    db.commit()
    db.refresh(current_user)
    return current_user


# ── Health profile ───────────────────────────────────────────────────────────

@router.post("/health", response_model=HealthProfileResponse, status_code=status.HTTP_201_CREATED)
def create_or_update_health_profile(
    payload: HealthProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create or update the user's health profile."""
    profile = db.query(HealthProfile).filter(HealthProfile.user_id == current_user.id).first()

    data = payload.model_dump(exclude_unset=True)

    # Auto-compute BMI if height and weight provided
    height = data.get("height_cm") or (profile.height_cm if profile else None)
    weight = data.get("weight_kg") or (profile.weight_kg if profile else None)
    if height and weight and height > 0:
        data["bmi"] = round(weight / ((height / 100) ** 2), 2)

    if profile:
        for key, value in data.items():
            setattr(profile, key, value)
    else:
        profile = HealthProfile(user_id=current_user.id, **data)
        db.add(profile)

    db.commit()
    db.refresh(profile)
    return profile


@router.get("/health", response_model=HealthProfileResponse)
def get_health_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the current user's health profile."""
    profile = db.query(HealthProfile).filter(HealthProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Health profile not found. Please create one first.",
        )
    return profile
