import re

translations_file = r"c:\Users\Asus\Desktop\AI-Based-Nutritional-Assessment-System\frontend\src\i18n\translations.js"

with open(translations_file, "r", encoding="utf-8") as f:
    content = f.read()

# Check if calendar_today is already present
if '"calendar_today"' in content:
    print("Calendar translations already added.")
else:
    # Add calendar keys to English section right after "food_diary_subtitle"
    target = '"food_diary_subtitle": "Direct AI-powered caloric and macronutrient food logging",'
    replacement = (
        target + '\n'
        '    "calendar_today": "Today",\n'
        '    "calendar_yesterday": "Yesterday",\n'
        '    "calendar_prev_day": "Prev",\n'
        '    "calendar_next_day": "Next",\n'
        '    "calendar_viewing_past": "Viewing archived logs for",'
    )
    content = content.replace(target, replacement, 1)
    
    with open(translations_file, "w", encoding="utf-8") as f:
        f.write(content)
    print("Successfully added calendar translation keys to English.")
