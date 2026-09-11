"""
Pydantic schemas for health profile, symptoms, and blood reports.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ── Health Profile ───────────────────────────────────────────────────────────

class HealthProfileCreate(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    bmi: Optional[float] = None
    activity_level: Optional[str] = None
    dietary_preference: Optional[str] = None
    health_goal: Optional[str] = None
    medical_conditions: Optional[str] = None
    allergies: Optional[str] = None
    smoking: Optional[bool] = False
    alcohol: Optional[bool] = False
    water_intake: Optional[float] = None
    sleep_hours: Optional[float] = None
    stress_level: Optional[str] = None


class HealthProfileResponse(HealthProfileCreate):
    id: int
    user_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Symptoms ─────────────────────────────────────────────────────────────────

class SymptomCreate(BaseModel):
    fatigue: int = Field(0, ge=0, le=5)
    hair_loss: int = Field(0, ge=0, le=5)
    muscle_weakness: int = Field(0, ge=0, le=5)
    dry_skin: int = Field(0, ge=0, le=5)
    brittle_nails: int = Field(0, ge=0, le=5)
    mood_changes: int = Field(0, ge=0, le=5)
    pale_skin: int = Field(0, ge=0, le=5)
    bone_pain: int = Field(0, ge=0, le=5)
    poor_vision: int = Field(0, ge=0, le=5)
    slow_healing: int = Field(0, ge=0, le=5)
    loss_of_appetite: int = Field(0, ge=0, le=5)
    tingling: int = Field(0, ge=0, le=5)
    difficulty_concentrating: int = Field(0, ge=0, le=5)
    frequent_illness: int = Field(0, ge=0, le=5)


class SymptomResponse(SymptomCreate):
    id: int
    user_id: int
    recorded_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Blood Report ─────────────────────────────────────────────────────────────

class BloodReportCreate(BaseModel):
    hemoglobin: Optional[float] = None
    iron: Optional[float] = None
    ferritin: Optional[float] = None
    vitamin_d: Optional[float] = None
    vitamin_b12: Optional[float] = None
    calcium: Optional[float] = None
    magnesium: Optional[float] = None
    zinc: Optional[float] = None
    blood_sugar: Optional[float] = None
    cholesterol: Optional[float] = None


class BloodReportResponse(BloodReportCreate):
    id: int
    user_id: int
    uploaded_at: Optional[datetime] = None

    class Config:
        from_attributes = True
