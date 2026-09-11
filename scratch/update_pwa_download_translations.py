import json
import re
import urllib.request
import urllib.parse

file_path = r"c:\Users\Asus\Desktop\AI-Based-Nutritional-Assessment-System\frontend\src\i18n\translations.js"

with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

match = re.search(r'export const TRANSLATIONS = (\{[\s\S]*?\});\s*$', text)
if not match:
    print("Could not match TRANSLATIONS")
    exit(1)

data = json.loads(match.group(1))

target_en = "Download NutriAI App"

def translate_gtx(text_str, target_lang):
    if target_lang == 'en':
        return "Download NutriAI App"
    url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl={target_lang}&dt=t&q=" + urllib.parse.quote(text_str)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        res = urllib.request.urlopen(req, timeout=5)
        res_data = json.loads(res.read().decode('utf-8'))
        translated = "".join([sentence[0] for sentence in res_data[0] if sentence and sentence[0]])
        if translated:
            return translated
    except Exception as e:
        print(f"Error translating to {target_lang}: {e}")
    return text_str

updated_count = 0
for lang, dicts in data.items():
    native_text = translate_gtx(target_en, lang)
    dicts["home_pwa_download"] = native_text
    updated_count += 1
    print(f"Language [{lang}]: updated home_pwa_download key successfully")

print(f"Total updated: {updated_count} languages")

new_json = json.dumps(data, ensure_ascii=False, indent=2)
header = text[:match.start()]
new_content = header + "export const TRANSLATIONS = " + new_json + ";\n"

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Saved updated translations to translations.js!")
