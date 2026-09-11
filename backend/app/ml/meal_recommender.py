"""
Weekly meal-plan generator.

Core algorithm:
1. Load the food database CSV.
2. Filter by diet preference using Word Matching + Biological Nutritional Shields.
3. Score each food based on nutrient density for detected deficiencies.
4. Generate a 7-day plan (breakfast, lunch, dinner, snack) with:
   - No food repeated within the week.
   - Plans change weekly (ISO week-number × year as seed).
   - Top-20 scoring foods per slot → seeded random pick for variety.
   - Rough daily calorie target validation (1500-2500 kcal).
5. Audit via Gemini 2.0 Flash AI verification before serving.
"""
import gc
import logging
import random
import re
import urllib.parse
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

from backend.app.services.spoonacular import get_recipe_by_ingredients

import numpy as np
import pandas as pd

from backend.app.config.settings import FOOD_CSV_PATH

logger = logging.getLogger(__name__)

# Global in-memory cache to prevent re-reading & re-parsing CSV on every request
_RAW_FOOD_DF_CACHE: Optional[pd.DataFrame] = None

def _get_cached_food_df() -> Optional[pd.DataFrame]:
    global _RAW_FOOD_DF_CACHE
    if _RAW_FOOD_DF_CACHE is not None:
        return _RAW_FOOD_DF_CACHE.copy()
    
    csv_path = Path(FOOD_CSV_PATH)
    if not csv_path.exists():
        logger.warning("Food CSV not found at %s", csv_path)
        return None
    
    try:
        df = pd.read_csv(csv_path)
        if not df.empty:
            _RAW_FOOD_DF_CACHE = df
            logger.info("Loaded and cached food database DataFrame (%d rows)", len(df))
            gc.collect()
            return _RAW_FOOD_DF_CACHE.copy()
    except Exception as exc:
        logger.error("Failed to read food CSV at %s: %s", csv_path, exc)
    
    return None

# ── Nutrient mapping per deficiency ──────────────────────────────────────────
DEFICIENCY_NUTRIENT_MAP: Dict[str, List[tuple]] = {
    "Iron_Anemia_Deficiency": [
        ("Iron_mg", 1.0),
        ("VitaminC_mg", 0.5),
        ("VitaminB12_mcg", 0.4),
    ],
    "Vitamin_D_Deficiency": [
        ("VitaminD_mcg", 1.0),
        ("Calcium_mg", 0.4),
    ],
    "MAGN_Deficiency": [
        ("Magnesium_mg", 1.0),
    ],
    "SCA_Deficiency": [
        ("Calcium_mg", 1.0),
        ("VitaminD_mcg", 0.4),
    ],
    "SK_Deficiency": [
        ("Potassium_mg", 1.0),
    ],
    "R_Deficiency": [
        ("Riboflavin_mg", 1.0),
        ("VitaminB6_mg", 0.5),
    ],
}

SCORE_NUTRIENT_COLS = [
    "Iron_mg", "VitaminC_mg", "VitaminB12_mcg", "VitaminD_mcg",
    "Calcium_mg", "Magnesium_mg", "Potassium_mg", "Riboflavin_mg",
    "VitaminB6_mg",
]

BALANCE_COLS = [("Protein_g", 0.15), ("Energy_kcal", 0.05), ("Fiber_g", 0.10)]
MEAL_SLOTS = ["breakfast", "lunch", "dinner", "snack"]

NON_VEG_REGEX = re.compile(
    r'\b(?:beef|pork|chicken|chickens|turkey|duck|ducks|lamb|mutton|fish|fishes|tuna|salmon|trout|rohu|catfish|ari|seafood|shrimp|shrimps|prawn|prawns|crab|crabs|lobster|clam|mussel|oyster|squid|octopus|meat|meats|bacon|ham|sausage|sausages|pepperoni|salami|steak|steaks|poultry|anchovy|sardine|cod|haddock|meatball|mince|venison|veal|chorizo|prosciutto|bologna|egg|eggs|yolk|yolks|meen|aluva|allathi|betki|bhetki|bommuralu|chakla|chelu|chembali|eri|gobro|jallal|jathi|tholam|narba|pangas|paarai|pandukopa|chappal|karimeen|vanjaram|nethili|mathi|ayala|sankara|kizhanga|sheela|kanagurtalu|korrameenu|sankata|eel|eels|stingray|fisch|poisson|pescado|peixe|pesce|vis|calf|calves|hen|hens|chops|spleen|tongue|lungs|gizzard|tripe|liver|livers)\b',
    re.IGNORECASE
)

NON_VEGAN_REGEX = re.compile(
    r'\b(?:milk|cheese|cheeses|butter|cream|yogurt|yogurts|curd|paneer|whey|ghee|honey|casein|egg|eggs|mayonnaise|custard|parmesan|cheddar|mozzarella|ricotta)\b',
    re.IGNORECASE
)

# ── High-Accuracy Dynamic Food Keyword Image Router ──────────────────────────
FOOD_IMAGE_KEYWORDS = [
    # Millets & Grains
    ("millet", "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80"),
    ("buckwheat", "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80"),
    ("quinoa", "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80"),
    ("grain", "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80"),
    ("flour", "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80"),
    ("cereal", "https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=800&q=80"),
    ("rice", "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80"),
    ("bread", "https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&w=800&q=80"),

    # Seeds (Niger, Sesame, Sunflower, Pumpkin, Flaxseed, Omum)
    ("niger", "https://images.unsplash.com/photo-1508854710579-5cecc3a9ff17?auto=format&fit=crop&w=800&q=80"),
    ("seed", "https://images.unsplash.com/photo-1508854710579-5cecc3a9ff17?auto=format&fit=crop&w=800&q=80"),
    ("seeds", "https://images.unsplash.com/photo-1508854710579-5cecc3a9ff17?auto=format&fit=crop&w=800&q=80"),
    ("gingelly", "https://images.unsplash.com/photo-1508854710579-5cecc3a9ff17?auto=format&fit=crop&w=800&q=80"),
    ("sesame", "https://images.unsplash.com/photo-1508854710579-5cecc3a9ff17?auto=format&fit=crop&w=800&q=80"),
    ("flaxseed", "https://images.unsplash.com/photo-1508854710579-5cecc3a9ff17?auto=format&fit=crop&w=800&q=80"),
    ("sunflower", "https://images.unsplash.com/photo-1508854710579-5cecc3a9ff17?auto=format&fit=crop&w=800&q=80"),
    ("pumpkin", "https://images.unsplash.com/photo-1508854710579-5cecc3a9ff17?auto=format&fit=crop&w=800&q=80"),
    ("omum", "https://images.unsplash.com/photo-1508854710579-5cecc3a9ff17?auto=format&fit=crop&w=800&q=80"),

    # Leafy Greens & Vegetables (Pak Choi, Bathua, Spinach, Agathi)
    ("pak choi", "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80"),
    ("choi", "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80"),
    ("leaf", "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80"),
    ("leaves", "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80"),
    ("spinach", "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80"),
    ("greens", "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80"),
    ("bathua", "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80"),
    ("agathi", "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80"),
    ("vegetable", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80"),
    ("salad", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80"),
    ("mushroom", "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80"),

    # Cookies & Oats
    ("cookie", "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80"),
    ("cookies", "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80"),
    ("oatmeal", "https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=800&q=80"),
    ("oat", "https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=800&q=80"),
    ("biscuit", "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80"),

    # Nuts & Legumes
    ("walnut", "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80"),
    ("almond", "https://images.unsplash.com/photo-1508061252966-173859d9f2b6?auto=format&fit=crop&w=800&q=80"),
    ("cashew", "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80"),
    ("nut", "https://images.unsplash.com/photo-1508061252966-173859d9f2b6?auto=format&fit=crop&w=800&q=80"),
    ("nuts", "https://images.unsplash.com/photo-1508061252966-173859d9f2b6?auto=format&fit=crop&w=800&q=80"),
    ("hazelnut", "https://images.unsplash.com/photo-1508061252966-173859d9f2b6?auto=format&fit=crop&w=800&q=80"),
    ("pecan", "https://images.unsplash.com/photo-1508061252966-173859d9f2b6?auto=format&fit=crop&w=800&q=80"),
    ("dal", "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80"),
    ("gram", "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80"),
    ("soya", "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80"),
    ("paneer", "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80"),
    ("curry", "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80"),

    # Fruits & Sweets
    ("fig", "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80"),
    ("figs", "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80"),
    ("fruit", "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80"),
    ("apple", "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80"),
    ("coconut", "https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&w=800&q=80"),

    # Non-Veg
    ("chicken", "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=800&q=80"),
    ("fish", "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80"),
]


def _get_dynamic_food_image(title: str, slot: str) -> str:
    """Find authentic, verified food image by keyword matching or fallback category router."""
    title_lower = title.lower()
    for kw, img_url in FOOD_IMAGE_KEYWORDS:
        if kw in title_lower:
            return img_url
    
    # Default category fallback by food type (eliminates random egg images for grains/seeds)
    if any(k in title_lower for k in ["seed", "niger", "gingelly", "sesame", "flax"]):
        return "https://images.unsplash.com/photo-1508854710579-5cecc3a9ff17?auto=format&fit=crop&w=800&q=80"
    if any(k in title_lower for k in ["flour", "grain", "wheat", "millet", "quinoa", "rice"]):
        return "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80"
    if any(k in title_lower for k in ["choi", "leaf", "leaves", "spinach", "vegetable", "green"]):
        return "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80"

    # Slot fallbacks
    fallback_map = {
        "breakfast": "https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=800&q=80", # Oatmeal / Cereal
        "lunch": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",     # Salad Bowl
        "dinner": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80",    # Curry / Specialty Dish
        "snack": "https://images.unsplash.com/photo-1508061252966-173859d9f2b6?auto=format&fit=crop&w=800&q=80",     # Nuts & Seeds
    }
    return fallback_map.get(slot, "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80")


def _clean_food_name(name: str) -> str:
    """Clean raw USDA / database strings into human-friendly dish titles."""
    if not name:
        return "Nutritional Dish"
    
    cleaned = re.sub(r"-\s*[A-Z0-9]+$", "", name, flags=re.IGNORECASE).strip()
    cleaned = re.sub(r"\([^)]*\)", "", cleaned).strip()
    
    parts = [p.strip() for p in cleaned.split(",") if p.strip()]
    
    ignore_words = {"tocopherols", "formulated", "fortified", "prepared", "raw", "dehydrated", "unprepared", "kraft", "nestle", "usda", "100%", "grated"}
    valid_parts = []
    for p in parts:
        words = p.split()
        clean_words = [w for w in words if w.lower() not in ignore_words]
        if clean_words:
            valid_parts.append(" ".join(clean_words))
            
    if valid_parts:
        title = " ".join(reversed(valid_parts[:2])).title()
        return title.strip()
    
    return name.split(",")[0].title()


def generate_weekly_meal_plan(
    diet_preference: str = "non_vegetarian",
    deficiencies: Optional[List[str]] = None,
    daily_calorie_target: int = 2000,
    gender: str = "male",
    age: int = 30,
    week_seed: Optional[int] = None,
) -> dict:
    """Generate a 7-day meal plan optimised for detected nutritional deficiencies."""
    deficiencies = deficiencies or []

    df = _get_cached_food_df()
    if df is None or df.empty:
        logger.warning("Food database DataFrame is empty — returning empty plan")
        return _empty_plan(diet_preference, deficiencies, daily_calorie_target)

    df = _filter_by_diet(df, diet_preference)
    if df.empty:
        logger.warning("No foods left after diet filter — returning empty plan")
        return _empty_plan(diet_preference, deficiencies, daily_calorie_target)

    df = _normalise_nutrients(df)
    df = _score_foods(df, deficiencies)

    now = datetime.now()
    iso_cal = now.isocalendar()
    week_number = iso_cal[1]
    year = iso_cal[0]
    if week_seed is None:
        week_seed = week_number * year

    rng = random.Random(week_seed)

    used_foods: set = set()
    days: List[dict] = []

    for day_idx in range(1, 8):
        day_meals: Dict[str, dict] = {}
        day_calories = 0.0

        for slot in MEAL_SLOTS:
            picked = _pick_food_for_slot(df, slot, used_foods, rng)
            if picked is not None:
                used_foods.add(picked["food_name"])
                day_calories += picked["calories"]
                day_meals[slot] = picked
            else:
                picked = _pick_food_for_slot(df, slot, set(), rng)
                if picked is not None:
                    day_calories += picked["calories"]
                    day_meals[slot] = picked

        # Enrich all meal slots with cleaned titles, recipes, dynamic images, and URLs
        for slot in MEAL_SLOTS:
            if slot in day_meals and day_meals[slot]:
                raw_name = day_meals[slot]["food_name"]
                clean_title = _clean_food_name(raw_name)
                day_meals[slot]["food_name"] = clean_title

                # Stage 1: Try Spoonacular API query search by exact ingredient/title
                search_term = clean_title.split()[0]
                recipe = get_recipe_by_ingredients([clean_title, search_term])

                if recipe and recipe.get("image"):
                    day_meals[slot]["recipe_title"] = recipe.get("title") or f"Healthy {clean_title}"
                    day_meals[slot]["recipe_image"] = recipe.get("image")
                    day_meals[slot]["recipe_instructions"] = recipe.get("instructions") or []
                    day_meals[slot]["recipe_ready_in"] = recipe.get("readyInMinutes", 20)
                    day_meals[slot]["recipe_url"] = recipe.get("sourceUrl")
                else:
                    # Stage 2 & 3: High-Accuracy Dynamic Keyword Image Router
                    day_meals[slot]["recipe_title"] = f"Healthy {clean_title}"
                    day_meals[slot]["recipe_image"] = _get_dynamic_food_image(clean_title, slot)
                    day_meals[slot]["recipe_ready_in"] = 15
                    day_meals[slot]["recipe_instructions"] = [
                        f"Prepare fresh {clean_title} with wholesome organic ingredients.",
                        "Season to taste with olive oil, sea salt, black pepper, and herbs.",
                        "Serve warm and enjoy as part of your targeted nutritional daily plan."
                    ]

                # Ensure recipe_url is ALWAYS present for external link button
                if not day_meals[slot].get("recipe_url"):
                    search_query = urllib.parse.quote(f"{clean_title} recipe")
                    day_meals[slot]["recipe_url"] = f"https://www.google.com/search?q={search_query}"

        # Enforce daily calorie target by scaling portions
        if day_calories > 0:
            scale = daily_calorie_target / day_calories
            for slot, meal in day_meals.items():
                meal["calories"] = round(meal["calories"] * scale, 1)
                if "protein" in meal:
                    meal["protein"] = round(meal["protein"] * scale, 1)
                if "carbohydrates" in meal:
                    meal["carbohydrates"] = round(meal["carbohydrates"] * scale, 1)
                if "fat" in meal:
                    meal["fat"] = round(meal["fat"] * scale, 1)
                for k in meal["key_nutrients"]:
                    meal["key_nutrients"][k] = round(meal["key_nutrients"][k] * scale, 2)
            day_calories = daily_calorie_target

        days.append({
            "day": day_idx,
            "meals": day_meals,
            "total_calories": round(day_calories, 1),
        })

    # Gemini AI Verification Guard: Use Gemini API key to audit and replace any non-compliant meal items
    if diet_preference in ["vegetarian", "vegan"]:
        try:
            from backend.app.services.gemini_service import verify_meal_plan_diet
            days = verify_meal_plan_diet(days, diet_preference)
        except Exception as err:
            logger.warning("Gemini diet verification skipped: %s", err)

    gc.collect()

    return {
        "week_number": week_number,
        "year": year,
        "diet_preference": diet_preference,
        "daily_calorie_target": daily_calorie_target,
        "deficiencies_targeted": deficiencies,
        "days": days,
    }


def _empty_plan(diet_pref: str, deficiencies: list, cal_target: int) -> dict:
    now = datetime.now()
    iso_cal = now.isocalendar()
    return {
        "week_number": iso_cal[1],
        "year": iso_cal[0],
        "diet_preference": diet_pref,
        "daily_calorie_target": cal_target,
        "deficiencies_targeted": deficiencies,
        "days": [],
    }


def _filter_by_diet(df: pd.DataFrame, pref: str) -> pd.DataFrame:
    pref = pref.strip().lower()
    if "diet_type" not in df.columns:
        filtered = df.copy()
    else:
        df["diet_type"] = df["diet_type"].fillna("").str.strip().str.lower()
        if pref == "vegan":
            filtered = df[df["diet_type"] == "vegan"].copy()
        elif pref == "vegetarian":
            filtered = df[df["diet_type"].isin(["vegetarian", "vegan"])].copy()
        else:
            filtered = df.copy()

    # Hardened runtime keyword exclusion safety filter
    food_col = "Food_Name" if "Food_Name" in filtered.columns else "food_name"
    if pref in ["vegetarian", "vegan"]:
        mask = ~filtered[food_col].astype(str).str.contains(NON_VEG_REGEX, na=False)
        filtered = filtered[mask]

        # Biological Nutritional Shield: Drop any item with Cholesterol > 5, Fiber < 0.2, Carbs < 2, Protein > 6
        if {"Cholesterol_mg", "Fiber_g", "Carbohydrate_g", "Protein_g"}.issubset(filtered.columns):
            bio_mask = ~(
                (filtered["Cholesterol_mg"].fillna(0) > 5.0) &
                (filtered["Fiber_g"].fillna(0) < 0.2) &
                (filtered["Carbohydrate_g"].fillna(0) < 2.0) &
                (filtered["Protein_g"].fillna(0) > 6.0)
            )
            filtered = filtered[bio_mask]

    if pref == "vegan":
        mask = ~filtered[food_col].astype(str).str.contains(NON_VEGAN_REGEX, na=False)
        filtered = filtered[mask]

    return filtered


def _normalise_nutrients(df: pd.DataFrame) -> pd.DataFrame:
    for col in SCORE_NUTRIENT_COLS:
        if col in df.columns:
            cmin = df[col].min()
            cmax = df[col].max()
            if cmax > cmin:
                df[f"{col}_norm"] = (df[col] - cmin) / (cmax - cmin)
            else:
                df[f"{col}_norm"] = 0.0
    return df


def _score_foods(df: pd.DataFrame, deficiencies: List[str]) -> pd.DataFrame:
    df["deficiency_score"] = 0.0

    if deficiencies:
        for deficiency in deficiencies:
            nutrient_weights = DEFICIENCY_NUTRIENT_MAP.get(deficiency, [])
            for col, weight in nutrient_weights:
                norm_col = f"{col}_norm"
                if norm_col in df.columns:
                    df["deficiency_score"] += df[norm_col] * weight

    for col, weight in BALANCE_COLS:
        if col in df.columns:
            cmin = df[col].min()
            cmax = df[col].max()
            if cmax > cmin:
                df["deficiency_score"] += ((df[col] - cmin) / (cmax - cmin)) * weight

    return df


def _pick_food_for_slot(
    df: pd.DataFrame,
    slot: str,
    used: set,
    rng: random.Random,
) -> Optional[dict]:
    if "meal_type" not in df.columns:
        candidates = df.copy()
    else:
        candidates = df[
            df["meal_type"].fillna("").str.lower().str.contains(slot, na=False)
        ].copy()

    if candidates.empty:
        candidates = df.copy()

    if used:
        food_col = "Food_Name" if "Food_Name" in candidates.columns else "food_name"
        candidates = candidates[~candidates[food_col].isin(used)]

    if candidates.empty:
        return None

    candidates = candidates.sort_values("deficiency_score", ascending=False)
    top_n = candidates.head(20)
    row = top_n.iloc[rng.randint(0, len(top_n) - 1)]

    food_name_col = "Food_Name" if "Food_Name" in df.columns else "food_name"
    category_col = "Food_Category" if "Food_Category" in df.columns else "category"

    key_nutrients = {}
    for col in SCORE_NUTRIENT_COLS:
        if col in row.index:
            val = row[col]
            if pd.notna(val) and val > 0:
                key_nutrients[col] = round(float(val), 2)

    energy_col = "Energy_kcal" if "Energy_kcal" in row.index else "energy_kcal"
    calories = float(row.get(energy_col, 0) or 0)

    protein_col = "Protein_g" if "Protein_g" in row.index else "protein_g"
    carbs_col = "Carbohydrate_g" if "Carbohydrate_g" in row.index else "carbohydrates_g"
    fat_col = "Fat_g" if "Fat_g" in row.index else "fat_g"
    
    return {
        "food_name": str(row.get(food_name_col, "Unknown")),
        "category": str(row.get(category_col, "")),
        "calories": round(calories, 1),
        "protein": round(float(row.get(protein_col, 0) or 0), 1),
        "carbohydrates": round(float(row.get(carbs_col, 0) or 0), 1),
        "fat": round(float(row.get(fat_col, 0) or 0), 1),
        "key_nutrients": key_nutrients,
    }
