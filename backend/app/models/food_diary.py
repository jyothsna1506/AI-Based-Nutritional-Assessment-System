"""
SQLAlchemy ORM model for the **food_diary** table.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from backend.app.database.db import Base


class FoodDiary(Base):
    __tablename__ = "food_diary"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    food_id = Column(Integer, ForeignKey("foods.id"), nullable=True)

    food_name = Column(String(200), nullable=False)
    meal_type = Column(String(30), nullable=True)   # breakfast, lunch, dinner, snack
    quantity = Column(Float, default=1.0)
    unit = Column(String(50), nullable=True, default="servings")
    meal_time = Column(DateTime, nullable=True)

    calories = Column(Float, default=0)
    protein = Column(Float, default=0)
    carbs = Column(Float, default=0)
    fat = Column(Float, default=0)

    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="food_diary_entries")
