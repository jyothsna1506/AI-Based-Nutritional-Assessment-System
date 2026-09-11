"""
Update foods table in connected PostgreSQL/SQLite database with updated diet_type from food_database_final.csv
"""
import pandas as pd
from pathlib import Path
from sqlalchemy.orm import Session
import logging

from backend.app.config.settings import FOOD_CSV_PATH
from backend.app.database.db import SessionLocal
from backend.app.models.food import Food

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def update_foods():
    csv_path = Path(FOOD_CSV_PATH).resolve()
    if not csv_path.exists():
        logger.error(f"CSV not found at {csv_path}")
        return

    logger.info(f"Reading updated dataset from {csv_path}...")
    df = pd.read_csv(csv_path)

    db: Session = SessionLocal()
    try:
        total_foods = db.query(Food).count()
        logger.info(f"Total foods in DB: {total_foods}")

        if total_foods == 0:
            logger.info("DB foods table is empty — will be seeded on startup.")
            return

        # Map food_name -> diet_type from CSV
        diet_map = dict(zip(df["Food_Name"], df["diet_type"]))

        logger.info("Updating DB food records with new diet_type tags...")
        foods = db.query(Food).all()
        updated_count = 0

        for f in foods:
            if f.food_name in diet_map:
                new_tag = diet_map[f.food_name]
                if f.diet_type != new_tag:
                    f.diet_type = new_tag
                    updated_count += 1

        db.commit()
        logger.info(f"Successfully updated {updated_count} food records in the DB!")
    except Exception as exc:
        db.rollback()
        logger.error(f"Failed to update DB foods: {exc}")
    finally:
        db.close()

if __name__ == "__main__":
    update_foods()
