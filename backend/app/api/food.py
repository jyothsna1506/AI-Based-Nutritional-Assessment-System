"""
Food search and food diary endpoints.
"""
from datetime import date, datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func as sa_func

from backend.app.database.db import get_db
from backend.app.auth.jwt_handler import get_current_user
from backend.app.models.user import User
from backend.app.models.food import Food
from backend.app.models.food_diary import FoodDiary
from backend.app.schemas.food import FoodResponse, FoodDiaryCreate, FoodDiaryResponse

router = APIRouter(tags=["Foods"])


# ── Food search ──────────────────────────────────────────────────────────────

@router.get("/api/foods/search", response_model=List[FoodResponse])
def search_foods(
    q: Optional[str] = Query(None, description="Search term for food name"),
    category: Optional[str] = Query(None),
    diet_type: Optional[str] = Query(None),
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db),
):
    """Search foods by name, category, or diet type (no auth required)."""
    query = db.query(Food)

    if q:
        query = query.filter(Food.food_name.ilike(f"%{q}%"))
    if category:
        query = query.filter(Food.category.ilike(f"%{category}%"))
    if diet_type:
        query = query.filter(Food.diet_type.ilike(f"%{diet_type}%"))

    return query.limit(limit).all()


@router.get("/api/foods/categories", response_model=List[str])
def get_food_categories(db: Session = Depends(get_db)):
    """Get all unique food categories."""
    rows = db.query(Food.category).distinct().filter(Food.category.isnot(None)).all()
    return sorted([r[0] for r in rows if r[0]])


@router.get("/api/foods/{food_id}", response_model=FoodResponse)
def get_food_detail(food_id: int, db: Session = Depends(get_db)):
    """Get full nutritional details for a specific food."""
    food = db.query(Food).filter(Food.id == food_id).first()
    if not food:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Food not found")
    return food


# ── Food diary ───────────────────────────────────────────────────────────────

@router.post("/api/food-diary", response_model=FoodDiaryResponse, status_code=status.HTTP_201_CREATED)
def log_food_entry(
    payload: FoodDiaryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Log a food entry in the user's diary."""
    data = payload.model_dump()
    entry = FoodDiary(
        user_id=current_user.id,
        **data,
    )
    db.add(entry)
    try:
        db.commit()
        db.refresh(entry)
        return entry
    except Exception as exc:
        db.rollback()
        # Fallback if DB table lacks 'unit' column on production database
        data_no_unit = {k: v for k, v in data.items() if k != "unit"}
        entry_fallback = FoodDiary(
            user_id=current_user.id,
            **data_no_unit,
        )
        db.add(entry_fallback)
        try:
            db.commit()
            db.refresh(entry_fallback)
            return entry_fallback
        except Exception as exc2:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Database error logging food: {str(exc2)}")


@router.get("/api/food-diary", response_model=List[FoodDiaryResponse])
def get_food_diary(
    target_date: Optional[str] = Query(None, alias="date", description="YYYY-MM-DD"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get food diary entries for a specific date (defaults to today)."""
    query = db.query(FoodDiary).filter(FoodDiary.user_id == current_user.id)

    if target_date:
        try:
            d = date.fromisoformat(target_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
        query = query.filter(sa_func.date(FoodDiary.created_at) == d)
    else:
        query = query.filter(sa_func.date(FoodDiary.created_at) == date.today())

    return query.order_by(FoodDiary.created_at.desc()).all()


@router.delete("/api/food-diary/{entry_id}")
def delete_food_diary_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a food entry from the user's food diary."""
    entry = db.query(FoodDiary).filter(FoodDiary.id == entry_id, FoodDiary.user_id == current_user.id).first()
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Food diary entry not found")
    db.delete(entry)
    db.commit()
    return {"message": "Food entry deleted successfully"}
