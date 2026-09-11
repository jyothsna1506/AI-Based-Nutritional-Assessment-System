"""
Admin endpoints for managing users, foods, meal plans, and viewing analytics.
"""
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func as sa_func, desc

from backend.app.database.db import get_db
from backend.app.auth.jwt_handler import get_current_admin_user
from backend.app.models.user import User
from backend.app.models.food import Food
from backend.app.models.meal_plan import MealPlan
from backend.app.models.prediction import Prediction
from backend.app.schemas.food import FoodResponse

router = APIRouter(prefix="/api/admin", tags=["Admin"], dependencies=[Depends(get_current_admin_user)])


# ── Typed request schemas ──────────────────────────────────────────────────

class UserUpdateAdmin(BaseModel):
    """Admin-level user update: role and/or active status."""
    role: Optional[str] = None
    is_active: Optional[bool] = None


class FoodCreate(BaseModel):
    """Schema for creating a new food entry via admin."""
    food_name: str
    category: Optional[str] = None
    diet_type: Optional[str] = None
    meal_type: Optional[str] = None
    energy_kcal: float = 0
    protein_g: float = 0
    carbohydrate_g: float = 0
    fat_g: float = 0
    fiber_g: float = 0
    iron_mg: float = 0
    calcium_mg: float = 0
    vitamin_d_mcg: float = 0
    vitamin_b12_mcg: float = 0
    vitamin_c_mg: float = 0
    potassium_mg: float = 0
    magnesium_mg: float = 0
    zinc_mg: float = 0


class FoodUpdate(BaseModel):
    """Schema for partially updating a food entry. All fields optional."""
    food_name: Optional[str] = None
    category: Optional[str] = None
    diet_type: Optional[str] = None
    meal_type: Optional[str] = None
    energy_kcal: Optional[float] = None
    protein_g: Optional[float] = None
    carbohydrate_g: Optional[float] = None
    fat_g: Optional[float] = None
    fiber_g: Optional[float] = None
    iron_mg: Optional[float] = None
    calcium_mg: Optional[float] = None
    vitamin_d_mcg: Optional[float] = None
    vitamin_b12_mcg: Optional[float] = None
    vitamin_c_mg: Optional[float] = None
    potassium_mg: Optional[float] = None
    magnesium_mg: Optional[float] = None
    zinc_mg: Optional[float] = None


# ── Analytics & Dashboard ──────────────────────────────────────────────────

@router.get("/dashboard")
def get_dashboard_stats(db: Session = Depends(get_db)) -> Dict[str, Any]:
    total_users = db.query(User).count()
    total_foods = db.query(Food).count()
    total_predictions = db.query(Prediction).count()
    total_meal_plans = db.query(MealPlan).count()

    # Recent users
    recent_users = db.query(User).order_by(desc(User.created_at)).limit(5).all()

    return {
        "total_users": total_users,
        "total_foods": total_foods,
        "total_predictions": total_predictions,
        "total_meal_plans": total_meal_plans,
        "recent_users": [
            {"id": u.id, "full_name": u.full_name, "email": u.email, "created_at": u.created_at}
            for u in recent_users
        ],
    }


@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db)) -> Dict[str, Any]:
    # User growth (last 7 days)
    last_7_days = datetime.utcnow() - timedelta(days=7)
    user_growth = (
        db.query(sa_func.date(User.created_at).label("date"), sa_func.count(User.id))
        .filter(User.created_at >= last_7_days)
        .group_by(sa_func.date(User.created_at))
        .order_by(sa_func.date(User.created_at))
        .all()
    )

    return {
        "user_growth": [{"date": str(d), "count": c} for d, c in user_growth]
    }


@router.get("/prediction-reports")
def get_prediction_reports(db: Session = Depends(get_db)) -> Dict[str, Any]:
    import json

    predictions = db.query(Prediction).all()

    deficiencies_count: Dict[str, int] = {}
    total_confidence = 0.0
    count = len(predictions)

    for p in predictions:
        total_confidence += getattr(p, "confidence_score", 0) or 0
        # Count high-risk deficiencies from stored risk fields
        risk_fields = {
            "Iron Deficiency": p.iron_risk,
            "Vitamin D Deficiency": p.vitamin_d_risk,
            "Calcium Deficiency": p.calcium_risk,
            "Magnesium Deficiency": p.magnesium_risk,
            "Potassium Deficiency": p.potassium_risk,
            "Vitamin B12 / Riboflavin Deficiency": p.vitamin_b12_risk,
        }
        for name, risk_score in risk_fields.items():
            if risk_score and risk_score >= 0.4:
                deficiencies_count[name] = deficiencies_count.get(name, 0) + 1

    avg_confidence = (total_confidence / count) if count > 0 else 0

    return {
        "total_predictions": count,
        "average_confidence": round(avg_confidence, 4),
        "deficiencies_distribution": deficiencies_count,
    }


# ── User Management ────────────────────────────────────────────────────────

@router.get("/users")
def get_users(
    skip: int = 0, limit: int = 50, db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    users = db.query(User).order_by(desc(User.created_at)).offset(skip).limit(limit).all()
    return [
        {
            "id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at,
        }
        for u in users
    ]


@router.put("/users/{user_id}")
def update_user(user_id: int, payload: UserUpdateAdmin, db: Session = Depends(get_db)):
    """Update a user's role or active status."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.role is not None:
        user.role = payload.role
    if payload.is_active is not None:
        user.is_active = payload.is_active

    db.commit()
    db.refresh(user)
    return {"message": "User updated", "user_id": user.id}


@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}


# ── Food Database Management ───────────────────────────────────────────────

@router.get("/foods", response_model=List[FoodResponse])
def get_all_foods(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(Food).offset(skip).limit(limit).all()


@router.post("/foods", response_model=FoodResponse)
def create_food(payload: FoodCreate, db: Session = Depends(get_db)):
    """Create a new food entry (typed and validated)."""
    food = Food(**payload.model_dump())
    db.add(food)
    db.commit()
    db.refresh(food)
    return food


@router.put("/foods/{food_id}", response_model=FoodResponse)
def update_food(food_id: int, payload: FoodUpdate, db: Session = Depends(get_db)):
    """Partially update a food entry (typed and validated)."""
    food = db.query(Food).filter(Food.id == food_id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food not found")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(food, key, value)

    db.commit()
    db.refresh(food)
    return food


@router.delete("/foods/{food_id}")
def delete_food(food_id: int, db: Session = Depends(get_db)):
    food = db.query(Food).filter(Food.id == food_id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food not found")
    db.delete(food)
    db.commit()
    return {"message": "Food deleted"}


# ── Meal Plan Management ───────────────────────────────────────────────────

@router.get("/meal-plans")
def get_all_meal_plans(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """List all meal plans with correct field names from the ORM model."""
    meals = db.query(MealPlan).order_by(desc(MealPlan.created_at)).offset(skip).limit(limit).all()
    return [
        {
            "id": m.id,
            "user_id": m.user_id,
            "week_number": m.week_number,
            "year": m.year,
            "diet_preference": m.diet_preference,   # FIX: was m.diet_type (wrong field)
            "daily_calories": m.daily_calories,      # FIX: was m.target_calories (wrong field)
            "created_at": m.created_at,
        }
        for m in meals
    ]


@router.delete("/meal-plans/{plan_id}")
def delete_meal_plan(plan_id: int, db: Session = Depends(get_db)):
    plan = db.query(MealPlan).filter(MealPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Meal plan not found")
    db.delete(plan)
    db.commit()
    return {"message": "Meal plan deleted"}
