import json
import re

file_path = r"c:\Users\Asus\Desktop\AI-Based-Nutritional-Assessment-System\frontend\src\i18n\translations.js"

with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

# Match TRANSLATIONS dictionary
match = re.search(r'export const TRANSLATIONS = (\{[\s\S]*?\});\s*$', text)
if not match:
    print("Error: Could not match TRANSLATIONS object.")
    exit(1)

data = json.loads(match.group(1))

calendar_translations = {
    "hi": {
        "calendar_today": "आज",
        "calendar_yesterday": "कल",
        "calendar_prev_day": "पिछला",
        "calendar_next_day": "अगला",
        "calendar_viewing_past": "पुराना रिकॉर्ड देखा जा रहा है"
    },
    "sa": {
        "calendar_today": "अद्य",
        "calendar_yesterday": "ह्यः",
        "calendar_prev_day": "पूर्वम्",
        "calendar_next_day": "अग्रिमम्",
        "calendar_viewing_past": "पुरातनलेखः दृश्यते"
    },
    "as": {
        "calendar_today": "আজি",
        "calendar_yesterday": "কালি",
        "calendar_prev_day": "পূৰ্বৱৰ্তী",
        "calendar_next_day": "পৰৱৰ্তী",
        "calendar_viewing_past": "পুৰণি ৰেকৰ্ড চোৱা হৈছে"
    },
    "bn": {
        "calendar_today": "আজ",
        "calendar_yesterday": "গতকাল",
        "calendar_prev_day": "পূর্ববর্তী",
        "calendar_next_day": "পরবর্তী",
        "calendar_viewing_past": "পুরানো রেকর্ড দেখা হচ্ছে"
    },
    "gu": {
        "calendar_today": "આજે",
        "calendar_yesterday": "ગઈકાલે",
        "calendar_prev_day": "પાછળ",
        "calendar_next_day": "આગળ",
        "calendar_viewing_past": "જૂનો રેકોર્ડ જોઈ રહ્યા છો"
    },
    "kn": {
        "calendar_today": "ಇಂದು",
        "calendar_yesterday": "ನಿನ್ನೆ",
        "calendar_prev_day": "ಹಿಂದಿನ",
        "calendar_next_day": "ಮುಂದಿನ",
        "calendar_viewing_past": "ಹಳೆಯ ದಾಖಲೆ ವೀಕ್ಷಿಸಲಾಗುತ್ತಿದೆ"
    },
    "ks": {
        "calendar_today": "आज",
        "calendar_yesterday": "राथ",
        "calendar_prev_day": "บรุนฮ",
        "calendar_next_day": "પતહ",
        "calendar_viewing_past": "પુરાણ રોકોર્ડ વ્યુ"
    },
    "ml": {
        "calendar_today": "ഇന്ന്",
        "calendar_yesterday": "ഇന്നലെ",
        "calendar_prev_day": "മുൻപത്തെ",
        "calendar_next_day": "അടുത്തത്",
        "calendar_viewing_past": "പഴയ രേഖ പരിശോധിക്കുന്നു"
    },
    "mr": {
        "calendar_today": "आज",
        "calendar_yesterday": "काल",
        "calendar_prev_day": "मागील",
        "calendar_next_day": "पुढील",
        "calendar_viewing_past": "जुना नोंद पाहत आहात"
    },
    "ne": {
        "calendar_today": "आज",
        "calendar_yesterday": "हिजो",
        "calendar_prev_day": "अघिल्लो",
        "calendar_next_day": "पछिल्लो",
        "calendar_viewing_past": "पुराना अभिलेख हेर्दै"
    },
    "or": {
        "calendar_today": "ଆଜି",
        "calendar_yesterday": "ଗତକାଲି",
        "calendar_prev_day": "ପୂର୍ବବର୍ତ୍ତୀ",
        "calendar_next_day": "ପରବର୍ତ୍ତୀ",
        "calendar_viewing_past": "ପୁରୁଣା ରେକର୍ଡ ଦେଖାଯାଉଛି"
    },
    "pa": {
        "calendar_today": "ਅੱਜ",
        "calendar_yesterday": "ਕੱਲ੍ਹ",
        "calendar_prev_day": "ਪਿਛਲਾ",
        "calendar_next_day": "ਅਗਲਾ",
        "calendar_viewing_past": "ਪੁਰਾਣਾ ਰਿਕਾਰਡ ਦੇਖਿਆ ਜਾ ਰਿਹਾ ਹੈ"
    },
    "sd": {
        "calendar_today": "اڄ",
        "calendar_yesterday": "ڪالهه",
        "calendar_prev_day": "پويون",
        "calendar_next_day": "اڳيون",
        "calendar_viewing_past": "پراڻو رڪارڊ ڏسي رهيا آهيو"
    },
    "ta": {
        "calendar_today": "இன்று",
        "calendar_yesterday": "நேற்று",
        "calendar_prev_day": "முந்தைய",
        "calendar_next_day": "அடுத்த",
        "calendar_viewing_past": "பழைய பதிவைப் பார்க்கிறீர்கள்"
    },
    "te": {
        "calendar_today": "ఈరోజు",
        "calendar_yesterday": "నిన్న",
        "calendar_prev_day": "మునుపటి",
        "calendar_next_day": "తరువాత",
        "calendar_viewing_past": "పాత రికార్డును వీక్షిస్తున్నారు"
    },
    "ur": {
        "calendar_today": "آج",
        "calendar_yesterday": "کل",
        "calendar_prev_day": "پچھلا",
        "calendar_next_day": "اگلا",
        "calendar_viewing_past": "پرانا ریکارڈ دیکھا جا رہا ہے"
    }
}

for lang, keys in calendar_translations.items():
    if lang in data:
        for k, v in keys.items():
            data[lang][k] = v

new_json = json.dumps(data, ensure_ascii=False, indent=2)

header = text[:match.start()]
new_content = header + "export const TRANSLATIONS = " + new_json + ";\n"

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Successfully synced calendar translations across all 16 languages!")
