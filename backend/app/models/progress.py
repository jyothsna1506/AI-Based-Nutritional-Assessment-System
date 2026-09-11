"""
SQLAlchemy ORM model for the **progress_logs** table.
"""
from sqlalchemy import Column, Integer, Float, Date, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from backend.app.database.db import Base


class ProgressLog(Base):
    __tablename__ = "progress_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    weight = Column(Float, nullable=True)
    bmi = Column(Float, nullable=True)
    calories_consumed = Column(Float, nullable=True)
    water_intake = Column(Float, nullable=True)
    nutrition_score = Column(Float, nullable=True)

    log_date = Column(Date, server_default=func.current_date())

    # Relationship
    user = relationship("User", back_populates="progress_logs")
