"""
SQLAlchemy ORM model for the **health_profiles** table.
"""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from backend.app.database.db import Base


class HealthProfile(Base):
    __tablename__ = "health_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)

    height_cm = Column(Float, nullable=True)
    weight_kg = Column(Float, nullable=True)
    bmi = Column(Float, nullable=True)

    activity_level = Column(String(50), nullable=True)                     # sedentary, light, moderate, active, very_active
    dietary_preference = Column(String(50), nullable=True)                 # vegetarian, non_vegetarian, vegan, eggetarian, keto …
    health_goal = Column(String(200), nullable=True)                       # weight_loss, muscle_gain, maintain …
    medical_conditions = Column(String(200), nullable=True)                # diabetes, hypertension, etc.
    allergies = Column(String(200), nullable=True)                         # dairy, gluten, etc.

    smoking = Column(Boolean, default=False)
    alcohol = Column(Boolean, default=False)

    water_intake = Column(Float, nullable=True)    # litres per day
    sleep_hours = Column(Float, nullable=True)
    stress_level = Column(String(20), nullable=True)   # low, moderate, high

    created_at = Column(DateTime, server_default=func.now())

    # Relationship
    user = relationship("User", back_populates="health_profile")
