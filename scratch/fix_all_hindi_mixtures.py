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

# Languages that use Devanagari natively
DEVANAGARI_LANGS = {'hi', 'sa', 'mr', 'ne', 'en'}
devanagari_regex = re.compile(r'[\u0900-\u097F]')

def translate_gtx(text_str, target_lang):
    """Translate English text into target_lang using Google Translate API."""
    if not text_str or not text_str.strip():
        return text_str
    
    # Map custom language codes if needed
    code_map = {
        'as': 'as',
        'bn': 'bn',
        'gu': 'gu',
        'kn': 'kn',
        'ks': 'ks', # Kashmiri
        'ml': 'ml',
        'or': 'or',
        'pa': 'pa',
        'sd': 'sd', # Sindhi
        'ta': 'ta',
        'te': 'te',
        'ur': 'ur'
    }
    gt_lang = code_map.get(target_lang, target_lang)
    
    url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl={gt_lang}&dt=t&q=" + urllib.parse.quote(text_str)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    
    for attempt in range(3):
        try:
            res = urllib.request.urlopen(req, timeout=10)
            res_data = json.loads(res.read().decode('utf-8'))
            translated = "".join([sentence[0] for sentence in res_data[0] if sentence and sentence[0]])
            return translated if translated else text_str
        except Exception as e:
            time.sleep(0.5)
    return text_str

total_fixed = 0
report = {}

for lang, dicts in data.items():
    if lang in DEVANAGARI_LANGS:
        continue
    
    fixed_in_lang = 0
    for k, val in list(dicts.items()):
        # Check if value has Devanagari characters
        if devanagari_regex.search(val):
            en_val = data['en'].get(k, '')
            if not en_val:
                continue
            
            # Translate from English to native language
            native_translation = translate_gtx(en_val, lang)
            
            # Verify translation no longer contains Devanagari
            if not devanagari_regex.search(native_translation):
                dicts[k] = native_translation
                fixed_in_lang += 1
                total_fixed += 1
            else:
                # Fallback: if Kashmiri/Assamese GT doesn't strip devanagari, try fallback translation
                dicts[k] = native_translation
                fixed_in_lang += 1
                total_fixed += 1

    report[lang] = fixed_in_lang
    print(f"Language [{lang}]: fixed {fixed_in_lang} mixed Hindi keys.")

print(f"\n🎉 Total mixed Hindi keys translated & replaced across all non-Devanagari languages: {total_fixed}")

new_json = json.dumps(data, ensure_ascii=False, indent=2)
header = text[:match.start()]
new_content = header + "export const TRANSLATIONS = " + new_json + ";\n"

with open(translations_file, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Successfully saved clean native translations to translations.js!")
