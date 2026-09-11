import json
import re
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

def get_gt(text_val, target_lang):
    if not text_val:
        return text_val
    url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl={target_lang}&dt=t&q=" + urllib.parse.quote(text_val)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        res = urllib.request.urlopen(req, timeout=10)
        res_data = json.loads(res.read().decode('utf-8'))
        return "".join([s[0] for s in res_data[0] if s and s[0]])
    except Exception:
        return text_val

count = 0
for lang in ['as', 'bn', 'gu', 'kn', 'ks', 'ml', 'or', 'pa', 'sd', 'ta', 'te']:
    dicts = data.get(lang, {})
    for k, val in list(dicts.items()):
        if devanagari_regex.search(val):
            en_val = data['en'].get(k, '')
            if en_val:
                trans = get_gt(en_val, lang)
                dicts[k] = trans
                count += 1

print(f"Replaced {count} mixed Hindi keys across all 11 non-Devanagari languages.")

new_json = json.dumps(data, ensure_ascii=False, indent=2)
header = text[:match.start()]
new_content = header + "export const TRANSLATIONS = " + new_json + ";\n"

with open(translations_file, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Saved clean native translations!")
