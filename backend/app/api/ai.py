"""
AI endpoints powered by Google Gemini API.
"""
import base64
from typing import List, Optional, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.app.database.db import get_db
from backend.app.auth.jwt_handler import get_current_user
from backend.app.models.user import User
from backend.app.models.health_profile import HealthProfile
from backend.app.models.symptom import SymptomRecord
from backend.app.models.blood_report import BloodReport
from backend.app.models.prediction import Prediction
from backend.app.services.gemini_service import (
    chat_with_nutritionist,
    analyze_meal_photo,
    generate_clinical_summary,
    generate_ai_meal_plan_recipes,
    estimate_food_nutrition,
)

router = APIRouter(prefix="/api/ai", tags=["AI Assistance"])


# ── Schemas ──────────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str   # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    include_health_context: bool = True


class SummaryRequest(BaseModel):
    prediction_id: Optional[int] = None


class RecipeRequest(BaseModel):
    deficiencies: Optional[List[str]] = None
    dietary_preference: Optional[str] = "vegetarian"
    target_calories: Optional[int] = 2000


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/chat")
def ai_nutrition_chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Interactive AI Nutrition Assistant Chat endpoint.
    Automatically injects user's health profile, latest symptoms, and prediction risks as context.
    """
    health_context = {}
    if payload.include_health_context:
        profile = db.query(HealthProfile).filter(HealthProfile.user_id == current_user.id).first()
        pred = db.query(Prediction).filter(Prediction.user_id == current_user.id).order_by(Prediction.prediction_date.desc()).first()

        if profile:
            health_context["profile"] = {
                "age": profile.age,
                "gender": profile.gender,
                "height_cm": profile.height_cm,
                "weight_kg": profile.weight_kg,
                "bmi": profile.bmi,
                "activity_level": profile.activity_level,
                "dietary_preference": profile.dietary_preference,
                "health_goals": profile.health_goal,
                "medical_conditions": profile.medical_conditions,
                "allergies": profile.allergies,
            }

        if pred:
            health_context["latest_assessment_risks"] = {
                "iron_risk": pred.iron_risk,
                "vitamin_d_risk": pred.vitamin_d_risk,
                "calcium_risk": pred.calcium_risk,
                "magnesium_risk": pred.magnesium_risk,
                "potassium_risk": pred.potassium_risk,
                "b12_riboflavin_risk": pred.vitamin_b12_risk,
                "confidence_score": pred.confidence_score,
            }

    try:
        messages_dict = [{"role": m.role, "content": m.content} for m in payload.messages]
        reply = chat_with_nutritionist(messages_dict, health_context=health_context if health_context else None)
        return {"reply": reply}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/analyze-food-photo")
async def scan_meal_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """
    Upload a meal photo (JPG/PNG). Gemini Multi-modal vision analyzes the dish
    and returns portion, calories, protein, carbs, and fat.
    """
    try:
        contents = await file.read()
        mime_type = file.content_type or "image/jpeg"
        base64_image = base64.b64encode(contents).decode("utf-8")
        result = analyze_meal_photo(base64_image, mime_type=mime_type)
        return result
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Image analysis failed: {str(exc)}")


@router.post("/clinical-summary")
def get_ai_summary(
    payload: SummaryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate an empathetic doctor-style clinical report explaining deficiency risks.
    """
    if payload.prediction_id:
        pred = db.query(Prediction).filter(Prediction.id == payload.prediction_id, Prediction.user_id == current_user.id).first()
    else:
        pred = db.query(Prediction).filter(Prediction.user_id == current_user.id).order_by(Prediction.prediction_date.desc()).first()

    if not pred:
        raise HTTPException(status_code=404, detail="No assessment prediction found. Run an assessment first.")

    profile = db.query(HealthProfile).filter(HealthProfile.user_id == current_user.id).first()

    prediction_data = {
        "iron_risk": pred.iron_risk,
        "vitamin_d_risk": pred.vitamin_d_risk,
        "calcium_risk": pred.calcium_risk,
        "magnesium_risk": pred.magnesium_risk,
        "potassium_risk": pred.potassium_risk,
        "vitamin_b12_risk": pred.vitamin_b12_risk,
        "confidence_score": pred.confidence_score,
        "date": str(pred.prediction_date),
    }

    profile_data = {
        "age": profile.age if profile else None,
        "gender": profile.gender if profile else None,
        "dietary_preference": profile.dietary_preference if profile else None,
        "health_goals": profile.health_goal if profile else None,
        "allergies": profile.allergies if profile else None,
    } if profile else {}

    try:
        summary_text = generate_clinical_summary(prediction_data, profile_data)
        return {"summary": summary_text}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/recipes")
def generate_ai_recipes(
    payload: RecipeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generates step-by-step cooking recipes tailored to the user's detected deficiencies.
    """
    deficiencies = payload.deficiencies or []
    if not deficiencies:
        pred = db.query(Prediction).filter(Prediction.user_id == current_user.id).order_by(Prediction.prediction_date.desc()).first()
        if pred:
            if pred.iron_risk > 0.3: deficiencies.append("Iron")
            if pred.vitamin_d_risk > 0.3: deficiencies.append("Vitamin D")
            if pred.calcium_risk > 0.3: deficiencies.append("Calcium")
            if pred.magnesium_risk > 0.3: deficiencies.append("Magnesium")
            if pred.vitamin_b12_risk > 0.3: deficiencies.append("Vitamin B12")

    profile = db.query(HealthProfile).filter(HealthProfile.user_id == current_user.id).first()
    pref = payload.dietary_preference or (profile.dietary_preference if profile else "vegetarian")

    try:
        recipe_text = generate_ai_meal_plan_recipes(deficiencies, preference=pref, target_calories=payload.target_calories or 2000)
        return {"recipes": recipe_text}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


class NutritionEstimateRequest(BaseModel):
    food_name: str
    quantity: Optional[float] = 1.0
    unit: Optional[str] = "servings"


@router.post("/estimate-nutrition")
def estimate_nutrition(
    payload: NutritionEstimateRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Use Google Gemini AI to auto-calculate calories, protein, carbs, and fat for any food item.
    """
    if not payload.food_name or not payload.food_name.strip():
        raise HTTPException(status_code=400, detail="Food name is required.")

    try:
        data = estimate_food_nutrition(
            food_name=payload.food_name.strip(),
            quantity=payload.quantity or 1.0,
            unit=payload.unit or "servings"
        )
        return data
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

