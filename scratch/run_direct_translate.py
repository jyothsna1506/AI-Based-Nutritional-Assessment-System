import json
import re
import urllib.request
import urllib.parse

translations_file = r"c:\Users\Asus\Desktop\AI-Based-Nutritional-Assessment-System\frontend\src\i18n\translations.js"

with open(translations_file, "r", encoding="utf-8") as f:
    text = f.read()

match = re.search(r'export const TRANSLATIONS = (\{[\s\S]*?\});\s*$', text)
data = json.loads(match.group(1))

DEVANAGARI_LANGS = {'hi', 'sa', 'mr', 'ne', 'en'}
devanagari_regex = re.compile(r'[\u0900-\u097F]')

def get_trans(en_text, lang):
    url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl={lang}&dt=t&q=" + urllib.parse.quote(en_text)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        res = urllib.request.urlopen(req, timeout=5)
        res_data = json.loads(res.read().decode('utf-8'))
        return "".join([s[0] for s in res_data[0] if s and s[0]])
    except Exception:
        return en_text

total_replaced = 0
for lang in ['as', 'bn', 'gu', 'kn', 'ks', 'ml', 'or', 'pa', 'sd', 'ta', 'te']:
    dicts = data.get(lang, {})
    count = 0
    for k, val in list(dicts.items()):
        if devanagari_regex.search(val):
            en_val = data['en'].get(k, '')
            if en_val:
                native = get_trans(en_val, lang)
                dicts[k] = native
                count += 1
                total_replaced += 1
    with open('scratch/progress.txt', 'a', encoding='utf-8') as pf:
        pf.write(f"Done {lang}: {count} keys replaced\n")

new_json = json.dumps(data, ensure_ascii=False, indent=2)
header = text[:match.start()]
new_content = header + "export const TRANSLATIONS = " + new_json + ";\n"

with open(translations_file, "w", encoding="utf-8") as f:
    f.write(new_content)

with open('scratch/progress.txt', 'a', encoding='utf-8') as pf:
    pf.write(f"ALL FINISHED! Total replaced: {total_replaced}\n")
