"""
Dashboard endpoint — aggregates key user metrics dynamically into a single response.
Calculates personalized calorie targets, deficiency risk counts, hydration levels, and real-time nutrition scores.
"""
import json
from datetime import date
from typing import List

from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from sqlalchemy import func as sa_func

from backend.app.database.db import get_db
from backend.app.auth.jwt_handler import get_current_user
from backend.app.models.user import User
from backend.app.models.health_profile import HealthProfile
from backend.app.models.prediction import Prediction
from backend.app.models.food_diary import FoodDiary
from backend.app.models.progress import ProgressLog
from backend.app.schemas.dashboard import DashboardResponse, NutrientSummary, DeficiencyRisk

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


def _calculate_daily_calorie_target(profile: HealthProfile) -> float:
    """Calculate BMR and TDEE using Mifflin-St Jeor equation."""
    if not profile or not profile.weight_kg or not profile.height_cm:
        return 2000.0

    weight = profile.weight_kg
    height = profile.height_cm
    age = profile.age if profile.age else 30
    gender = (profile.gender or "").lower()

    # BMR calculation
    if gender in ["male", "m"]:
        bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5
    else:
        bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161

    # Activity level multiplier
    act = (profile.activity_level or "").lower()
    multipliers = {
        "sedentary": 1.2,
        "lightly_active": 1.375,
        "light": 1.375,
        "moderately_active": 1.55,
        "moderate": 1.55,
        "very_active": 1.725,
        "active": 1.725,
        "extra_active": 1.9,
    }
    multiplier = multipliers.get(act, 1.375)
    tdee = bmr * multiplier
    return round(tdee, 0)


@router.get("", response_model=DashboardResponse)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Aggregate dynamic dashboard data for the current user."""
    today = date.today()

    # ── 1. Profile / BMI / Calorie Target ─────────────────────────────────
    profile = db.query(HealthProfile).filter(HealthProfile.user_id == current_user.id).first()
    bmi = profile.bmi if profile else None
    weight = profile.weight_kg if profile else None
    daily_calorie_target = _calculate_daily_calorie_target(profile)
    water_target = round(weight * 0.033, 1) if (weight and weight > 30) else 3.0

    # ── 2. Today's Food Diary Summary ─────────────────────────────────────
    diary_entries = (
        db.query(FoodDiary)
        .filter(
            FoodDiary.user_id == current_user.id,
            sa_func.date(FoodDiary.created_at) == today,
        )
        .all()
    )
    calories_today = sum(e.calories or 0 for e in diary_entries)
    protein_today = sum(e.protein or 0 for e in diary_entries)
    carbs_today = sum(e.carbs or 0 for e in diary_entries)
    fat_today = sum(e.fat or 0 for e in diary_entries)

    nutrient_summary = NutrientSummary(
        calories_today=round(calories_today, 1),
        protein_today=round(protein_today, 1),
        carbs_today=round(carbs_today, 1),
        fat_today=round(fat_today, 1),
    )

    # ── 3. Latest Prediction → Deficiency Risks & Risk Level ─────────────
    latest_pred = (
        db.query(Prediction)
        .filter(Prediction.user_id == current_user.id)
        .order_by(Prediction.prediction_date.desc())
        .first()
    )
    deficiency_risks: List[DeficiencyRisk] = []
    deficiency_count = 0
    high_risk_count = 0

    if latest_pred:
        risk_pairs = [
            ("Iron Deficiency", latest_pred.iron_risk),
            ("Vitamin D Deficiency", latest_pred.vitamin_d_risk),
            ("Calcium Deficiency", latest_pred.calcium_risk),
            ("Magnesium Deficiency", latest_pred.magnesium_risk),
            ("Potassium Deficiency", latest_pred.potassium_risk),
            ("Vitamin B12 Deficiency", latest_pred.vitamin_b12_risk),
        ]
        deficiency_risks = [
            DeficiencyRisk(name=name, risk=round(risk or 0, 4))
            for name, risk in risk_pairs
        ]
        for _, risk in risk_pairs:
            if risk and risk >= 0.35:
                deficiency_count += 1
            if risk and risk >= 0.65:
                high_risk_count += 1
    else:
        deficiency_count = 1 if (bmi and (bmi < 18.5 or bmi > 25)) else 0
        high_risk_count = 0

    # Risk level label
    if high_risk_count >= 2:
        risk_level = "High Risk"
    elif deficiency_count >= 2:
        risk_level = "Moderate Risk"
    elif deficiency_count >= 1:
        risk_level = "Mild Risk"
    else:
        risk_level = "Optimal"

    # ── 4. Today's Progress Log & Water Hydration ─────────────────────────
    today_progress = (
        db.query(ProgressLog)
        .filter(ProgressLog.user_id == current_user.id, ProgressLog.log_date == today)
        .first()
    )
    water_intake = today_progress.water_intake if (today_progress and today_progress.water_intake is not None) else 0.0

    # ── 5. Real-Time Dynamic Nutrition Score Calculation ──────────────────
    base_score = 88.0

    # Deductions for risk predictions
    base_score -= (high_risk_count * 12.0)
    base_score -= ((deficiency_count - high_risk_count) * 5.0)

    # Food Diary Rewards
    if diary_entries:
        base_score += 4.0
        calorie_ratio = calories_today / daily_calorie_target if daily_calorie_target > 0 else 0
        if 0.70 <= calorie_ratio <= 1.15:
            base_score += 4.0

    # Water Hydration Reward
    if water_intake >= (water_target * 0.75):
        base_score += 4.0
    elif water_intake >= (water_target * 0.40):
        base_score += 2.0

    # BMI Status Adjustment
    if bmi:
        if 18.5 <= bmi <= 24.9:
            base_score += 3.0
        elif bmi < 17.0 or bmi > 32.0:
            base_score -= 6.0

    nutrition_score = round(min(100.0, max(30.0, base_score)), 0)

    # Save/update progress log entry for today
    if not today_progress:
        today_progress = ProgressLog(
            user_id=current_user.id,
            log_date=today,
            nutrition_score=nutrition_score,
            water_intake=water_intake,
            calories_consumed=calories_today,
            bmi=bmi,
            weight=weight,
        )
        db.add(today_progress)
        db.commit()
    else:
        today_progress.nutrition_score = nutrition_score
        today_progress.calories_consumed = calories_today
        db.commit()

    # ── 6. Trend Percentage vs Past Progress Log ───────────────────────────
    prev_log = (
        db.query(ProgressLog)
        .filter(ProgressLog.user_id == current_user.id, ProgressLog.log_date < today)
        .order_by(ProgressLog.log_date.desc())
        .first()
    )
    if prev_log and prev_log.nutrition_score and prev_log.nutrition_score > 0:
        diff = nutrition_score - prev_log.nutrition_score
        pct = round((diff / prev_log.nutrition_score) * 100, 1)
        if pct > 0:
            nutrition_score_trend = f"+{pct}% Improved"
        elif pct < 0:
            nutrition_score_trend = f"{pct}% Focus Needed"
        else:
            nutrition_score_trend = "0% Steady"
    else:
        if nutrition_score >= 80:
            nutrition_score_trend = "+5% Optimal"
        elif nutrition_score >= 60:
            nutrition_score_trend = "Moderate"
        else:
            nutrition_score_trend = "Needs Focus"

    # ── 7. Recent predictions (last 5) ──────────────────────────────────────
    recent_preds = (
        db.query(Prediction)
        .filter(Prediction.user_id == current_user.id)
        .order_by(Prediction.prediction_date.desc())
        .limit(5)
        .all()
    )
    recent_predictions = [
        {
            "id": p.id,
            "confidence_score": p.confidence_score,
            "prediction_date": str(p.prediction_date) if p.prediction_date else None,
        }
        for p in recent_preds
    ]

    # ── 8. Recent diary entries ─────────────────────────────────────────────
    recent_diary = [
        {
            "food_name": e.food_name,
            "meal_type": e.meal_type,
            "calories": e.calories,
            "created_at": str(e.created_at) if e.created_at else None,
        }
        for e in diary_entries[:5]
    ]

    return DashboardResponse(
        user_name=current_user.full_name or current_user.username,
        nutrition_score=nutrition_score,
        nutrition_score_trend=nutrition_score_trend,
        deficiency_count=deficiency_count,
        high_risk_count=high_risk_count,
        risk_level=risk_level,
        daily_calories=round(calories_today, 0),
        daily_calorie_target=daily_calorie_target,
        water_intake=round(water_intake, 2),
        water_target=water_target,
        nutrient_summary=nutrient_summary,
        deficiency_risks=deficiency_risks,
        recent_predictions=recent_predictions,
        recent_diary=recent_diary,
        bmi=bmi,
        weight=weight,
    )


@router.post("/water")
def log_water_intake(
    amount_ml: float = Body(250.0, embed=True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Log water intake for today and return updated hydration stats."""
    today = date.today()
    progress = (
        db.query(ProgressLog)
        .filter(ProgressLog.user_id == current_user.id, ProgressLog.log_date == today)
        .first()
    )
    current_intake = progress.water_intake if (progress and progress.water_intake is not None) else 0.0
    new_intake = round(current_intake + (amount_ml / 1000.0), 2)

    if not progress:
        progress = ProgressLog(
            user_id=current_user.id,
            log_date=today,
            water_intake=new_intake
        )
        db.add(progress)
    else:
        progress.water_intake = new_intake

    db.commit()
    return {"water_intake": new_intake, "message": "Water intake updated successfully!"}


@router.post("/water/reset")
def reset_water_intake(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Reset water intake for today back to 0.0 L."""
    today = date.today()
    progress = (
        db.query(ProgressLog)
        .filter(ProgressLog.user_id == current_user.id, ProgressLog.log_date == today)
        .first()
    )
    if not progress:
        progress = ProgressLog(
            user_id=current_user.id,
            log_date=today,
            water_intake=0.0
        )
        db.add(progress)
    else:
        progress.water_intake = 0.0

    db.commit()
    return {"water_intake": 0.0, "message": "Water intake reset to 0.0 L"}
