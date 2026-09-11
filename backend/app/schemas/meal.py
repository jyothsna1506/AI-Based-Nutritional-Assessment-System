"""
Pydantic schemas for meal plan endpoints.
"""
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime


class MealItem(BaseModel):
    food_name: str
    category: Optional[str] = None
    calories: float = 0
    protein: Optional[float] = None
    carbohydrates: Optional[float] = None
    fat: Optional[float] = None
    key_nutrients: Dict[str, float] = {}
    
    # Spoonacular recipe fields
    recipe_title: Optional[str] = None
    recipe_image: Optional[str] = None
    recipe_instructions: Optional[List[str]] = None
    recipe_ready_in: Optional[int] = None
    recipe_url: Optional[str] = None


class DayMeal(BaseModel):
    day: int
    meals: Dict[str, MealItem]       # breakfast / lunch / dinner / snack
    total_calories: float = 0


class MealPlanRequest(BaseModel):
    diet_preference: Optional[str] = None   # vegetarian / non_vegetarian / vegan
    daily_calorie_target: int = 2000


class MealPlanResponse(BaseModel):
    id: Optional[int] = None
    week_number: int
    year: int
    diet_preference: Optional[str] = None
    daily_calorie_target: int = 2000
    deficiencies_targeted: List[str] = []
    days: List[DayMeal] = []
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
