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

guide_keys = {
    "pwa_guide_title": "How to Install NutriAI App",
    "pwa_guide_subtitle": "Follow these quick steps to install NutriAI on your device for instant offline access.",
    "pwa_guide_desktop": "Desktop (Chrome / Edge): Click the Install icon (➕) on the right side of your address bar at top.",
    "pwa_guide_ios": "iPhone / iPad (Safari): Tap the Share button (⎋) at the bottom and select 'Add to Home Screen'.",
    "pwa_guide_android": "Android (Chrome): Tap the Menu icon (⋮) at top-right and select 'Install App' or 'Add to Home Screen'.",
    "pwa_guide_close": "Got it"
}

for lang, dicts in data.items():
    for key, val in guide_keys.items():
        dicts[key] = val

new_json = json.dumps(data, ensure_ascii=False, indent=2)
header = text[:match.start()]
new_content = header + "export const TRANSLATIONS = " + new_json + ";\n"

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Saved updated PWA guide keys to translations.js!")
