"""
Ultimate Food Database Re-classifier for NutriAI
Uses 3 Combined Shields:
  1. Comprehensive Word & Term Matching (English, Indian Regional IFCT, International)
  2. Biological Nutrient Heuristics (Cholesterol > 5mg, Fiber < 0.2g, Carbs < 2g, Protein > 6g)
  3. IFCT & USDA Category Heuristics
"""
import re
import pandas as pd
from pathlib import Path

def main():
    csv_path = Path("ml/datasets/processed/food_database_final.csv").resolve()
    if not csv_path.exists():
        print(f"Error: {csv_path} does not exist.")
        return

    print(f"Loading dataset from {csv_path}...")
    df = pd.read_csv(csv_path)
    total_rows = len(df)
    print(f"Total rows: {total_rows}")

    # Exception list: Words that contain suspicious tokens but are 100% VEGETARIAN/VEGAN
    veg_exceptions = re.compile(
        r'\b(?:kidney\s+bean|red\s+kidney|light\s+red\s+kidney|dark\s+red\s+kidney|white\s+kidney|cannellini|pinto|black\s+bean|chickpea|garbanzo|soy\s+meat|mock\s+meat|plant-based|vegan|veggie|vegetarian|impossible\s+burger|beyond\s+burger|soy\s+chicken|jackfruit|tofu|seitan|tempeh|nutritional\s+yeast)\b',
        re.IGNORECASE
    )

    # Comprehensive Non-Veg Terms (English, Indian Regional IFCT, International)
    non_veg_terms = [
        # Fish & Seafood
        'fish', 'fishes', 'salmon', 'tuna', 'cod', 'haddock', 'halibut', 'sole', 'flounder', 'snapper',
        'grouper', 'bass', 'perch', 'trout', 'char', 'swordfish', 'mahi', 'marlin', 'shark', 'sturgeon',
        'carp', 'pike', 'walleye', 'tilapia', 'mullet', 'milkfish', 'barramundi', 'kingfish', 'trevally',
        'anchovy', 'anchovies', 'caviar', 'roe', 'surimi', 'kamaboko', 'eel', 'eels', 'stingray', 'ray',
        'shrimp', 'shrimps', 'prawn', 'prawns', 'crab', 'crabs', 'lobster', 'lobsters', 'clam', 'clams',
        'mussel', 'mussels', 'oyster', 'oysters', 'squid', 'squids', 'cuttlefish', 'octopus', 'scallop',
        'scallops', 'seafood', 'shellfish', 'snails', 'escargot',

        # Indian Regional Fish & Seafood Names (IFCT Dataset)
        'meen', 'aluva', 'allathi', 'betki', 'bhetki', 'bommuralu', 'chakla', 'chelu', 'chembali',
        'eri meen', 'gobro', 'jallal', 'jathi', 'vela meen', 'tholam', 'narba', 'pangas', 'paarai',
        'pandukopa', 'chappal', 'karimeen', 'vanjaram', 'nethili', 'mathi', 'ayala', 'sankara',
        'kizhanga', 'sheela', 'kanagurtalu', 'korrameenu', 'sankata', 'pulli paarai', 'kulam paarai',
        'kannadi paarai', 'rohu', 'katla', 'catla', 'hilsa', 'surmai', 'mrigal', 'singhi', 'magur',
        'tengra', 'bata', 'pabda', 'parshe', 'basa', 'pomfret', 'mackerel', 'sardine', 'bombay duck',
        'silver belly', 'ribbon fish', 'seer fish', 'kaloori',

        # International Non-Veg Words
        'fisch', 'poisson', 'pescado', 'peixe', 'pesce', 'vis',

        # Poultry & Game
        'chicken', 'chickens', 'turkey', 'turkeys', 'duck', 'ducks', 'goose', 'geese', 'quail', 'pheasant',
        'poultry', 'fowl', 'squab', 'pigeon', 'rabbit', 'hare', 'hen', 'hens', 'country hen',

        # Red Meat & Butchery
        'beef', 'pork', 'lamb', 'mutton', 'venison', 'veal', 'goat', 'calf', 'calves', 'bacon', 'ham',
        'hams', 'sausage', 'sausages', 'pepperoni', 'salami', 'steak', 'steaks', 'meat', 'meats',
        'meatball', 'meatballs', 'mince', 'minced', 'keema', 'kebab', 'kebabs', 'chorizo', 'prosciutto',
        'pancetta', 'biltong', 'jerky', 'salumi', 'mortadella', 'pastrami', 'bologna', 'frankfurter',
        'frankfurters', 'hotdog', 'hotdogs', 'patty', 'patties', 'nugget', 'nuggets', 'wing', 'wings',
        'drumstick', 'drumsticks', 'rib', 'ribs', 'sirloin', 'ribeye', 'tenderloin', 'brisket', 'tallow',
        'lard', 'suet', 'chops', 'thigh', 'breast', 'leg', 'rump', 'flank', 'loin',

        # Eggs & Organ Meats
        'egg', 'eggs', 'yolk', 'yolks', 'liver', 'livers', 'kidney', 'kidneys', 'heart', 'hearts',
        'tripe', 'gizzard', 'gizzards', 'gelatin', 'gelatine', 'brain', 'brains', 'spleen', 'tongue', 'lungs'
    ]

    non_veg_regex = re.compile(r'\b(?:' + '|'.join(non_veg_terms) + r')\b', re.IGNORECASE)

    # NON-VEGAN items (Dairy & Honey)
    non_vegan_terms = [
        'milk', 'cheese', 'cheeses', 'butter', 'cream', 'yogurt', 'yogurts', 'curd', 'paneer',
        'whey', 'ghee', 'honey', 'casein', 'caseinate', 'mayonnaise', 'custard', 'parmesan',
        'cheddar', 'mozzarella', 'ricotta', 'provolone', 'gouda', 'brie', 'camembert', 'feta'
    ]

    non_vegan_regex = re.compile(r'\b(?:' + '|'.join(non_vegan_terms) + r')\b', re.IGNORECASE)

    def classify_row(row):
        name = str(row['Food_Name'])
        cat = str(row.get('Food_Category', ''))
        text = f"{name} {cat}"

        is_veg_exception = bool(veg_exceptions.search(text))

        # Shield 1: Word & Term Match
        if not is_veg_exception and non_veg_regex.search(text):
            return 'non_vegetarian'

        # Shield 2: Biological Nutritional Heuristics for Meat/Fish/Poultry
        # Animal Meat & Fish contain Cholesterol > 5mg, Fiber < 0.2g, Carbs < 2g, and Protein > 6g
        chol = float(row.get('Cholesterol_mg', 0) or 0)
        fiber = float(row.get('Fiber_g', 0) or 0)
        carbs = float(row.get('Carbohydrate_g', 0) or 0)
        protein = float(row.get('Protein_g', 0) or 0)

        if not is_veg_exception:
            if chol > 5.0 and fiber < 0.2 and carbs < 2.0 and protein > 6.0:
                return 'non_vegetarian'

        # Shield 3: Non-Vegan Check
        if non_vegan_regex.search(text):
            return 'vegetarian'

        orig_tag = str(row.get('diet_type', '')).lower().strip()
        if orig_tag == 'vegetarian':
            return 'vegetarian'
        return 'vegan'

    print("Classifying dataset rows with 3 Shields...")
    df['diet_type'] = df.apply(classify_row, axis=1)

    counts = df['diet_type'].value_counts()
    print("\nNew Diet Type Counts:")
    print(counts)

    df.to_csv(str(csv_path), index=False)
    print(f"\nSaved updated dataset to {csv_path} successfully!")

if __name__ == "__main__":
    main()
