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

# Group items by language
tasks_by_lang = {}
for lang, dicts in data.items():
    if lang in DEVANAGARI_LANGS:
        continue
    items = []
    for k, val in dicts.items():
        if devanagari_regex.search(val):
            en_val = data['en'].get(k, '')
            if en_val:
                items.append((k, en_val))
    if items:
        tasks_by_lang[lang] = items

print(f"Languages with Hindi mixture: {len(tasks_by_lang)}")

def translate_batch(text_list, target_lang):
    """Translate a list of texts into target_lang in a single HTTP request."""
    if not text_list:
        return []
    
    combined = "\n---\n".join(text_list)
    url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl={target_lang}&dt=t&q=" + urllib.parse.quote(combined)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        res = urllib.request.urlopen(req, timeout=15)
        res_data = json.loads(res.read().decode('utf-8'))
        full_text = "".join([sentence[0] for sentence in res_data[0] if sentence and sentence[0]])
        parts = full_text.split("\n---\n")
        if len(parts) == len(text_list):
            return [p.strip() for p in parts]
        # Alternative split if delimiter changed space
        parts_space = full_text.split("\n--- \n")
        if len(parts_space) == len(text_list):
            return [p.strip() for p in parts_space]
    except Exception as e:
        print(f"Batch translate error for {target_lang}: {e}")
    return []

total_fixed = 0
for lang, items in tasks_by_lang.items():
    keys = [k for k, _ in items]
    texts = [t for _, t in items]
    
    # Process in chunks of 25
    chunk_size = 20
    for i in range(0, len(items), chunk_size):
        c_keys = keys[i:i+chunk_size]
        c_texts = texts[i:i+chunk_size]
        
        translated_c = translate_batch(c_texts, lang)
        if len(translated_c) == len(c_texts):
            for k, trans in zip(c_keys, translated_c):
                data[lang][k] = trans
                total_fixed += 1
        else:
            # Fallback one-by-one if batch split failed
            for k, en_t in zip(c_keys, c_texts):
                res = translate_batch([en_t], lang)
                if res and res[0]:
                    data[lang][k] = res[0]
                    total_fixed += 1
    print(f"Language [{lang}]: translated and updated keys!")

print(f"\n🎉 Successfully batch-translated {total_fixed} mixed Hindi keys across all non-Devanagari languages!")

new_json = json.dumps(data, ensure_ascii=False, indent=2)
header = text[:match.start()]
new_content = header + "export const TRANSLATIONS = " + new_json + ";\n"

with open(translations_file, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Saved clean native translations to translations.js!")
