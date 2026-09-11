"""
SQLAlchemy ORM model for the **foods** table.
Seeded from the processed food CSV on first startup.
"""
from sqlalchemy import Column, Integer, String, Float

from backend.app.database.db import Base


class Food(Base):
    __tablename__ = "foods"

    id = Column(Integer, primary_key=True, index=True)
    food_name = Column(String(200), nullable=False)
    category = Column(String(100), nullable=True)
    diet_type = Column(String(50), nullable=True)       # vegetarian / non_vegetarian / vegan
    meal_type = Column(String(200), nullable=True)       # comma-separated: breakfast,lunch,dinner,snack

    # Macronutrients
    energy_kcal = Column(Float, default=0)
    protein_g = Column(Float, default=0)
    carbohydrate_g = Column(Float, default=0)
    fat_g = Column(Float, default=0)
    fiber_g = Column(Float, default=0)

    # Minerals
    iron_mg = Column(Float, default=0)
    calcium_mg = Column(Float, default=0)
    magnesium_mg = Column(Float, default=0)
    zinc_mg = Column(Float, default=0)
    potassium_mg = Column(Float, default=0)
    sodium_mg = Column(Float, default=0)

    # Vitamins
    vitamin_d_mcg = Column(Float, default=0)
    vitamin_b12_mcg = Column(Float, default=0)
    vitamin_c_mg = Column(Float, default=0)
    vitamin_a_mcg_rae = Column(Float, default=0)
    vitamin_e_mg = Column(Float, default=0)
    vitamin_k_mcg = Column(Float, default=0)
    riboflavin_mg = Column(Float, default=0)
    thiamin_mg = Column(Float, default=0)
    niacin_mg = Column(Float, default=0)
    vitamin_b6_mg = Column(Float, default=0)
    folate_mcg = Column(Float, default=0)

    # Other
    sugars_g = Column(Float, default=0)
    cholesterol_mg = Column(Float, default=0)
    nutriscore_grade = Column(String(5), nullable=True)
