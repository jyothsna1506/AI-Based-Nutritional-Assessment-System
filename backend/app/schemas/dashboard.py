"""
Pydantic schemas for the dashboard endpoint.
"""
from pydantic import BaseModel
from typing import Optional, List, Dict


class NutrientSummary(BaseModel):
    calories_today: float = 0
    protein_today: float = 0
    carbs_today: float = 0
    fat_today: float = 0


class DeficiencyRisk(BaseModel):
    name: str
    risk: float


class DashboardResponse(BaseModel):
    user_name: str
    nutrition_score: float = 85.0
    nutrition_score_trend: str = "+0% Baseline"
    deficiency_count: int = 0
    high_risk_count: int = 0
    risk_level: str = "Optimal"
    daily_calories: float = 0.0
    daily_calorie_target: float = 2000.0
    water_intake: float = 0.0
    water_target: float = 3.0
    nutrient_summary: NutrientSummary = NutrientSummary()
    deficiency_risks: List[DeficiencyRisk] = []
    recent_predictions: List[Dict] = []
    recent_diary: List[Dict] = []
    bmi: Optional[float] = None
    weight: Optional[float] = None
