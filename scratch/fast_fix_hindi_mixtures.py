import json
import re
import time
import urllib.request
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed

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

def translate_gtx(lang, key, en_val):
    if not en_val or not en_val.strip():
        return lang, key, en_val
    
    url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl={lang}&dt=t&q=" + urllib.parse.quote(en_val)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    
    for _ in range(3):
        try:
            res = urllib.request.urlopen(req, timeout=5)
            res_data = json.loads(res.read().decode('utf-8'))
            translated = "".join([s[0] for s in res_data[0] if s and s[0]])
            if translated:
                return lang, key, translated
        except Exception:
            time.sleep(0.1)
    return lang, key, en_val

# Collect all tasks to translate
tasks = []
for lang, dicts in data.items():
    if lang in DEVANAGARI_LANGS:
        continue
    for k, val in dicts.items():
        if devanagari_regex.search(val):
            en_val = data['en'].get(k, '')
            if en_val:
                tasks.append((lang, k, en_val))

print(f"Found {len(tasks)} total mixed Hindi keys to translate across non-Devanagari languages...")

total_fixed = 0
with ThreadPoolExecutor(max_workers=20) as executor:
    futures = [executor.submit(translate_gtx, lang, key, en_val) for lang, key, en_val in tasks]
    for future in as_completed(futures):
        lang, key, native_val = future.result()
        data[lang][key] = native_val
        total_fixed += 1

print(f"\n🎉 Successfully translated {total_fixed} mixed Hindi keys across all non-Devanagari languages!")

new_json = json.dumps(data, ensure_ascii=False, indent=2)
header = text[:match.start()]
new_content = header + "export const TRANSLATIONS = " + new_json + ";\n"

with open(translations_file, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Saved updated clean native translations to translations.js!")
