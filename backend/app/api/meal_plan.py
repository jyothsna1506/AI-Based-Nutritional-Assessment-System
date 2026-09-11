"""
Meal plan endpoints: generate, regenerate, and view history.
"""
import json
import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.app.database.db import get_db
from backend.app.auth.jwt_handler import get_current_user
from backend.app.models.user import User
from backend.app.models.health_profile import HealthProfile
from backend.app.models.prediction import Prediction
from backend.app.models.meal_plan import MealPlan
from backend.app.schemas.meal import MealPlanRequest, MealPlanResponse, DayMeal, MealItem
from backend.app.ml.meal_recommender import generate_weekly_meal_plan, NON_VEG_REGEX, NON_VEGAN_REGEX

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/meal-plan", tags=["Meal Plans"])


def _detected_deficiencies(pred: Optional[Prediction]) -> List[str]:
    """Extract deficiency keys where risk >= 0.4 from the latest prediction."""
    if pred is None:
        return []
    keys = []
    risk_map = {
        "Iron_Anemia_Deficiency": pred.iron_risk,
        "Vitamin_D_Deficiency": pred.vitamin_d_risk,
        "SCA_Deficiency": pred.calcium_risk,
        "MAGN_Deficiency": pred.magnesium_risk,
        "SK_Deficiency": pred.potassium_risk,
        "R_Deficiency": pred.vitamin_b12_risk,
    }
    for key, score in risk_map.items():
        if score and score >= 0.4:
            keys.append(key)
    return keys


def _plan_has_diet_violations(plan_dict: dict, diet_pref: str) -> bool:
    """Check if a cached plan contains items that violate the requested diet preference."""
    pref = (diet_pref or "").lower().strip()
    if pref not in ["vegetarian", "vegan"]:
        return False

    saved_pref = (plan_dict.get("diet_preference") or "").lower().strip()
    if saved_pref != pref:
        return True

    for d in plan_dict.get("days", []):
        for slot, item in d.get("meals", {}).items():
            if item:
                title = f"{item.get('recipe_title', '')} {item.get('food_name', '')}"
                if NON_VEG_REGEX.search(title):
                    logger.warning("Sanitizer found non-veg item '%s' in cached %s plan!", title, pref)
                    return True
                if pref == "vegan" and NON_VEGAN_REGEX.search(title):
                    logger.warning("Sanitizer found non-vegan item '%s' in cached vegan plan!", title)
                    return True
    return False


from backend.app.ml.meal_recommender import generate_weekly_meal_plan, NON_VEG_REGEX, NON_VEGAN_REGEX, _get_dynamic_food_image

def _build_response(plan_dict: dict, plan_id: Optional[int] = None, created_at=None) -> MealPlanResponse:
    """Convert the raw dict from the recommender into a MealPlanResponse."""
    days = []
    for d in plan_dict.get("days", []):
        meals = {}
        for slot, item in d.get("meals", {}).items():
            if item:
                title = item.get("recipe_title") or item.get("food_name") or ""
                # Refresh image if missing or if assigned old generic fallback
                if not item.get("recipe_image") or "photo-1525351484163" in str(item.get("recipe_image")):
                    item["recipe_image"] = _get_dynamic_food_image(title, slot)
                meals[slot] = MealItem(**item)
        days.append(DayMeal(
            day=d["day"],
            meals=meals,
            total_calories=d.get("total_calories", 0),
        ))
    return MealPlanResponse(
        id=plan_id,
        week_number=plan_dict["week_number"],
        year=plan_dict["year"],
        diet_preference=plan_dict.get("diet_preference"),
        daily_calorie_target=plan_dict.get("daily_calorie_target", 2000),
        deficiencies_targeted=plan_dict.get("deficiencies_targeted", []),
        days=days,
        created_at=created_at,
    )


@router.get("/weekly", response_model=MealPlanResponse)
def get_weekly_meal_plan(
    preference: Optional[str] = Query(None, description="vegetarian / non_vegetarian / vegan"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate (or retrieve cached) the weekly meal plan for the current user.
    """
    # Determine diet preference
    profile = db.query(HealthProfile).filter(HealthProfile.user_id == current_user.id).first()
    diet_pref = preference or (profile.dietary_preference if profile else None) or "non_vegetarian"
    gender = (profile.gender if profile else None) or "male"
    age = (profile.age if profile else None) or 30

    # Get latest prediction for deficiency targeting
    latest_pred = (
        db.query(Prediction)
        .filter(Prediction.user_id == current_user.id)
        .order_by(Prediction.prediction_date.desc())
        .first()
    )
    deficiencies = _detected_deficiencies(latest_pred)

    # Target diet preference
    target_pref = preference.lower().strip() if preference else diet_pref

    # Retrieve the user's latest saved meal plan for target_pref
    existing = (
        db.query(MealPlan)
        .filter(
            MealPlan.user_id == current_user.id,
            MealPlan.diet_preference == target_pref
        )
        .order_by(MealPlan.created_at.desc(), MealPlan.id.desc())
        .first()
    )

    # If preference was not explicitly specified, fallback to latest saved plan of any preference if available
    if not existing and not preference:
        existing = (
            db.query(MealPlan)
            .filter(MealPlan.user_id == current_user.id)
            .order_by(MealPlan.created_at.desc(), MealPlan.id.desc())
            .first()
        )

    if existing:
        try:
            saved = json.loads(existing.plan_data)
            saved_pref = (saved.get("diet_preference") or existing.diet_preference or "").lower().strip()
            if not _plan_has_diet_violations(saved, saved_pref):
                return _build_response(saved, plan_id=existing.id, created_at=existing.created_at)
            else:
                logger.info("Purging non-compliant cached plan ID %s for user %s and re-generating clean plan...", existing.id, current_user.id)
                db.delete(existing)
                db.commit()
                existing = None
        except (json.JSONDecodeError, TypeError):
            existing = None

    # Generate new candidate plan if no valid cached plan exists
    plan_dict = generate_weekly_meal_plan(
        diet_preference=diet_pref,
        deficiencies=deficiencies,
        gender=gender,
        age=age,
    )

    wn = plan_dict["week_number"]
    yr = plan_dict["year"]

    # Save new verified plan
    meal = MealPlan(
        user_id=current_user.id,
        week_number=wn,
        year=yr,
        diet_preference=diet_pref,
        plan_data=json.dumps(plan_dict, default=str),
        daily_calories=plan_dict.get("daily_calorie_target", 2000),
    )
    db.add(meal)
    db.commit()
    db.refresh(meal)

    return _build_response(plan_dict, plan_id=meal.id, created_at=meal.created_at)


@router.post("/regenerate", response_model=MealPlanResponse)
def regenerate_meal_plan(
    payload: MealPlanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Force-regenerate the meal plan with a new random seed."""
    import time

    profile = db.query(HealthProfile).filter(HealthProfile.user_id == current_user.id).first()
    diet_pref = payload.diet_preference or (profile.dietary_preference if profile else None) or "non_vegetarian"
    gender = (profile.gender if profile else None) or "male"
    age = (profile.age if profile else None) or 30

    latest_pred = (
        db.query(Prediction)
        .filter(Prediction.user_id == current_user.id)
        .order_by(Prediction.prediction_date.desc())
        .first()
    )
    deficiencies = _detected_deficiencies(latest_pred)

    # Use current timestamp as seed for a fresh plan
    plan_dict = generate_weekly_meal_plan(
        diet_preference=diet_pref,
        deficiencies=deficiencies,
        daily_calorie_target=payload.daily_calorie_target,
        gender=gender,
        age=age,
        week_seed=int(time.time()),
    )

    # Delete existing plan for this week, save new one
    wn = plan_dict["week_number"]
    yr = plan_dict["year"]
    db.query(MealPlan).filter(
        MealPlan.user_id == current_user.id,
        MealPlan.week_number == wn,
        MealPlan.year == yr,
    ).delete()

    meal = MealPlan(
        user_id=current_user.id,
        week_number=wn,
        year=yr,
        diet_preference=diet_pref,
        plan_data=json.dumps(plan_dict, default=str),
        daily_calories=payload.daily_calorie_target,
    )
    db.add(meal)
    db.commit()
    db.refresh(meal)

    return _build_response(plan_dict, plan_id=meal.id, created_at=meal.created_at)


@router.get("/history", response_model=List[MealPlanResponse])
def get_meal_plan_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get past meal plans for the current user."""
    plans = (
        db.query(MealPlan)
        .filter(MealPlan.user_id == current_user.id)
        .order_by(MealPlan.created_at.desc())
        .limit(12)
        .all()
    )
    results = []
    for mp in plans:
        try:
            plan_dict = json.loads(mp.plan_data)
        except (json.JSONDecodeError, TypeError):
            plan_dict = {
                "week_number": mp.week_number,
                "year": mp.year,
                "diet_preference": mp.diet_preference,
                "daily_calorie_target": mp.daily_calories or 2000,
                "deficiencies_targeted": [],
                "days": [],
            }
        results.append(_build_response(plan_dict, plan_id=mp.id, created_at=mp.created_at))
    return results


@router.post("/shopping-list")
def generate_shopping_list(
    meal_plan: dict,
    user: User = Depends(get_current_user)
):
    """
    Generate an aggregated 7-day grocery shopping list for the provided weekly meal plan using Gemini AI.
    """
    from backend.app.services.gemini_service import generate_shopping_list_with_gemini
    diet_pref = meal_plan.get("diet_preference") or "vegetarian"
    result = generate_shopping_list_with_gemini(meal_plan, diet_preference=diet_pref)
    return result
