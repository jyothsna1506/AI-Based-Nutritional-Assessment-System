import os
import re

dir_path = r"c:\Users\Asus\Desktop\AI-Based-Nutritional-Assessment-System\frontend\src\services"
for filename in os.listdir(dir_path):
    if filename.endswith(".js"):
        filepath = os.path.join(dir_path, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        
        # We look for strings like: api.get('/auth/user/')
        # and replace the trailing slash.
        # Regex explanation:
        # (api\.(?:get|post|put|patch|delete)\(['"`][^'"`]+)/(['"`])
        # Group 1: The api call up to the last char before the slash
        # Group 2: The closing quote
        new_content = re.sub(r"(api\.(?:get|post|put|patch|delete)\(['\"][^\'\"]+)/(['\"])", r"\1\2", content)
        
        if new_content != content:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(new_content)
            print(f"Updated {filename}")
