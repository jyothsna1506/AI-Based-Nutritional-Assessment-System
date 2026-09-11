import json
import re

file_path = r"c:\Users\Asus\Desktop\AI-Based-Nutritional-Assessment-System\frontend\src\i18n\translations.js"

with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

match = re.search(r'export const TRANSLATIONS = (\{[\s\S]*?\});\s*$', text)
if not match:
    print("Error: Could not match TRANSLATIONS object.")
    exit(1)

data = json.loads(match.group(1))

dashboard_keys = {
    "en": {
        "dashboard_macros_summary_title": "Today's Macronutrients Summary",
        "dashboard_macros_summary_subtitle": "Real-time daily protein, carbohydrates, and healthy fats intake",
        "dashboard_btn_log_food": "Log Food",
        "dashboard_protein_subtext": "Target: 110g daily for muscle repair",
        "dashboard_carbs_subtext": "Complex energy carbs progress",
        "dashboard_fat_subtext": "Essential Omega fatty acids balance",
        "dashboard_ai_rec_title": "AI Health Recommendation",
        "dashboard_ai_rec_head_boost": "Micronutrient Boost Needed",
        "dashboard_ai_rec_head_optimal": "Metabolic Health Optimal",
        "dashboard_ai_rec_body_boost": "Your telemetry indicates mild vulnerability to key nutrients. Consider reviewing your daily meal plan to optimize iron & vitamin absorption.",
        "dashboard_ai_rec_body_optimal": "Your daily calorie and macronutrient intake is well balanced. Keep maintaining your 7-day health streak!",
        "dashboard_btn_ask_coach": "Ask AI Coach",
        "dashboard_target_label": "Target:",
        "dashboard_target_water_label": "Target"
    },
    "hi": {
        "dashboard_macros_summary_title": "आज का मैक्रोन्यूट्रिएंट्स सारांश",
        "dashboard_macros_summary_subtitle": "वास्तविक समय में दैनिक प्रोटीन, कार्बोहाइड्रेट और वसा की खपत",
        "dashboard_btn_log_food": "भोजन दर्ज करें",
        "dashboard_protein_subtext": "लक्ष्य: मांसपेशियों की मरम्मत के लिए 110 ग्राम दैनिक",
        "dashboard_carbs_subtext": "जटिल ऊर्जा कार्बोहाइड्रेट प्रगति",
        "dashboard_fat_subtext": "आवश्यक ओमेगा फैटी एसिड संतुलन",
        "dashboard_ai_rec_title": "एआई स्वास्थ्य अनुशंसा",
        "dashboard_ai_rec_head_boost": "सूक्ष्म पोषक तत्वों की आवश्यकता है",
        "dashboard_ai_rec_head_optimal": "चयापचय स्वास्थ्य सर्वोत्तम है",
        "dashboard_ai_rec_body_boost": "आपका डेटा कुछ पोषक तत्वों में संवेदनशीलता दिखाता है। आयरन और विटामिन अवशोषण में सुधार के लिए भोजन योजना देखें।",
        "dashboard_ai_rec_body_optimal": "आपका दैनिक कैलोरी और मैक्रोन्यूट्रिएंट सेवन संतुलित है। अपना स्वास्थ्य सिलसिला बनाए रखें!",
        "dashboard_btn_ask_coach": "एआई कोच से पूछें",
        "dashboard_target_label": "लक्ष्य:",
        "dashboard_target_water_label": "लक्ष्य"
    },
    "sa": {
        "dashboard_macros_summary_title": "अद्यतन मैक्रोन्यूट्रिएंट सारांशः",
        "dashboard_macros_summary_subtitle": "दैनिक प्रोटीन्, कार्बोहाइड्रेट, वसा सेवनस्य विवरणम्",
        "dashboard_btn_log_food": "भोजनं प्रविशतु",
        "dashboard_protein_subtext": "लक्ष्यम्: मांसपेशीरक्षणार्थं प्रतिदिनं ११० ग्राम्",
        "dashboard_carbs_subtext": "जटिल ऊर्जा कार्बोहाइड्रेट प्रगतिः",
        "dashboard_fat_subtext": "आवश्यक ओमेगा वसा सन्तुलनम्",
        "dashboard_ai_rec_title": "एआई स्वास्थ्य अनुशंसनम्",
        "dashboard_ai_rec_head_boost": "सूक्ष्मपोषकतत्त्वानां आवश्यकता वर्तते",
        "dashboard_ai_rec_head_optimal": "चयापचय स्वास्थ्यं श्रेष्ठम्",
        "dashboard_ai_rec_body_boost": "भवतः डेटा पोषकतत्त्वेषु संवेदनशीलतां दर्शयति।",
        "dashboard_ai_rec_body_optimal": "भवतः दैनिकं कैलोरी सेवनं सन्तुलितम् अस्ति।",
        "dashboard_btn_ask_coach": "एआई शिक्षकेन सह सम्भाषतां करोतु",
        "dashboard_target_label": "लक्ष्यम्:",
        "dashboard_target_water_label": "लक्ष्यम्"
    },
    "as": {
        "dashboard_macros_summary_title": "আজৰ মেক্ৰ'নিউট্ৰিয়েন্টৰ সাৰাংশ",
        "dashboard_macros_summary_subtitle": "ৰিয়েল-টাইম দৈনিক প্ৰ'টিন, কাৰ্ব'হাইড্ৰেট আৰু চৰ্বিৰ গ্ৰহণ",
        "dashboard_btn_log_food": "আহাৰ অন্তৰ্ভুক্ত কৰক",
        "dashboard_protein_subtext": "লক্ষ্য: মাংসপেশী মেৰামতিৰ বাবে দৈনিক ১১০ গ্ৰাম",
        "dashboard_carbs_subtext": "জটিল শক্তি কাৰ্ব'হাইড্ৰেটৰ অগ্ৰগতি",
        "dashboard_fat_subtext": "প্ৰয়োজনীয় অ'মেগা ফেটি এচিডৰ সমতা",
        "dashboard_ai_rec_title": "এআই স্বাস্থ্য পৰামৰ্শ",
        "dashboard_ai_rec_head_boost": "মাইক্ৰ'নিউট্ৰিয়েন্টৰ প্ৰয়োজন",
        "dashboard_ai_rec_head_optimal": "মেটাবলীক স্বাস্থ্য উত্তম",
        "dashboard_ai_rec_body_boost": "আপোনাৰ ডাটাই আইৰণ আৰু ভিটামিনৰ প্ৰয়োজনীয়তা দেখুৱাইছে।",
        "dashboard_ai_rec_body_optimal": "আপোনাৰ দৈনিক কেলৰী গ্ৰহণ ভাৰসাম্যপূৰ্ণ।",
        "dashboard_btn_ask_coach": "এআই ক'চৰ পৰা সুধক",
        "dashboard_target_label": "লক্ষ্য:",
        "dashboard_target_water_label": "লক্ষ্য"
    },
    "bn": {
        "dashboard_macros_summary_title": "আজকের ম্যাক্রোনিউট্রিয়েন্টের সারসংক্ষেপ",
        "dashboard_macros_summary_subtitle": "রিয়েল-টাইমে প্রোটিন, কার্বোহাইড্রেট এবং ফ্যাটের দৈনন্দিন গ্রহণ",
        "dashboard_btn_log_food": "খাবার যোগ করুন",
        "dashboard_protein_subtext": "লক্ষ্য: পেশী পুনর্গঠনের জন্য প্রতিদিন ১১০ গ্রাম",
        "dashboard_carbs_subtext": "জটিল শক্তি কার্বোহাইড্রেটের অগ্রগতি",
        "dashboard_fat_subtext": "ضروری ওমেগা ফ্যাটি অ্যাসিডের ভারসাম্য",
        "dashboard_ai_rec_title": "এআই স্বাস্থ্য পরামর্শ",
        "dashboard_ai_rec_head_boost": "মাইক্রোনিউট্রিয়েন্ট বৃদ্ধি প্রয়োজন",
        "dashboard_ai_rec_head_optimal": "মেটাবলিক স্বাস্থ্য সেরা",
        "dashboard_ai_rec_body_boost": "আপনার ডেটা আয়রন ও ভিটামিন শোষণে উন্নতির সুযোগ দেখাচ্ছে।",
        "dashboard_ai_rec_body_optimal": "আপনার দৈনন্দিন ক্যালোরি গ্রহণ চমৎকারভাবে ভারসাম্যপূর্ণ।",
        "dashboard_btn_ask_coach": "এআই কোচকে জিজ্ঞাসা করুন",
        "dashboard_target_label": "লক্ষ্য:",
        "dashboard_target_water_label": "লক্ষ্য"
    },
    "gu": {
        "dashboard_macros_summary_title": "આજનો મેક્રોન્યુટ્રિઅન્ટ્સ સારાંશ",
        "dashboard_macros_summary_subtitle": "રિયલ-ટાઇમમાં દૈનિક પ્રોટીન, કાર્બોહાઇડ્રેટ્સ અને ચરબીનો વપરાશ",
        "dashboard_btn_log_food": "ખોરાક ઉમેરો",
        "dashboard_protein_subtext": "લક્ષ્ય: સ્નાયુ રિપેર માટે રોજના 110 ગ્રામ",
        "dashboard_carbs_subtext": "જટિલ ઊર્જા કાર્બોહાઇડ્રેટ પ્રગતિ",
        "dashboard_fat_subtext": "જરૂરી ઓમેગા ફેટી એસિડ સમતુલન",
        "dashboard_ai_rec_title": "એઆઈ સ્વાસ્થ્ય ભલામણ",
        "dashboard_ai_rec_head_boost": "માઇક્રોન્યુટ્રિઅન્ટ બૂસ્ટ જરૂરી",
        "dashboard_ai_rec_head_optimal": "ચયાપચય સ્વાસ્થ્ય ઉત્તમ",
        "dashboard_ai_rec_body_boost": "તમારો ડેટા પોષક તત્વોમાં સંવેદનશીલતા દર્શાવે છે.",
        "dashboard_ai_rec_body_optimal": "તમારું દૈનિક કેલરી વપરાશ સંતુલિત છે.",
        "dashboard_btn_ask_coach": "એઆઈ કોચને પૂછો",
        "dashboard_target_label": "લક્ષ્ય:",
        "dashboard_target_water_label": "લક્ષ્ય"
    },
    "kn": {
        "dashboard_macros_summary_title": "ಇಂದಿನ ಮ್ಯಾಕ್ರೋನ್ಯೂಟ್ರಿಯೆಂಟ್ಸ್ ಸಾರಾಂಶ",
        "dashboard_macros_summary_subtitle": "ನೈಜ ಸಮಯದ ದೈನಂದಿನ ಪ್ರೋಟೀನ್, ಕಾರ್ಬೋಹೈಡ್ರೇಟ್ ಮತ್ತು ಕೊಬ್ಬಿನ ಸೇವನೆ",
        "dashboard_btn_log_food": "ಆಹಾರ ದಾಖಲಿಸಿ",
        "dashboard_protein_subtext": "ಗುರಿ: ಸ್ನಾಯು ದುರಸ್ತಿಗೆ ಪ್ರತಿದಿನ 110 ಗ್ರಾಂ",
        "dashboard_carbs_subtext": "ಸಂಕಿರ್ಣ ಶಕ್ತಿಯ ಕಾರ್ಬೋಹೈಡ್ರೇಟ್ ಪ್ರಗತಿ",
        "dashboard_fat_subtext": "ಅಗತ್ಯ ಒಮೆಗಾ ಕೊಬ್ಬಿನಾಮ್ಲಗಳ ಸಮತೋಲನ",
        "dashboard_ai_rec_title": "ಎಐ ಆರೋಗ್ಯ ಶಿಫಾರಸು",
        "dashboard_ai_rec_head_boost": "ಮೈಕ್ರೋನ್ಯೂಟ್ರಿಯೆಂಟ್ ಹೆಚ್ಚಳ ಅಗತ್ಯವಿದೆ",
        "dashboard_ai_rec_head_optimal": "ಚಯಾಪಚಯ ಆರೋಗ್ಯ ಅತ್ಯುತ್ತಮವಾಗಿದೆ",
        "dashboard_ai_rec_body_boost": "ನಿಮ್ಮ ಡೇಟಾ ಪ್ರಮುಖ ಪೋಷಕಾಂಶಗಳ ಅಗತ್ಯವನ್ನು ತೋರಿಸುತ್ತದೆ.",
        "dashboard_ai_rec_body_optimal": "ನಿಮ್ಮ ದೈನಂದಿನ ಕ್ಯಾಲೊರಿ ಸೇವನೆಯು ಸಮತೋಲಿತವಾಗಿದೆ.",
        "dashboard_btn_ask_coach": "ಎಐ ಕೋಚ್ ಅನ್ನು ಕೇಳಿ",
        "dashboard_target_label": "ಗುರಿ:",
        "dashboard_target_water_label": "ಗುರಿ"
    },
    "ks": {
        "dashboard_macros_summary_title": "আজوک میکرونیوٹریئنٹس خلاصہ",
        "dashboard_macros_summary_subtitle": "پروٹین، کاربوہائیڈریٹ تہٕ فیٹک روزانہ حساب",
        "dashboard_btn_log_food": "کھین درج کرو",
        "dashboard_protein_subtext": "ہدف: ۱۱۰ گرام روزانہ",
        "dashboard_carbs_subtext": "کاربوہائیڈریٹ پیش رفت",
        "dashboard_fat_subtext": "اومیکا فیٹی ایسڈ توازن",
        "dashboard_ai_rec_title": "اے آئی صحت مشورہ",
        "dashboard_ai_rec_head_boost": "غذائیت بوشٹ ضرورت",
        "dashboard_ai_rec_head_optimal": "صحت بہترین",
        "dashboard_ai_rec_body_boost": "توہین دتا چھو کچھ غذائیت ضرورت باوان۔",
        "dashboard_ai_rec_body_optimal": "توہین روزانہ کیلوریز توازن چھو۔",
        "dashboard_btn_ask_coach": "اے آئی کوچس ترسو",
        "dashboard_target_label": "ہدف:",
        "dashboard_target_water_label": "ہدف"
    },
    "ml": {
        "dashboard_macros_summary_title": "ഇന്നത്തെ മാക്രോന്യൂട്രിയന്റ്സ് സംഗ്രഹം",
        "dashboard_macros_summary_subtitle": "തത്സമയ പ്രോട്ടീൻ, കാർബോഹൈഡ്രേറ്റ്, കൊഴുപ്പ് ഉപഭോഗം",
        "dashboard_btn_log_food": "ഭക്ഷണം രേഖപ്പെടുത്തുക",
        "dashboard_protein_subtext": "ലക്ഷ്യം: പേശികളുടെ ആരോഗ്യത്തിന് പ്രതിദിനം 110 ഗ്രാം",
        "dashboard_carbs_subtext": "ഊർജ്ജ കാർബോഹൈഡ്രേറ്റ് പുരോഗതി",
        "dashboard_fat_subtext": "അത്യാവശ്യ ഒമേഗ ഫാറ്റി ആസിഡ് സന്തുലനം",
        "dashboard_ai_rec_title": "എഐ ആരോഗ്യ ശുപാർശ",
        "dashboard_ai_rec_head_boost": "മൈക്രോന്യൂട്രിയന്റ് വർദ്ധനവ് ആവശ്യമാണ്",
        "dashboard_ai_rec_head_optimal": "മെറ്റബോളിക് ആരോഗ്യം ഉത്തമം",
        "dashboard_ai_rec_body_boost": "നിങ്ങളുടെ വിവരങ്ങൾ അയൺ, വിറ്റാമിൻ ആവശ്യകത സൂചിപ്പിക്കുന്നു.",
        "dashboard_ai_rec_body_optimal": "നിങ്ങളുടെ ദൈനംദിന കലോറി ഉപഭോഗം സന്തുലിതമാണ്.",
        "dashboard_btn_ask_coach": "എഐ കോച്ചിനോട് ചോദിക്കുക",
        "dashboard_target_label": "ലക്ഷ്യം:",
        "dashboard_target_water_label": "ലക്ഷ്യം"
    },
    "mr": {
        "dashboard_macros_summary_title": "आजचा मॅक्रोन्यूट्रिएंट्स सारांश",
        "dashboard_macros_summary_subtitle": "रिअल-टाइम मधील दैनंदिन प्रथिने, कर्बोदके आणि चरबीचा वापर",
        "dashboard_btn_log_food": "अन्न नोंदवा",
        "dashboard_protein_subtext": "लक्ष्य: स्नायूंच्या दुरुस्तीसाठी दररोज ११० ग्रॅम",
        "dashboard_carbs_subtext": "जटिल ऊर्जा कर्बोदके प्रगती",
        "dashboard_fat_subtext": "आवश्यक ओमेगा फॅटी ॲसिड समतोल",
        "dashboard_ai_rec_title": "एआय आरोग्य शिफारस",
        "dashboard_ai_rec_head_boost": "सूक्ष्म पोषक घटकांची गरज आहे",
        "dashboard_ai_rec_head_optimal": "चयापचय आरोग्य उत्तम आहे",
        "dashboard_ai_rec_body_boost": "तुमचा डेटा काही पोषक घटकांची गरज दाखवतो. जेवण योजना तपासा.",
        "dashboard_ai_rec_body_optimal": "तुमचे दैनंदिन कॅलरी सेवन संतुलित आहे.",
        "dashboard_btn_ask_coach": "एआय कोचला विचारा",
        "dashboard_target_label": "लक्ष्य:",
        "dashboard_target_water_label": "लक्ष्य"
    },
    "ne": {
        "dashboard_macros_summary_title": "आजको म्याक्रोन्युट्रिएन्ट सारंश",
        "dashboard_macros_summary_subtitle": "वास्तविक समयमा दैनिक प्रोटिन, कार्बोहाइड्रेट र बोसोको खपत",
        "dashboard_btn_log_food": "खाना दर्ता गर्नुहोस्",
        "dashboard_protein_subtext": "लक्ष्य: मासुपेसी मर्मतका लागि दैनिक ११० ग्राम",
        "dashboard_carbs_subtext": "जटिल ऊर्जा कार्बोहाइड्रेट प्रगति",
        "dashboard_fat_subtext": "आवश्यक ओमेगा फ्याटी एसिड सन्तुलन",
        "dashboard_ai_rec_title": "एआई स्वास्थ्य सिफारिस",
        "dashboard_ai_rec_head_boost": "सूक्ष्म पोषक तत्व आवश्यकता",
        "dashboard_ai_rec_head_optimal": "मेटाबोलिक स्वास्थ्य उत्तम छ",
        "dashboard_ai_rec_body_boost": "तपाईंको डेटाले केही पोषक तत्वको कमी देखाउँछ।",
        "dashboard_ai_rec_body_optimal": "तपाईंको दैनिक क्यालोरी सेवन सन्तुलित छ।",
        "dashboard_btn_ask_coach": "एआई कोचलाई सोध्नुहोस्",
        "dashboard_target_label": "लक्ष्य:",
        "dashboard_target_water_label": "लक्ष्य"
    },
    "or": {
        "dashboard_macros_summary_title": "ଆଜିର ମ୍ୟାକ୍ରୋନ୍ୟୁଟ୍ରିଏଣ୍ଟସ୍ ସାରାଂଶ",
        "dashboard_macros_summary_subtitle": "ରିଅଲ-ଟାଇମ୍ ପ୍ରୋଟିନ୍, କାର୍ବୋହାଇଡ୍ରେଟ୍ ଏବଂ ଫ୍ୟାଟ୍ ବ୍ୟବହାର",
        "dashboard_btn_log_food": "ଖାଦ୍ୟ ଯୋଡନ୍ତୁ",
        "dashboard_protein_subtext": "ଲକ୍ଷ୍ୟ: ମାଂସପେଶୀ ପାଇଁ ଦୈନିକ ୧୧୦ ଗ୍ରାମ୍",
        "dashboard_carbs_subtext": "ଶକ୍ତି କାର୍ବୋହାଇଡ୍ରେଟ୍ ଅଗ୍ରଗତି",
        "dashboard_fat_subtext": "ଆବଶ୍ୟକ ଓମେଗା ଫ୍ୟାଟି ଏସିଡ୍ ସନ୍ତୁଳନ",
        "dashboard_ai_rec_title": "ଏଆଇ ସ୍ୱାସ୍ଥ୍ୟ ସୁପାରିଶ",
        "dashboard_ai_rec_head_boost": "ମାଇକ୍ରୋନ୍ୟୁଟ୍ରିଏଣ୍ଟ ଆବଶ୍ୟକ",
        "dashboard_ai_rec_head_optimal": "ମେଟାବୋଲିକ୍ ସ୍ୱାସ୍ଥ୍ୟ ଉତ୍ତମ",
        "dashboard_ai_rec_body_boost": "ଆପଣଙ୍କର ଡାଟା ପୋଷକ ତତ୍ତ୍ୱର ଆବଶ୍ୟକତା ଦର୍ଶାଉଛି।",
        "dashboard_ai_rec_body_optimal": "ଆପଣଙ୍କର ଦୈନିକ କ୍ୟାଲୋରୀ ସନ୍ତୁଳିତ ଅଛି।",
        "dashboard_btn_ask_coach": "ଏଆଇ କୋଚଙ୍କୁ ପଚାରନ୍ତୁ",
        "dashboard_target_label": "ଲକ୍ଷ୍ୟ:",
        "dashboard_target_water_label": "ଲକ୍ଷ୍ୟ"
    },
    "pa": {
        "dashboard_macros_summary_title": "ਅੱਜ ਦਾ ਮੈਕਰੋਨਿਊਟ੍ਰੀਐਂਟਸ ਸੰਖੇਪ",
        "dashboard_macros_summary_subtitle": "ਰੀਅਲ-ਟਾਈਮ ਵਿੱਚ ਰੋਜ਼ਾਨਾ ਪ੍ਰੋਟੀਨ, ਕਾਰਬੋਹਾਈਡ੍ਰੇਟਸ ਅਤੇ ਫੈਟ ਦੀ ਖਪਤ",
        "dashboard_btn_log_food": "ਭੋਜਨ ਦਰਜ ਕਰੋ",
        "dashboard_protein_subtext": "ਟੀਚਾ: ਮਾਸਪੇਸ਼ੀਆਂ ਲਈ ਰੋਜ਼ਾਨਾ 110 ਗ੍ਰਾਮ",
        "dashboard_carbs_subtext": "ਊਰਜਾ ਕਾਰਬੋਹਾਈਡ੍ਰੇਟਸ ਪ੍ਰਗਤੀ",
        "dashboard_fat_subtext": "ਜ਼ਰੂਰੀ ਓਮੇਗਾ ਫੈਟੀ ਐਸਿਡ ਸੰਤੁਲਨ",
        "dashboard_ai_rec_title": "ਏਆਈ ਸਿਹਤ ਸਿਫਾਰਸ਼",
        "dashboard_ai_rec_head_boost": "ਮਾਈਕ੍ਰੋਨਿਊਟ੍ਰੀਐਂਟ ਦੀ ਲੋੜ ਹੈ",
        "dashboard_ai_rec_head_optimal": "ਮੈਟਾਬੋਲਿਕ ਸਿਹਤ ਬਹੁਤ ਵਧੀਆ ਹੈ",
        "dashboard_ai_rec_body_boost": "ਤੁਹਾਡਾ ਡੇਟਾ ਕੁਝ ਪੌਸ਼ਟਿਕ ਤੱਤਾਂ ਦੀ ਲੋੜ ਦਿਖਾਉਂਦਾ ਹੈ।",
        "dashboard_ai_rec_body_optimal": "ਤੁਹਾਡੀ ਰੋਜ਼ਾਨਾ ਕੈਲੋਰੀ ਦੀ ਖਪਤ ਸੰਤੁਲਿਤ ਹੈ।",
        "dashboard_btn_ask_coach": "ਏਆਈ ਕੋਚ ਨੂੰ ਪੁੱਛੋ",
        "dashboard_target_label": "ਟੀਚਾ:",
        "dashboard_target_water_label": "ਟੀਚਾ"
    },
    "sd": {
        "dashboard_macros_summary_title": "اڄوڪو ميڪرونيوٽريئنٽس خلاصو",
        "dashboard_macros_summary_subtitle": "پروٽين، ڪاربوهائيڊريٽس ۽ فيٽس جو روزانو حساب",
        "dashboard_btn_log_food": "خوراڪ داخل ڪريو",
        "dashboard_protein_subtext": "دفتر: روزانو ۱۱۰ گرام",
        "dashboard_carbs_subtext": "ڪاربوهائيڊريٽس ترقي",
        "dashboard_fat_subtext": "اوميگا فيٽي ايسڊ توازن",
        "dashboard_ai_rec_title": "اي آئي صحت سفارش",
        "dashboard_ai_rec_head_boost": "غذائيت جي ضرورت آهي",
        "dashboard_ai_rec_head_optimal": "صحت بهترين آهي",
        "dashboard_ai_rec_body_boost": "توهان جو ڊيٽا ڪجهه غذائيت جي ضرورت ڏيکاري ٿو.",
        "dashboard_ai_rec_body_optimal": "توهان جي روزاني ڪيلوري سٺي حالت ۾ آهي.",
        "dashboard_btn_ask_coach": "اي آئي ڪوچ کان پڇو",
        "dashboard_target_label": "هدف:",
        "dashboard_target_water_label": "هدف"
    },
    "ta": {
        "dashboard_macros_summary_title": "இன்றைய மேக்ரோநியூட்ரியண்ட்ஸ் சுருக்கம்",
        "dashboard_macros_summary_subtitle": "நிகழ்நேர புரதம், கார்போஹைட்ரேட் மற்றும் கொழுப்பு நுகர்வு",
        "dashboard_btn_log_food": "உணவை பதிவு செய்",
        "dashboard_protein_subtext": "இலக்கு: தசை வளர்ச்சிக்கு தினமும் 110 கிராம்",
        "dashboard_carbs_subtext": "ஆற்றல் கார்போஹைட்ரேட் முன்னேற்றம்",
        "dashboard_fat_subtext": "அத்தியாவசிய ஒமேகா கொழுப்பு அமில சமநிலை",
        "dashboard_ai_rec_title": "ஏஐ சுகாதார பரிந்துரை",
        "dashboard_ai_rec_head_boost": "நுண்ணூட்டச்சத்து தேவைப்படுகிறது",
        "dashboard_ai_rec_head_optimal": "மெட்டபாலிக் ஆரோக்கியம் சிறந்தது",
        "dashboard_ai_rec_body_boost": "உங்கள் தரவு சில ஊட்டச்சத்துக்களின் தேவையை காட்டுகிறது.",
        "dashboard_ai_rec_body_optimal": "உங்கள் தினசரி கலோரி நுகர்வு சீராக உள்ளது.",
        "dashboard_btn_ask_coach": "ஏஐ பயிற்சியாளரிடம் கேளுங்கள்",
        "dashboard_target_label": "இலக்கு:",
        "dashboard_target_water_label": "இலக்கு"
    },
    "te": {
        "dashboard_macros_summary_title": "ఈరోజు మ్యాక్రోన్యూట్రియెంట్స్ సారాంశం",
        "dashboard_macros_summary_subtitle": "రియల్-టైమ్ ప్రోటీన్, కార్బోహైడ్రేట్లు మరియు కొవ్వుల పరిమాణం",
        "dashboard_btn_log_food": "ఆహారం నమోదు చేయండి",
        "dashboard_protein_subtext": "లక్ష్యం: కండరాల కోసం రోజుకు 110 గ్రాములు",
        "dashboard_carbs_subtext": "శక్తి కార్బోహైడ్రేట్ల పురోగతి",
        "dashboard_fat_subtext": "అవసరమైన ఒమేగా కొవ్వు ఆమ్లాల సమతుల్యత",
        "dashboard_ai_rec_title": "ఎఐ ఆరోగ్య సిఫార్సు",
        "dashboard_ai_rec_head_boost": "పోషకాల పెరుగుదల అవసరం",
        "dashboard_ai_rec_head_optimal": "మెటాబోలిక్ ఆరోగ్యం అద్భుతంగా ఉంది",
        "dashboard_ai_rec_body_boost": "మీ డేటా కొన్ని ముఖ్యమైన పోషకాల అవసరాన్ని చూపుతోంది.",
        "dashboard_ai_rec_body_optimal": "మీ రోజువారీ క్యాలరీల వినియోగం సమతుల్యంగా ఉంది.",
        "dashboard_btn_ask_coach": "ఎఐ కోచ్‌ను అడగండి",
        "dashboard_target_label": "లక్ష్యం:",
        "dashboard_target_water_label": "లక్ష్యం"
    },
    "ur": {
        "dashboard_macros_summary_title": "آج کا میکرونیوٹریئنٹس خلاصہ",
        "dashboard_macros_summary_subtitle": "ریئل ٹائم میں روزانہ پروٹین، کاربوہائیڈریٹس اور چکنائی کا استعمال",
        "dashboard_btn_log_food": "کھانا درج کریں",
        "dashboard_protein_subtext": "ہدف: پٹھوں کی بحالی کے لیے روزانہ 110 گرام",
        "dashboard_carbs_subtext": "توانائی کاربوہائیڈریٹس پیشرفت",
        "dashboard_fat_subtext": "ضروری اومیگا فیٹی ایسڈز توازن",
        "dashboard_ai_rec_title": "اے آئی صحت کی سفارش",
        "dashboard_ai_rec_head_boost": "غذائیت کی ضرورت ہے",
        "dashboard_ai_rec_head_optimal": "صحت بہترین ہے",
        "dashboard_ai_rec_body_boost": "آپ کا ڈیٹا کچھ اہم غذائی اجزاء کی ضرورت ظاہر کرتا ہے۔",
        "dashboard_ai_rec_body_optimal": "آپ کی روزانہ کی کیلوریز کا استعمال متوازن ہے۔",
        "dashboard_btn_ask_coach": "اے آئی کوچ سے پوچھیں",
        "dashboard_target_label": "ہدف:",
        "dashboard_target_water_label": "ہدف"
    }
}

for lang, keys in dashboard_keys.items():
    if lang in data:
        for k, v in keys.items():
            data[lang][k] = v

new_json = json.dumps(data, ensure_ascii=False, indent=2)

header = text[:match.start()]
new_content = header + "export const TRANSLATIONS = " + new_json + ";\n"

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Successfully injected all dashboard translation keys across all 16 languages!")
