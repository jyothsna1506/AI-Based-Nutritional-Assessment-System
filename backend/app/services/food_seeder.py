"""
Seed the ``foods`` table from ``food_database_final.csv`` on first startup.

Optimised for low-memory environments (e.g. Render 512MB RAM cap) using
lightweight streaming csv.DictReader and chunked bulk insertions.
"""
import csv
import gc
import logging
from pathlib import Path
from typing import Dict, List

from sqlalchemy.orm import Session

from backend.app.config.settings import FOOD_CSV_PATH
from backend.app.database.db import SessionLocal
from backend.app.models.food import Food

logger = logging.getLogger(__name__)

# Map CSV column names → (Food ORM attribute name, type caster)
_CSV_TO_ORM: dict = {
    "Food_Name": ("food_name", str),
    "Food_Category": ("category", str),
    "diet_type": ("diet_type", str),
    "meal_type": ("meal_type", str),
    "Energy_kcal": ("energy_kcal", float),
    "Protein_g": ("protein_g", float),
    "Carbohydrate_g": ("carbohydrate_g", float),
    "Fat_g": ("fat_g", float),
    "Fiber_g": ("fiber_g", float),
    "Iron_mg": ("iron_mg", float),
    "Calcium_mg": ("calcium_mg", float),
    "Magnesium_mg": ("magnesium_mg", float),
    "Zinc_mg": ("zinc_mg", float),
    "Potassium_mg": ("potassium_mg", float),
    "Sodium_mg": ("sodium_mg", float),
    "VitaminD_mcg": ("vitamin_d_mcg", float),
    "VitaminB12_mcg": ("vitamin_b12_mcg", float),
    "VitaminC_mg": ("vitamin_c_mg", float),
    "VitaminA_mcgRAE": ("vitamin_a_mcg_rae", float),
    "VitaminE_mg": ("vitamin_e_mg", float),
    "VitaminK_mcg": ("vitamin_k_mcg", float),
    "Riboflavin_mg": ("riboflavin_mg", float),
    "Thiamin_mg": ("thiamin_mg", float),
    "Niacin_mg": ("niacin_mg", float),
    "VitaminB6_mg": ("vitamin_b6_mg", float),
    "Folate_mcg": ("folate_mcg", float),
    "Sugars_g": ("sugars_g", float),
    "Cholesterol_mg": ("cholesterol_mg", float),
    "nutriscore_grade": ("nutriscore_grade", str),
}


def seed_foods() -> None:
    """Read the food CSV using lightweight streaming DictReader and bulk insert in chunks."""
    csv_path = Path(FOOD_CSV_PATH)
    if not csv_path.exists():
        logger.warning(
            "Food CSV not found at %s — skipping food database seeding.", csv_path
        )
        return

    db: Session = SessionLocal()
    try:
        existing_count = db.query(Food).count()
        if existing_count > 0:
            logger.info(
                "Foods table already has %d rows — skipping seed.", existing_count
            )
            return

        logger.info(
            "Seeding foods table from %s using low-memory streaming...", csv_path
        )

        chunk: List[Dict] = []
        total_seeded = 0

        with open(csv_path, mode="r", encoding="utf-8-sig", errors="ignore") as f:
            reader = csv.DictReader(f)
            for row in reader:
                record: Dict = {}
                for csv_col, (orm_attr, col_type) in _CSV_TO_ORM.items():
                    val = row.get(csv_col, "")
                    if val is None or val == "" or val == "nan":
                        record[orm_attr] = None
                    else:
                        try:
                            record[orm_attr] = col_type(val)
                        except (ValueError, TypeError):
                            record[orm_attr] = None

                chunk.append(record)

                if len(chunk) >= 1000:
                    db.bulk_insert_mappings(Food, chunk)
                    db.commit()
                    total_seeded += len(chunk)
                    chunk.clear()
                    gc.collect()

            if chunk:
                db.bulk_insert_mappings(Food, chunk)
                db.commit()
                total_seeded += len(chunk)
                chunk.clear()

        logger.info("Seeded %d foods into the database successfully.", total_seeded)

    except Exception as exc:
        db.rollback()
        logger.error("Failed to seed foods table: %s", exc)
    finally:
        db.close()
