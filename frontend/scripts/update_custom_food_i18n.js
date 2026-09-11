import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TRANSLATIONS } from '../src/i18n/translations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const customKeys = {
  en: {
    food_diary_add_custom_btn: "+ Add Custom Product",
    food_diary_cant_find: "Can't find your product?",
    food_diary_create_custom_title: "Create Custom Food / Product",
    food_diary_custom_name_label: "Product Name",
    food_diary_custom_name_placeholder: "e.g. Fresh Banana, Home-cooked Meal",
    food_diary_custom_kcal_label: "Calories (kcal)",
    food_diary_custom_protein_label: "Protein (g)",
    food_diary_custom_carbs_label: "Carbohydrates (g)",
    food_diary_custom_fat_label: "Fat (g)",
    food_diary_save_custom_btn: "Save & Log Custom Product",
  },
  hi: {
    food_diary_add_custom_btn: "+ कस्टम प्रोडक्ट जोड़ें",
    food_diary_cant_find: "अपना उत्पाद नहीं मिला?",
    food_diary_create_custom_title: "कस्टम भोजन / उत्पाद बनाएं",
    food_diary_custom_name_label: "उत्पाद का नाम",
    food_diary_custom_name_placeholder: "उदा. ताज़ा केला, घर का बना भोजन",
    food_diary_custom_kcal_label: "कैलोरी (kcal)",
    food_diary_custom_protein_label: "प्रोटीन (g)",
    food_diary_custom_carbs_label: "कार्बोहाइड्रेट (g)",
    food_diary_custom_fat_label: "वसा (g)",
    food_diary_save_custom_btn: "कस्टम उत्पाद सहेजें और दर्ज करें",
  },
  bn: {
    food_diary_add_custom_btn: "+ কাস্টম পণ্য যোগ করুন",
    food_diary_cant_find: "আপনার কাঙ্ক্ষিত পণ্য খুঁজে পাচ্ছেন না?",
    food_diary_create_custom_title: "কাস্টম খাবার / পণ্য তৈরি করুন",
    food_diary_custom_name_label: "পণ্যের নাম",
    food_diary_custom_name_placeholder: "যেমন: টাটকা কলা, ঘরের তৈরি খাবার",
    food_diary_custom_kcal_label: "ক্যালোরি (kcal)",
    food_diary_custom_protein_label: "প্রোটিন (g)",
    food_diary_custom_carbs_label: "কার্বোহাইড্রেট (g)",
    food_diary_custom_fat_label: "ফ্যাট (g)",
    food_diary_save_custom_btn: "কাস্টম পণ্য সংরক্ষণ ও যোগ করুন",
  },
  ta: {
    food_diary_add_custom_btn: "+ கஸ்டம் பொருளைச் சேர்க்கவும்",
    food_diary_cant_find: "உங்கள் பொருளைக் கண்டுபிடிக்க முடியவில்லையா?",
    food_diary_create_custom_title: "கஸ்டம் உணவு / பொருளை உருவாக்கவும்",
    food_diary_custom_name_label: "பொருளின் பெயர்",
    food_diary_custom_name_placeholder: "எ.கா. பழம், சமைத்த உணவு",
    food_diary_custom_kcal_label: "கலோரிகள் (kcal)",
    food_diary_custom_protein_label: "புரதம் (g)",
    food_diary_custom_carbs_label: "கார்போஹைட்ரேட்டுகள் (g)",
    food_diary_custom_fat_label: "கொழுப்பு (g)",
    food_diary_save_custom_btn: "சேமித்துச் சேர்க்கவும்",
  },
  te: {
    food_diary_add_custom_btn: "+ కస్టమ్ ప్రొడక్ట్ జోడించండి",
    food_diary_cant_find: "మీరు కోరిన ఆహారం దొరకలేదా?",
    food_diary_create_custom_title: "కస్టమ్ ఆహారం / ప్రొడక్ట్ సృష్టించండి",
    food_diary_custom_name_label: "ప్రొడక్ట్ పేరు",
    food_diary_custom_name_placeholder: "ఉదా. అరటిపండు, ఇంటి వంట",
    food_diary_custom_kcal_label: "కేలరీలు (kcal)",
    food_diary_custom_protein_label: "ప్రోటీన్ (g)",
    food_diary_custom_carbs_label: "కార్బోహైడ్రేట్లు (g)",
    food_diary_custom_fat_label: "కొవ్వు (g)",
    food_diary_save_custom_btn: "సేవ్ చేసి డైరీలో నమోదు చేయండి",
  },
  mr: {
    food_diary_add_custom_btn: "+ कस्टम उत्पादन जोडा",
    food_diary_cant_find: "तुमचे उत्पादन सापडले नाही?",
    food_diary_create_custom_title: "कस्टम अन्न / उत्पादन तयार करा",
    food_diary_custom_name_label: "उत्पादनाचे नाव",
    food_diary_custom_name_placeholder: "उदा. ताजे केळे, घरी बनवलेले जेवण",
    food_diary_custom_kcal_label: "कॅलरीज (kcal)",
    food_diary_custom_protein_label: "प्रथिने (g)",
    food_diary_custom_carbs_label: "कार्बोहायड्रेट्स (g)",
    food_diary_custom_fat_label: "मेद (g)",
    food_diary_save_custom_btn: "कस्टम उत्पादन जतन करा",
  },
  gu: {
    food_diary_add_custom_btn: "+ કસ્ટમ પ્રોડક્ટ ઉમેરો",
    food_diary_cant_find: "તમારી પ્રોડક્ટ મળી નથી?",
    food_diary_create_custom_title: "કસ્ટમ ખોરાક / પ્રોડક્ટ બનાવો",
    food_diary_custom_name_label: "પ્રોડક્ટનું નામ",
    food_diary_custom_name_placeholder: "દા.ત. કેળા, ઘરનું ભોજન",
    food_diary_custom_kcal_label: "કેલરી (kcal)",
    food_diary_custom_protein_label: "પ્રોટીન (g)",
    food_diary_custom_carbs_label: "કાર્બોહાઇડ્રેટ્સ (g)",
    food_diary_custom_fat_label: "ચરબી (g)",
    food_diary_save_custom_btn: "કસ્ટમ પ્રોડક્ટ સાચવો અને ઉમેરો",
  }
};

const languagesList = ['en', 'hi', 'sa', 'as', 'bn', 'gu', 'kn', 'ks', 'ml', 'mr', 'ne', 'or', 'pa', 'sd', 'ta', 'te'];

for (const lang of languagesList) {
  const dict = customKeys[lang] || customKeys['hi'] || customKeys['en'];
  TRANSLATIONS[lang] = {
    ...TRANSLATIONS[lang],
    ...dict
  };
}

const jsContent = `/**
 * Multi-language translation dictionaries for 16 Indian & Regional Languages.
 * Includes Custom Product Creation keys for Food Diary.
 */

export const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', region: 'Global / India' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', region: 'Bharat' },
  { code: 'sa', name: 'Sanskrit', native: 'संस्कृतम्', region: 'Classical' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া', region: 'Assam' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', region: 'West Bengal' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', region: 'Gujarat' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', region: 'Karnataka' },
  { code: 'ks', name: 'Kashmiri', native: 'कॉशुर / كأشُر', region: 'Jammu & Kashmir' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', region: 'Kerala' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', region: 'Maharashtra' },
  { code: 'ne', name: 'Nepali', native: 'नेपाली', region: 'Nepal / Sikkim' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', region: 'Odisha' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', region: 'Punjab' },
  { code: 'sd', name: 'Sindhi', native: 'سنڌي / सिंधी', region: 'Sindh / India' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', region: 'Tamil Nadu' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', region: 'Andhra / Telangana' },
];

export const TRANSLATIONS = ${JSON.stringify(TRANSLATIONS, null, 2)};
`;

const outputPath = path.join(__dirname, '../src/i18n/translations.js');
fs.writeFileSync(outputPath, jsContent, 'utf-8');
console.log('Successfully updated translations.js with Custom Product keys!');
