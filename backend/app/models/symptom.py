"""
SQLAlchemy ORM model for the **symptom_records** table.
Each symptom is rated 0-5.
"""
from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from backend.app.database.db import Base


class SymptomRecord(Base):
    __tablename__ = "symptom_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    fatigue = Column(Integer, default=0)
    hair_loss = Column(Integer, default=0)
    muscle_weakness = Column(Integer, default=0)
    dry_skin = Column(Integer, default=0)
    brittle_nails = Column(Integer, default=0)
    mood_changes = Column(Integer, default=0)
    pale_skin = Column(Integer, default=0)
    bone_pain = Column(Integer, default=0)
    poor_vision = Column(Integer, default=0)
    slow_healing = Column(Integer, default=0)
    loss_of_appetite = Column(Integer, default=0)
    tingling = Column(Integer, default=0)
    difficulty_concentrating = Column(Integer, default=0)
    frequent_illness = Column(Integer, default=0)

    recorded_at = Column(DateTime, server_default=func.now())

    # Relationship
    user = relationship("User", back_populates="symptom_records")
