"""
Preprocess Food Composition Data
================================
Loads raw unified food composition CSV, cleans it, adds diet_type and meal_type
columns, deduplicates by Food_Name (aggregating nutritional values), and saves
the final processed food database.

Usage:
    python ml/preprocessing/preprocess_food_data.py
"""

import os
import sys
import pandas as pd
import numpy as np

# ---------------------------------------------------------------------------
# Path setup – works regardless of where the script is invoked from
# ---------------------------------------------------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))

RAW_PATH = os.path.join(PROJECT_ROOT, "ml", "datasets", "raw", "df_unified_food_composition.csv")
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "ml", "datasets", "processed")
OUTPUT_PATH = os.path.join(OUTPUT_DIR, "food_database_final.csv")

# ---------------------------------------------------------------------------
# Category → diet_type mapping
# ---------------------------------------------------------------------------
NON_VEG_CATEGORIES = {
    "Beef Products",
    "Pork Products",
    "Poultry Products",
    "Lamb Veal And Game Products",
    "Finfish And Shellfish Products",
    "Sausages And Luncheon Meats",
}

# Dairy items are vegetarian but NOT vegan
DAIRY_CATEGORIES = {
    "Dairy And Egg Products",
}

# ---------------------------------------------------------------------------
# Category → meal_type mapping
# ---------------------------------------------------------------------------
BREAKFAST_CATEGORIES = {
    "Cereal Grains And Pasta",
    "Dairy And Egg Products",
    "Baked Products",
    "Fruits And Fruit Juices",
    "Beverages",
}

LUNCH_DINNER_CATEGORIES = {
    "Legumes And Legume Products",
    "Vegetables And Vegetable Products",
    "Cereal Grains And Pasta",
    "Soups Sauces And Gravies",
    "Restaurant Foods",
} | NON_VEG_CATEGORIES  # all non-veg categories also qualify for lunch/dinner

SNACK_CATEGORIES = {
    "Nut And Seed Products",
    "Fruits And Fruit Juices",
    "Sweets",
    "Beverages",
    "Baked Products",
}

# ---------------------------------------------------------------------------
# Nutrient columns (everything except Food_Name, Food_Category, nutriscore_grade)
# ---------------------------------------------------------------------------
NUTRIENT_COLS = [
    "VitaminC_mg", "Potassium_mg", "Carbohydrate_g", "Calcium_mg", "Zinc_mg",
    "VitaminB6_mg", "Protein_g", "Cholesterol_mg", "Energy_kcal", "Riboflavin_mg",
    "Thiamin_mg", "Iron_mg", "Folate_mcg", "VitaminE_mg", "Niacin_mg",
    "VitaminD_mcg", "VitaminB12_mcg", "Fat_g", "VitaminK_mcg", "Magnesium_mg",
    "Fiber_g", "Sodium_mg", "VitaminA_mcgRAE", "Sugars_g",
]


def convert_nutriscore(value):
    """Convert numeric nutriscore (0-10) to letter grades a-e, or 'unknown'."""
    if pd.isna(value):
        return "unknown"
    try:
        num = float(value)
    except (ValueError, TypeError):
        # Already a letter?
        if isinstance(value, str) and value.strip().lower() in {"a", "b", "c", "d", "e"}:
            return value.strip().lower()
        return "unknown"

    # Map 0-10 numeric range to a-e
    if num <= 2:
        return "a"
    elif num <= 4:
        return "b"
    elif num <= 6:
        return "c"
    elif num <= 8:
        return "d"
    elif num <= 10:
        return "e"
    else:
        return "unknown"


def assign_diet_type(category: str, food_name: str) -> str:
    """Return 'non_vegetarian', 'vegetarian', or 'vegan'."""
    category_lower = category.lower()
    food_name_lower = food_name.lower()
    
    # 1. Exclude egg and egg products from vegetarian (classify as non_vegetarian)
    is_egg = False
    if "egg" in food_name_lower:
        exclusions = ["eggplant", "eggless", "substitute", "replacer", "replacement", "egg fruit"]
        if not any(ex in food_name_lower for ex in exclusions):
            is_egg = True
            
    if is_egg or category in NON_VEG_CATEGORIES:
        return "non_vegetarian"
        
    # 2. Classify dairy products as vegetarian (but NOT vegan)
    dairy_keywords = ["milk", "cheese", "butter", "ghee", "paneer", "yogurt", "yoghurt", "curd", "cream", "whey", "casein", "lactose", "dairy"]
    is_dairy = False
    if category in DAIRY_CATEGORIES:
        is_dairy = True
    elif any(kw in food_name_lower for kw in dairy_keywords):
        # Exclude plant-based milks and spreads (soy milk, almond milk, peanut butter, margarine, etc.)
        plant_exclusions = ["coconut", "almond", "soy", "peanut", "cashew", "oat", "rice", "hemp", "hazelnut", "macadamia", "vegan", "plant", "margarine"]
        if not any(pe in food_name_lower for pe in plant_exclusions):
            is_dairy = True
            
    if is_dairy:
        return "vegetarian"
        
    # 3. Everything else is vegan (and therefore also vegetarian)
    return "vegan"




def assign_meal_type(category: str) -> str:
    """Return comma-separated meal types the food is suitable for."""
    meals = []
    if category in BREAKFAST_CATEGORIES:
        meals.append("breakfast")
    if category in LUNCH_DINNER_CATEGORIES:
        meals.append("lunch")
        meals.append("dinner")
    if category in SNACK_CATEGORIES:
        meals.append("snack")
    # If no match, default to lunch,dinner (general foods)
    if not meals:
        meals = ["lunch", "dinner"]
    return ",".join(meals)


def main():
    print("=" * 60)
    print("  Food Data Preprocessing Pipeline")
    print("=" * 60)

    # ------------------------------------------------------------------
    # 1. Load raw data
    # ------------------------------------------------------------------
    print(f"\n[1/7] Loading raw data from:\n      {RAW_PATH}")
    if not os.path.exists(RAW_PATH):
        print(f"ERROR: Raw file not found at {RAW_PATH}")
        sys.exit(1)

    df = pd.read_csv(RAW_PATH)
    print(f"      Loaded {len(df):,} rows × {df.shape[1]} columns")

    # ------------------------------------------------------------------
    # 2. Clean data
    # ------------------------------------------------------------------
    print("\n[2/7] Cleaning data ...")

    # 2a. Remove rows where Food_Name is empty/null
    before = len(df)
    df = df.dropna(subset=["Food_Name"])
    df = df[df["Food_Name"].astype(str).str.strip() != ""]
    print(f"      Removed {before - len(df):,} rows with empty Food_Name")

    # 2b. Fill NaN nutrient values with 0
    existing_nutrient_cols = [c for c in NUTRIENT_COLS if c in df.columns]
    df[existing_nutrient_cols] = df[existing_nutrient_cols].fillna(0)
    print(f"      Filled NaN in {len(existing_nutrient_cols)} nutrient columns with 0")

    # 2c. Remove exact duplicate rows
    before = len(df)
    df = df.drop_duplicates()
    print(f"      Removed {before - len(df):,} exact duplicate rows")

    # 2d. Convert nutriscore_grade
    if "nutriscore_grade" in df.columns:
        df["nutriscore_grade"] = df["nutriscore_grade"].apply(convert_nutriscore)
        print(f"      Converted nutriscore_grade -> letter grades (a-e / unknown)")
        print(f"      Distribution: {df['nutriscore_grade'].value_counts().to_dict()}")

    print(f"      Rows after cleaning: {len(df):,}")

    # ------------------------------------------------------------------
    # 3. Add diet_type column
    # ------------------------------------------------------------------
    print("\n[3/7] Adding diet_type column ...")
    df["Food_Category"] = df["Food_Category"].fillna("Unknown")
    df["diet_type"] = df.apply(lambda row: assign_diet_type(str(row["Food_Category"]), str(row["Food_Name"])), axis=1)
    print(f"      diet_type distribution:\n{df['diet_type'].value_counts().to_string()}")

    # ------------------------------------------------------------------
    # 4. Add meal_type column
    # ------------------------------------------------------------------
    print("\n[4/7] Adding meal_type column ...")
    df["meal_type"] = df["Food_Category"].apply(assign_meal_type)
    # Show unique meal_type combos
    meal_counts = df["meal_type"].value_counts()
    print(f"      meal_type combinations:\n{meal_counts.head(10).to_string()}")

    # ------------------------------------------------------------------
    # 5. Group by Food_Name and aggregate
    # ------------------------------------------------------------------
    print("\n[5/7] Grouping by Food_Name and aggregating ...")
    before = len(df)

    # For non-numeric columns, take the first value; for numeric, take the mean
    # We need to keep Food_Category, nutriscore_grade, diet_type, meal_type
    non_numeric_cols = ["Food_Category", "nutriscore_grade", "diet_type", "meal_type"]
    agg_dict = {}
    for col in existing_nutrient_cols:
        agg_dict[col] = "mean"
    for col in non_numeric_cols:
        if col in df.columns:
            agg_dict[col] = "first"

    df = df.groupby("Food_Name", as_index=False).agg(agg_dict)
    print(f"      Rows before grouping: {before:,}")
    print(f"      Rows after grouping:  {len(df):,}")

    # ------------------------------------------------------------------
    # 6. Save processed data
    # ------------------------------------------------------------------
    print(f"\n[6/7] Saving processed data to:\n      {OUTPUT_PATH}")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    df.to_csv(OUTPUT_PATH, index=False)
    file_size_mb = os.path.getsize(OUTPUT_PATH) / (1024 * 1024)
    print(f"      Saved ({file_size_mb:.1f} MB)")

    # ------------------------------------------------------------------
    # 7. Print summary statistics
    # ------------------------------------------------------------------
    print("\n[7/7] Summary Statistics")
    print("-" * 40)
    print(f"  Total foods:       {len(df):,}")

    veg_count = len(df[df["diet_type"] == "vegetarian"])
    nonveg_count = len(df[df["diet_type"] == "non_vegetarian"])
    vegan_count = len(df[df["diet_type"] == "vegan"])
    print(f"  Vegetarian:        {veg_count:,}")
    print(f"  Non-vegetarian:    {nonveg_count:,}")
    print(f"  Vegan:             {vegan_count:,}")

    # Foods per meal type
    print("\n  Foods per meal type:")
    for meal in ["breakfast", "lunch", "dinner", "snack"]:
        count = df["meal_type"].str.contains(meal).sum()
        print(f"    {meal:12s}: {count:,}")

    print("\n" + "=" * 60)
    print("  Food data preprocessing complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
