import json
import re

translations_file = r"c:\Users\Asus\Desktop\AI-Based-Nutritional-Assessment-System\frontend\src\i18n\translations.js"

with open(translations_file, "r", encoding="utf-8") as f:
    text = f.read()

match = re.search(r'export const TRANSLATIONS = (\{[\s\S]*?\});\s*$', text)
if not match:
    print("Could not match TRANSLATIONS")
    exit(1)

data = json.loads(match.group(1))

DEVANAGARI_LANGS = {'hi', 'sa', 'mr', 'ne', 'en'}
devanagari_regex = re.compile(r'[\u0900-\u097F]')

total_replaced = 0
for lang in ['as', 'bn', 'gu', 'kn', 'ks', 'ml', 'or', 'pa', 'sd', 'ta', 'te']:
    dicts = data.get(lang, {})
    count = 0
    for k, val in list(dicts.items()):
        if devanagari_regex.search(val):
            en_val = data['en'].get(k, '')
            if en_val:
                dicts[k] = en_val
                count += 1
                total_replaced += 1
    print(f"Language [{lang}]: cleaned {count} mixed Hindi keys to clean English fallback.")

print(f"Total mixed Hindi keys cleaned across all non-Devanagari languages: {total_replaced}")

new_json = json.dumps(data, ensure_ascii=False, indent=2)
header = text[:match.start()]
new_content = header + "export const TRANSLATIONS = " + new_json + ";\n"

with open(translations_file, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Saved clean translations to translations.js!")
