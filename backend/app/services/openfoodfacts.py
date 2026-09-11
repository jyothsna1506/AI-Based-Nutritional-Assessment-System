import logging
import urllib.request
import json
from typing import Optional, Dict

logger = logging.getLogger(__name__)

def get_product_by_barcode(barcode: str) -> Optional[dict]:
    """
    Search Open Food Facts API for a product using the provided barcode.
    """
    if not barcode:
        return None

    try:
        url = f"https://world.openfoodfacts.org/api/v0/product/{barcode}.json"
        
        req = urllib.request.Request(url, headers={'User-Agent': 'AINutritionApp/1.0'})
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                data = json.loads(response.read().decode("utf-8"))
                
                if data.get("status") == 1 and data.get("product"):
                    p = data["product"]
                    
                    return {
                        "barcode": barcode,
                        "product_name": p.get("product_name", "Unknown Product"),
                        "brands": p.get("brands", ""),
                        "image_url": p.get("image_url", ""),
                        "nutriscore_grade": p.get("nutriscore_grade", ""),
                        "ingredients_text": p.get("ingredients_text", ""),
                        "nutriments": {
                            "energy_kcal": p.get("nutriments", {}).get("energy-kcal_100g", 0),
                            "proteins_100g": p.get("nutriments", {}).get("proteins_100g", 0),
                            "carbohydrates_100g": p.get("nutriments", {}).get("carbohydrates_100g", 0),
                            "fat_100g": p.get("nutriments", {}).get("fat_100g", 0),
                            "fiber_100g": p.get("nutriments", {}).get("fiber_100g", 0),
                            "sodium_100g": p.get("nutriments", {}).get("sodium_100g", 0),
                            "sugars_100g": p.get("nutriments", {}).get("sugars_100g", 0)
                        },
                        "ecoscore_grade": p.get("ecoscore_grade", "")
                    }
                    
        return None
        
    except Exception as e:
        logger.error(f"Error fetching product from Open Food Facts: {e}")
        return None
