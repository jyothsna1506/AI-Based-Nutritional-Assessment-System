"""
Deficiency prediction engine.

Takes user health data (age, gender, BMI, blood values, symptoms),
constructs the exact 13-feature vector expected by the ML models,
combines Random Forest model probabilities with clinically validated biomarker rules,
and returns accurate deficiency risk scores and confidence metrics.
"""
import logging
from typing import Dict, List, Any

import numpy as np

from backend.app.ml.model_loader import get_models, get_scaler, DEFICIENCY_KEYS

logger = logging.getLogger(__name__)

# ── Human-friendly names ─────────────────────────────────────────────────────
FRIENDLY_NAMES: Dict[str, str] = {
    "Vitamin_D_Deficiency": "Vitamin D Deficiency",
    "Iron_Anemia_Deficiency": "Iron Deficiency (Anemia)",
    "MAGN_Deficiency": "Magnesium Deficiency",
    "R_Deficiency": "Riboflavin (B2) Deficiency",
    "SCA_Deficiency": "Calcium Deficiency",
    "SK_Deficiency": "Potassium Deficiency",
}

# ── Mapping model keys to Prediction ORM risk field names ────────────────────
RISK_FIELD_MAP: Dict[str, str] = {
    "Iron_Anemia_Deficiency": "iron_risk",
    "Vitamin_D_Deficiency": "vitamin_d_risk",
    "SCA_Deficiency": "calcium_risk",
    "MAGN_Deficiency": "magnesium_risk",
    "SK_Deficiency": "potassium_risk",
    "R_Deficiency": "vitamin_b12_risk",
}

# ── Exact 13 features expected by trained scaler & Random Forest models ──────
# ["RIDAGEYR", "BMXHT", "BMXWAIST", "BMXBMI", "PAD680", "LBXSKSI", "LBXSCA",
#  "LBXMAGN", "LBXHGB", "LBXSIR", "RIAGENDR_Male", "HSQ590_2.0", "MCQ010_2.0"]
FEATURE_NAMES: List[str] = [
    "RIDAGEYR",       # Age
    "BMXHT",          # Height (cm)
    "BMXWAIST",       # Waist circumference (cm)
    "BMXBMI",         # BMI
    "PAD680",         # Physical activity / sedentary time (minutes/day)
    "LBXSKSI",        # Serum Potassium (mmol/L)
    "LBXSCA",         # Total Calcium (mg/dL)
    "LBXMAGN",        # Serum Magnesium (mmol/L)
    "LBXHGB",         # Hemoglobin (g/dL)
    "LBXSIR",         # Serum Iron (ug/dL)
    "RIAGENDR_Male",  # Gender (1 if Male, 0 if Female)
    "HSQ590_2.0",     # High symptom flag (0/1)
    "MCQ010_2.0",     # Medical condition flag (0/1)
]


def _encode_gender(gender: Any) -> int:
    """Return 1 if male, 0 if female/other."""
    if not gender:
        return 0
    g = str(gender).strip().lower()
    return 1 if g in ("male", "m", "1", "true") else 0


def _get_sedentary_minutes(activity_level: Any) -> float:
    """Map activity level string to sedentary minutes per day."""
    if not activity_level:
        return 360.0
    act = str(activity_level).strip().lower()
    if "sedentary" in act:
        return 480.0
    if "light" in act:
        return 360.0
    if "moderate" in act:
        return 240.0
    if "active" in act or "very" in act or "extreme" in act:
        return 120.0
    return 360.0


def _build_feature_vector(features: Dict[str, Any]) -> np.ndarray:
    """
    Construct the 1x13 numpy array corresponding to the 13 feature columns
    used during model training.
    """
    age = float(features.get("age") or 30.0)
    height = float(features.get("height_cm") or 170.0)
    bmi = float(features.get("bmi") or 22.5)

    # Estimate waist circumference if not explicitly provided
    waist = float(features.get("waist_cm") or (height * 0.48 if height > 0 else 80.0))
    sedentary = _get_sedentary_minutes(features.get("activity_level"))

    potassium = float(features.get("potassium") or 4.2)
    calcium = float(features.get("calcium") or 9.5)
    magnesium = float(features.get("magnesium") or 2.0)
    hemoglobin = float(features.get("hemoglobin") or 14.0)
    iron = float(features.get("iron") or 90.0)

    is_male = _encode_gender(features.get("gender"))

    # Compute symptom flag from user's symptom ratings (0-5 scale)
    symptom_keys = [
        "fatigue", "hair_loss", "muscle_weakness", "dry_skin",
        "brittle_nails", "mood_changes", "pale_skin", "bone_pain",
        "poor_vision", "slow_healing", "loss_of_appetite", "tingling",
        "difficulty_concentrating", "frequent_illness",
    ]
    symptom_vals = [float(features.get(k) or 0) for k in symptom_keys]
    avg_symptom = float(np.mean(symptom_vals)) if symptom_vals else 0.0
    high_symptoms_flag = 1 if avg_symptom >= 1.5 else 0

    # Medical conditions flag
    med_cond = str(features.get("medical_conditions") or "").strip().lower()
    has_med_cond_flag = 1 if med_cond and med_cond != "none" else 0

    vec = [
        age,                 # RIDAGEYR
        height,              # BMXHT
        waist,               # BMXWAIST
        bmi,                 # BMXBMI
        sedentary,           # PAD680
        potassium,           # LBXSKSI
        calcium,             # LBXSCA
        magnesium,           # LBXMAGN
        hemoglobin,          # LBXHGB
        iron,                # LBXSIR
        is_male,             # RIAGENDR_Male
        high_symptoms_flag,  # HSQ590_2.0
        has_med_cond_flag,   # MCQ010_2.0
    ]

    return np.array(vec, dtype=np.float64).reshape(1, -1)


def _compute_clinical_risk(key: str, features: Dict[str, Any]) -> float:
    """
    Compute evidence-based clinical risk score (0.0 to 1.0) using standard
    medical lab thresholds and reported symptom ratings.
    """
    gender = str(features.get("gender") or "").strip().lower()
    is_female = gender in ("female", "f")

    # Extract lab values (None if omitted)
    hemoglobin = features.get("hemoglobin")
    iron = features.get("iron")
    ferritin = features.get("ferritin")
    vitamin_d = features.get("vitamin_d")
    vitamin_b12 = features.get("vitamin_b12")
    calcium = features.get("calcium")
    magnesium = features.get("magnesium")
    zinc = features.get("zinc")
    potassium = features.get("potassium")

    # Extract symptom ratings (0 to 5 scale)
    fatigue = float(features.get("fatigue") or 0)
    pale_skin = float(features.get("pale_skin") or 0)
    brittle_nails = float(features.get("brittle_nails") or 0)
    hair_loss = float(features.get("hair_loss") or 0)
    bone_pain = float(features.get("bone_pain") or 0)
    muscle_weakness = float(features.get("muscle_weakness") or 0)
    frequent_illness = float(features.get("frequent_illness") or 0)
    dry_skin = float(features.get("dry_skin") or 0)
    tingling = float(features.get("tingling") or 0)
    mood_changes = float(features.get("mood_changes") or 0)
    concentrating = float(features.get("difficulty_concentrating") or 0)

    risk = 0.0

    if key == "Iron_Anemia_Deficiency":
        # Lab signals
        if hemoglobin is not None:
            cutoff = 12.0 if is_female else 13.5
            if float(hemoglobin) < cutoff:
                risk += 0.45 + min((cutoff - float(hemoglobin)) * 0.1, 0.4)
        if iron is not None and float(iron) < 60.0:
            risk += 0.35
        if ferritin is not None and float(ferritin) < 20.0:
            risk += 0.35
        # Symptom signals
        risk += (fatigue * 0.06) + (pale_skin * 0.06) + (brittle_nails * 0.04) + (hair_loss * 0.03)

    elif key == "Vitamin_D_Deficiency":
        # Lab signals
        if vitamin_d is not None:
            v_d = float(vitamin_d)
            if v_d < 20.0:
                risk += 0.70 + min((20.0 - v_d) * 0.015, 0.25)
            elif v_d < 30.0:
                risk += 0.40 + (30.0 - v_d) * 0.02
        # Symptom signals
        risk += (bone_pain * 0.08) + (muscle_weakness * 0.06) + (frequent_illness * 0.04)

    elif key == "SCA_Deficiency":
        # Lab signals (Calcium)
        if calcium is not None and float(calcium) < 8.5:
            risk += 0.60 + min((8.5 - float(calcium)) * 0.15, 0.3)
        # Symptom signals
        risk += (bone_pain * 0.07) + (muscle_weakness * 0.06) + (brittle_nails * 0.04) + (dry_skin * 0.03)

    elif key == "MAGN_Deficiency":
        # Lab signals (Magnesium)
        if magnesium is not None and float(magnesium) < 1.7:
            risk += 0.60 + min((1.7 - float(magnesium)) * 0.3, 0.3)
        # Symptom signals
        risk += (muscle_weakness * 0.07) + (tingling * 0.06) + (mood_changes * 0.05) + (fatigue * 0.04)

    elif key == "SK_Deficiency":
        # Lab signals (Potassium)
        if potassium is not None and float(potassium) < 3.5:
            risk += 0.60 + min((3.5 - float(potassium)) * 0.2, 0.3)
        # Symptom signals
        risk += (muscle_weakness * 0.08) + (fatigue * 0.06)

    elif key == "R_Deficiency":
        # Lab signals (B12 / Riboflavin)
        if vitamin_b12 is not None:
            v_b12 = float(vitamin_b12)
            if v_b12 < 200.0:
                risk += 0.65 + min((200.0 - v_b12) * 0.0015, 0.25)
            elif v_b12 < 300.0:
                risk += 0.35 + (300.0 - v_b12) * 0.002
        # Symptom signals
        risk += (tingling * 0.07) + (concentrating * 0.06) + (fatigue * 0.05)

    return float(np.clip(risk, 0.0, 0.98))


def _severity_label(risk: float) -> str:
    if risk >= 0.6:
        return "high"
    if risk >= 0.3:
        return "moderate"
    return "low"


def predict_deficiencies(features: Dict[str, Any]) -> Dict[str, Any]:
    """
    Run prediction by combining trained scikit-learn models with clinical biomarker rules.
    """
    models = get_models()
    scaler = get_scaler()

    # Build 1x13 feature matrix for ML models
    X_raw = _build_feature_vector(features)

    # Scale feature matrix if scaler is available
    if scaler is not None:
        try:
            X_scaled = scaler.transform(X_raw)
        except Exception as exc:
            logger.warning("Scaler transform warning, fallback to raw features: %s", exc)
            X_scaled = X_raw
    else:
        X_scaled = X_raw

    # Track data presence for Assessment Confidence Score
    has_profile = any(features.get(k) is not None for k in ["age", "gender", "bmi", "height_cm", "weight_kg"])
    has_blood = any(features.get(k) is not None for k in ["hemoglobin", "iron", "ferritin", "vitamin_d", "vitamin_b12", "calcium", "magnesium", "zinc", "potassium"])
    has_symptoms = any(float(features.get(k) or 0) > 0 for k in ["fatigue", "hair_loss", "muscle_weakness", "dry_skin", "brittle_nails", "mood_changes", "pale_skin", "bone_pain"])

    risks: Dict[str, float] = {}
    details: List[Dict[str, Any]] = []
    risk_fields: Dict[str, float] = {}

    for key in DEFICIENCY_KEYS:
        # 1. ML Model prediction
        model = models.get(key)
        ml_risk = 0.0
        if model is not None:
            try:
                if hasattr(model, "predict_proba"):
                    proba = model.predict_proba(X_scaled)
                    ml_risk = float(proba[0][1]) if proba.shape[1] > 1 else float(proba[0][0])
                else:
                    pred = model.predict(X_scaled)
                    ml_risk = float(pred[0])
            except Exception as exc:
                logger.error("ML model prediction error for %s: %s", key, exc)
                ml_risk = 0.0

        # 2. Clinical evidence risk score
        clinical_risk = _compute_clinical_risk(key, features)

        # 3. Hybrid ensemble: weighted combination of ML model and clinical evidence
        if has_blood or has_symptoms:
            # When user provided lab data or symptoms, combine ML model + clinical rules
            combined_risk = 0.40 * ml_risk + 0.60 * clinical_risk
        else:
            # Baseline from ML model
            combined_risk = ml_risk

        final_risk = round(float(np.clip(combined_risk, 0.0, 0.98)), 4)

        risks[key] = final_risk
        details.append({
            "name": FRIENDLY_NAMES.get(key, key),
            "model_key": key,
            "risk_score": final_risk,
            "severity": _severity_label(final_risk),
        })

        field = RISK_FIELD_MAP.get(key)
        if field:
            risk_fields[field] = final_risk

    # 4. Assessment Confidence Score (0.0 to 1.0) based on data completeness
    confidence = 0.20  # Base confidence
    if has_profile:
        confidence += 0.30
    if has_blood:
        confidence += 0.35
    if has_symptoms:
        confidence += 0.15

    confidence = round(float(min(confidence, 1.0)), 4)

    return {
        "risks": risks,
        "details": details,
        "confidence_score": confidence,
        "risk_fields": risk_fields,
    }
