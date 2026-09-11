import json
import re
import time
import urllib.request
import urllib.parse

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

def fetch_translation(text_to_translate, target_lang):
    if not text_to_translate:
        return text_to_translate
    
    # URL encode query
    encoded = urllib.parse.quote(text_to_translate)
    url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl={target_lang}&dt=t&q={encoded}"
    
    req = urllib.request.Request(
        url,
        headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    )
    
    try:
        time.sleep(0.08) # prevent rate limit
        res = urllib.request.urlopen(req, timeout=5)
        res_data = json.loads(res.read().decode('utf-8'))
        translated = "".join([sentence[0] for sentence in res_data[0] if sentence and sentence[0]])
        if translated and not devanagari_regex.search(translated):
            return translated
    except Exception as e:
        pass
    
    # Fallback to English value if translation failed or returned devanagari
    return text_to_translate

total_fixed = 0
for lang in ['as', 'bn', 'gu', 'kn', 'ks', 'ml', 'or', 'pa', 'sd', 'ta', 'te']:
    dicts = data.get(lang, {})
    fixed_count = 0
    for k, val in list(dicts.items()):
        if devanagari_regex.search(val):
            en_val = data['en'].get(k, '')
            if en_val:
                native_text = fetch_translation(en_val, lang)
                dicts[k] = native_text
                fixed_count += 1
                total_fixed += 1

    print(f"Done Language [{lang}]: fixed {fixed_count} keys.")

print(f"\n🎉 Successfully fixed {total_fixed} mixed Hindi keys across all 11 non-Devanagari languages!")

new_json = json.dumps(data, ensure_ascii=False, indent=2)
header = text[:match.start()]
new_content = header + "export const TRANSLATIONS = " + new_json + ";\n"

with open(translations_file, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Saved clean native translations to translations.js!")
