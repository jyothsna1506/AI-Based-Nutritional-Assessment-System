"""
Pydantic schemas for ML prediction endpoints.
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class DeficiencyDetail(BaseModel):
    name: str                          # e.g. "Iron Deficiency (Anemia)"
    model_key: str                     # e.g. "Iron_Anemia_Deficiency"
    risk_score: float                  # 0.0 – 1.0 probability
    severity: str                      # low / moderate / high


class PredictionRequest(BaseModel):
    """
    Optional overrides — if not supplied the endpoint will pull the latest
    health profile, symptoms, and blood report from the database.
    """
    age: Optional[int] = None
    gender: Optional[str] = None
    bmi: Optional[float] = None
    hemoglobin: Optional[float] = None
    iron: Optional[float] = None
    ferritin: Optional[float] = None
    vitamin_d: Optional[float] = None
    vitamin_b12: Optional[float] = None
    calcium: Optional[float] = None
    magnesium: Optional[float] = None
    zinc: Optional[float] = None

    # Symptoms (0-5)
    fatigue: Optional[int] = None
    hair_loss: Optional[int] = None
    muscle_weakness: Optional[int] = None
    dry_skin: Optional[int] = None
    brittle_nails: Optional[int] = None
    mood_changes: Optional[int] = None
    pale_skin: Optional[int] = None
    bone_pain: Optional[int] = None


class PredictionResponse(BaseModel):
    id: int
    user_id: int
    iron_risk: float
    vitamin_d_risk: float
    calcium_risk: float
    magnesium_risk: float
    potassium_risk: float
    vitamin_b12_risk: float
    confidence_score: float
    deficiencies_detected: List[DeficiencyDetail]
    prediction_date: Optional[datetime] = None

    class Config:
        from_attributes = True
