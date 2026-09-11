import logging
import urllib.parse
import urllib.request
import json
import os
from typing import Optional, Dict

from backend.app.config.settings import SPOONACULAR_API_KEY

logger = logging.getLogger(__name__)

# In-memory cache to save API calls
_RECIPE_CACHE: Dict[str, dict] = {}


def get_recipe_by_ingredients(ingredients: list[str]) -> Optional[dict]:
    """
    Search Spoonacular for a recipe using ingredients or dish title.
    Returns a recipe dictionary with title, image, instructions, and URL, or None.
    """
    api_key = (os.getenv("SPOONACULAR_API_KEY") or SPOONACULAR_API_KEY or "").strip()
    if not api_key:
        logger.debug("Spoonacular API key is missing or not configured.")
        return None

    valid_ingredients = [i.strip() for i in ingredients if i.strip()][:3]
    if not valid_ingredients:
        return None

    cache_key = ",".join(sorted([i.lower() for i in valid_ingredients]))
    if cache_key in _RECIPE_CACHE:
        return _RECIPE_CACHE[cache_key]

    try:
        # Try ingredient-based search first
        query_params = urllib.parse.urlencode({
            "apiKey": api_key,
            "includeIngredients": ",".join(valid_ingredients),
            "addRecipeInformation": "true",
            "fillIngredients": "true",
            "number": 1,
            "sort": "max-used-ingredients"
        })
        
        url = f"https://api.spoonacular.com/recipes/complexSearch?{query_params}"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        
        with urllib.request.urlopen(req, timeout=8) as response:
            if response.status == 200:
                data = json.loads(response.read().decode("utf-8"))
                results = data.get("results", [])
                if results:
                    recipe = results[0]
                    return _parse_spoonacular_recipe(recipe, cache_key)

        # Fallback to direct title query search if ingredient search yielded no results
        search_title = valid_ingredients[0]
        query_params_title = urllib.parse.urlencode({
            "apiKey": api_key,
            "query": search_title,
            "addRecipeInformation": "true",
            "number": 1,
        })
        url_title = f"https://api.spoonacular.com/recipes/complexSearch?{query_params_title}"
        req_title = urllib.request.Request(url_title, headers={"User-Agent": "Mozilla/5.0"})

        with urllib.request.urlopen(req_title, timeout=8) as response:
            if response.status == 200:
                data = json.loads(response.read().decode("utf-8"))
                results = data.get("results", [])
                if results:
                    recipe = results[0]
                    return _parse_spoonacular_recipe(recipe, cache_key)

        return None
        
    except Exception as e:
        logger.warning(f"Spoonacular API query notice: {e}")
        return None


def _parse_spoonacular_recipe(recipe: dict, cache_key: str) -> dict:
    """Parse and cache recipe data from Spoonacular response."""
    instructions = []
    if recipe.get("analyzedInstructions") and len(recipe["analyzedInstructions"]) > 0:
        for step in recipe["analyzedInstructions"][0].get("steps", []):
            if step.get("step"):
                instructions.append(step.get("step"))
    elif recipe.get("instructions"):
        instructions = [recipe.get("instructions")]

    result = {
        "id": recipe.get("id"),
        "title": recipe.get("title"),
        "image": recipe.get("image"),
        "readyInMinutes": recipe.get("readyInMinutes", 20),
        "servings": recipe.get("servings", 2),
        "instructions": instructions,
        "sourceUrl": recipe.get("sourceUrl") or recipe.get("spoonacularSourceUrl")
    }
    _RECIPE_CACHE[cache_key] = result
    return result
