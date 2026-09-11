"""
SQLAlchemy ORM model for the **users** table.
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from backend.app.database.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    phone = Column(String(20), nullable=True)
    role = Column(String(20), default="USER")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    health_profile = relationship("HealthProfile", back_populates="user", uselist=False)
    symptom_records = relationship("SymptomRecord", back_populates="user")
    blood_reports = relationship("BloodReport", back_populates="user")
    predictions = relationship("Prediction", back_populates="user")
    meal_plans = relationship("MealPlan", back_populates="user")
    food_diary_entries = relationship("FoodDiary", back_populates="user")
    progress_logs = relationship("ProgressLog", back_populates="user")
