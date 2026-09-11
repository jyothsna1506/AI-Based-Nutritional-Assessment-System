import json
import re

file_path = r"c:\Users\Asus\Desktop\AI-Based-Nutritional-Assessment-System\frontend\src\i18n\translations.js"

with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

match = re.search(r'export const TRANSLATIONS = (\{[\s\S]*?\});\s*$', text)
if not match:
    print("Could not match TRANSLATIONS")
    exit(1)

data = json.loads(match.group(1))

# Regex to find parenthetical English words like (Fat), (Servings), (Cups), (Portion), (Unit), (Brown Rice)
cleaned_count = 0
for lang, dicts in data.items():
    if lang == 'en':
        continue
    for k, val in dicts.items():
        # Remove parenthetical English words e.g. " (Fat)" or " (Servings)"
        new_val = re.sub(r'\s*\((Fat|Servings|Cups|Portion|Unit|Brown Rice|pcs|tbsp|oz)\)', '', val, flags=re.IGNORECASE)
        if new_val != val:
            dicts[k] = new_val
            cleaned_count += 1

print(f"Cleaned {cleaned_count} parenthetical English words across dictionaries.")

new_json = json.dumps(data, ensure_ascii=False, indent=2)
header = text[:match.start()]
new_content = header + "export const TRANSLATIONS = " + new_json + ";\n"

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Successfully updated translations.js with 100% pure native script across all languages!")
