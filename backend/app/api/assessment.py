"""
Assessment endpoints: submit symptoms, blood reports, run prediction.
"""
import json
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session

from backend.app.database.db import get_db
from backend.app.auth.jwt_handler import get_current_user
from backend.app.models.user import User
from backend.app.models.health_profile import HealthProfile
from backend.app.models.symptom import SymptomRecord
from backend.app.models.blood_report import BloodReport
from backend.app.models.prediction import Prediction
from backend.app.schemas.health import (
    SymptomCreate,
    SymptomResponse,
    BloodReportCreate,
    BloodReportResponse,
)
from backend.app.schemas.prediction import (
    PredictionRequest,
    PredictionResponse,
    DeficiencyDetail,
)
from backend.app.ml.deficiency_predictor import predict_deficiencies
from backend.app.api.blood_report_parser import process_file_content
from backend.app.services.gemini_service import parse_blood_report_with_gemini

router = APIRouter(prefix="/api/assessment", tags=["Assessment"])


# ── Symptoms ─────────────────────────────────────────────────────────────────

@router.post("/symptoms", response_model=SymptomResponse, status_code=status.HTTP_201_CREATED)
def submit_symptoms(
    payload: SymptomCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit a symptom assessment."""
    record = SymptomRecord(user_id=current_user.id, **payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/symptoms", response_model=List[SymptomResponse])
def get_symptoms(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the user's symptom history, newest first (up to 10 records)."""
    records = (
        db.query(SymptomRecord)
        .filter(SymptomRecord.user_id == current_user.id)
        .order_by(SymptomRecord.recorded_at.desc())
        .limit(10)
        .all()
    )
    return records


# ── Blood report ─────────────────────────────────────────────────────────────

@router.post("/blood-report/parse")
async def parse_blood_report(file: UploadFile = File(...)):
    """Parse a blood report file (PDF/Image) using Gemini Multi-modal vision with fallback parser."""
    try:
        contents = await file.read()
        mime_type = file.content_type or "application/pdf"
        
        # 1. Try Gemini Multi-modal Vision/Document OCR first
        try:
            gemini_extracted = parse_blood_report_with_gemini(contents, mime_type=mime_type)
            if gemini_extracted and any(v is not None for v in gemini_extracted.values()):
                return {"extracted": gemini_extracted}
        except Exception:
            pass

        # 2. Fallback to regex / pdfplumber parser
        extracted = process_file_content(contents, file.filename)
        return {"extracted": extracted}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")


@router.post("/blood-report", response_model=BloodReportResponse, status_code=status.HTTP_201_CREATED)
def submit_blood_report(
    payload: BloodReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit blood report values."""
    report = BloodReport(user_id=current_user.id, **payload.model_dump())
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.get("/blood-report", response_model=List[BloodReportResponse])
def get_blood_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the user's blood report history, newest first (up to 10 records)."""
    reports = (
        db.query(BloodReport)
        .filter(BloodReport.user_id == current_user.id)
        .order_by(BloodReport.uploaded_at.desc())
        .limit(10)
        .all()
    )
    return reports


# ── Prediction ───────────────────────────────────────────────────────────────

@router.post("/predict", response_model=PredictionResponse)
def run_prediction(
    payload: PredictionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Run the deficiency prediction engine.

    Merges user's health profile, latest symptoms, latest blood report,
    and any explicit overrides from the request body.
    """
    features: dict = {}

    # 1) Health profile
    profile = db.query(HealthProfile).filter(HealthProfile.user_id == current_user.id).first()
    if profile:
        features.update({
            "age": profile.age,
            "gender": profile.gender,
            "height_cm": profile.height_cm,
            "weight_kg": profile.weight_kg,
            "bmi": profile.bmi,
            "activity_level": profile.activity_level,
            "medical_conditions": profile.medical_conditions,
        })

    # 2) Latest blood report
    blood = (
        db.query(BloodReport)
        .filter(BloodReport.user_id == current_user.id)
        .order_by(BloodReport.uploaded_at.desc())
        .first()
    )
    if blood:
        for field in [
            "hemoglobin", "iron", "ferritin", "vitamin_d",
            "vitamin_b12", "calcium", "magnesium", "zinc",
            "blood_sugar", "cholesterol",
        ]:
            features[field] = getattr(blood, field, None)

    # 3) Latest symptoms
    symptoms = (
        db.query(SymptomRecord)
        .filter(SymptomRecord.user_id == current_user.id)
        .order_by(SymptomRecord.recorded_at.desc())
        .first()
    )
    if symptoms:
        for field in [
            "fatigue", "hair_loss", "muscle_weakness", "dry_skin",
            "brittle_nails", "mood_changes", "pale_skin", "bone_pain",
            "poor_vision", "slow_healing", "loss_of_appetite", "tingling",
            "difficulty_concentrating", "frequent_illness"
        ]:
            features[field] = getattr(symptoms, field, 0)

    # 4) Overrides from the request body
    overrides = payload.model_dump(exclude_unset=True)
    features.update({k: v for k, v in overrides.items() if v is not None})

    # 5) Run prediction
    result = predict_deficiencies(features)

    # 6) Persist prediction
    pred = Prediction(
        user_id=current_user.id,
        confidence_score=result["confidence_score"],
        deficiencies_detected=json.dumps(result["details"]),
        **result["risk_fields"],
    )
    db.add(pred)
    db.commit()
    db.refresh(pred)

    return PredictionResponse(
        id=pred.id,
        user_id=pred.user_id,
        iron_risk=pred.iron_risk,
        vitamin_d_risk=pred.vitamin_d_risk,
        calcium_risk=pred.calcium_risk,
        magnesium_risk=pred.magnesium_risk,
        potassium_risk=pred.potassium_risk,
        vitamin_b12_risk=pred.vitamin_b12_risk,
        confidence_score=pred.confidence_score,
        deficiencies_detected=[DeficiencyDetail(**d) for d in result["details"]],
        prediction_date=pred.prediction_date,
    )


@router.get("/predictions", response_model=List[PredictionResponse])
def get_prediction_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the user's prediction history, newest first."""
    preds = (
        db.query(Prediction)
        .filter(Prediction.user_id == current_user.id)
        .order_by(Prediction.prediction_date.desc())
        .limit(20)
        .all()
    )
    results = []
    for pred in preds:
        try:
            details = [DeficiencyDetail(**d) for d in json.loads(pred.deficiencies_detected)]
        except (json.JSONDecodeError, TypeError):
            details = []
        results.append(PredictionResponse(
            id=pred.id,
            user_id=pred.user_id,
            iron_risk=pred.iron_risk,
            vitamin_d_risk=pred.vitamin_d_risk,
            calcium_risk=pred.calcium_risk,
            magnesium_risk=pred.magnesium_risk,
            potassium_risk=pred.potassium_risk,
            vitamin_b12_risk=pred.vitamin_b12_risk,
            confidence_score=pred.confidence_score,
            deficiencies_detected=details,
            prediction_date=pred.prediction_date,
        ))
    return results


@router.delete("/predictions")
def clear_prediction_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Clear all diagnostic prediction history for the current user."""
    db.query(Prediction).filter(Prediction.user_id == current_user.id).delete(synchronize_session=False)
    db.commit()
    return {"message": "Diagnostic history cleared successfully"}

