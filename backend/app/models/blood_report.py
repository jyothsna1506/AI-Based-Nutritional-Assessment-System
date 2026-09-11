"""
SQLAlchemy ORM model for the **blood_reports** table.
"""
from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from backend.app.database.db import Base


class BloodReport(Base):
    __tablename__ = "blood_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    hemoglobin = Column(Float, nullable=True)
    iron = Column(Float, nullable=True)
    ferritin = Column(Float, nullable=True)
    vitamin_d = Column(Float, nullable=True)
    vitamin_b12 = Column(Float, nullable=True)
    calcium = Column(Float, nullable=True)
    magnesium = Column(Float, nullable=True)
    zinc = Column(Float, nullable=True)
    blood_sugar = Column(Float, nullable=True)
    cholesterol = Column(Float, nullable=True)

    uploaded_at = Column(DateTime, server_default=func.now())

    # Relationship
    user = relationship("User", back_populates="blood_reports")
