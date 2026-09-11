"""
Pydantic schemas for food search and food diary endpoints.
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class FoodSearch(BaseModel):
    q: Optional[str] = None
    category: Optional[str] = None
    diet_type: Optional[str] = None
    limit: int = 20


class FoodResponse(BaseModel):
    id: int
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
    folate_mcg: float = 0
    sodium_mg: float = 0
    vitamin_a_mcg_rae: float = 0
    vitamin_e_mg: float = 0
    vitamin_k_mcg: float = 0
    riboflavin_mg: float = 0
    thiamin_mg: float = 0
    niacin_mg: float = 0
    vitamin_b6_mg: float = 0
    sugars_g: float = 0
    cholesterol_mg: float = 0
    nutriscore_grade: Optional[str] = None

    class Config:
        from_attributes = True


class FoodDiaryCreate(BaseModel):
    food_id: Optional[int] = None
    food_name: str
    meal_type: Optional[str] = None      # breakfast / lunch / dinner / snack
    quantity: float = 1.0
    unit: Optional[str] = "servings"
    meal_time: Optional[datetime] = None
    calories: float = 0
    protein: float = 0
    carbs: float = 0
    fat: float = 0


class FoodDiaryResponse(FoodDiaryCreate):
    id: int
    user_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
