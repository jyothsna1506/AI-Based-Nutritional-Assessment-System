"""
SQLAlchemy ORM model for the **predictions** table.
"""
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from backend.app.database.db import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    iron_risk = Column(Float, default=0.0)
    vitamin_d_risk = Column(Float, default=0.0)
    calcium_risk = Column(Float, default=0.0)
    magnesium_risk = Column(Float, default=0.0)
    potassium_risk = Column(Float, default=0.0)
    vitamin_b12_risk = Column(Float, default=0.0)

    confidence_score = Column(Float, default=0.0)
    deficiencies_detected = Column(String, default="[]")  # JSON text

    prediction_date = Column(DateTime, server_default=func.now())

    # Relationship
    user = relationship("User", back_populates="predictions")
