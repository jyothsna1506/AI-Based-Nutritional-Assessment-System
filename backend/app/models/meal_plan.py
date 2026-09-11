"""
SQLAlchemy ORM model for the **meal_plans** table.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from backend.app.database.db import Base


class MealPlan(Base):
    __tablename__ = "meal_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    week_number = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    diet_preference = Column(String(50), nullable=True)
    plan_data = Column(String, default="{}")           # Full 7-day plan stored as JSON text
    daily_calories = Column(Float, default=2000)

    created_at = Column(DateTime, server_default=func.now())

    # Relationship
    user = relationship("User", back_populates="meal_plans")
