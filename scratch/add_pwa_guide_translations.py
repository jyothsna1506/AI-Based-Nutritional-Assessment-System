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

guide_keys = {
    "pwa_guide_title": "How to Install NutriAI App",
    "pwa_guide_subtitle": "Follow these quick steps to install NutriAI on your device for instant offline access.",
    "pwa_guide_desktop": "Desktop Chrome / Edge: Click the Install icon (➕) on the right side of your browser address bar.",
    "pwa_guide_ios": "iPhone / iPad (Safari): Tap the Share button (⎋) at the bottom and select 'Add to Home Screen'.",
    "pwa_guide_android": "Android (Chrome): Tap the Menu icon (⋮) at top-right and select 'Install App' or 'Add to Home Screen'.",
    "pwa_guide_close": "Got it"
}

def translate_gtx(text_str, target_lang):
    if target_lang == 'en':
        return text_str
    url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl={target_lang}&dt=t&q=" + urllib.parse.quote(text_str)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        res = urllib.request.urlopen(req, timeout=5)
        res_data = json.loads(res.read().decode('utf-8'))
        translated = "".join([sentence[0] for sentence in res_data[0] if sentence and sentence[0]])
        if translated:
            return translated
    except Exception as e:
        pass
    return text_str

updated_count = 0
for lang, dicts in data.items():
    for key, val in guide_keys.items():
        if lang == 'en':
            dicts[key] = val
        else:
            translated_val = translate_gtx(val, lang)
            dicts[key] = translated_val
    updated_count += 1
    print(f"Language [{lang}]: PWA guide keys added.")

new_json = json.dumps(data, ensure_ascii=False, indent=2)
header = text[:match.start()]
new_content = header + "export const TRANSLATIONS = " + new_json + ";\n"

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Saved updated PWA guide translations to translations.js!")
