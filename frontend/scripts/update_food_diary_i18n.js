import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TRANSLATIONS } from '../src/i18n/translations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const newKeys = {
  en: {
    food_diary_quantity: "Quantity",
    food_diary_unit: "Unit",
    food_diary_unit_g: "Grams (g)",
    food_diary_unit_serving: "Servings",
    food_diary_unit_pcs: "Pieces (pcs)",
    food_diary_unit_ml: "Milliliters (ml)",
    food_diary_unit_cups: "Cups",
    food_diary_unit_oz: "Ounces (oz)",
    food_diary_unit_tbsp: "Tablespoons (tbsp)",
    food_diary_portion_builder: "Custom Portion Builder",
    food_diary_daily_targets: "Daily Macro Targets",
    food_diary_target_kcal: "Target: 2,000 kcal",
    food_diary_remaining: "Remaining",
    food_diary_consumed: "Consumed",
    food_diary_preset_quick: "Quick Add Popular Foods",
    food_diary_log_btn: "Log to Diary",
  },
  hi: {
    food_diary_quantity: "मात्रा",
    food_diary_unit: "इकाई",
    food_diary_unit_g: "ग्राम (g)",
    food_diary_unit_serving: "सर्विंग्स (Servings)",
    food_diary_unit_pcs: "नग / टुकड़े (pcs)",
    food_diary_unit_ml: "मिलीलीटर (ml)",
    food_diary_unit_cups: "कप (Cups)",
    food_diary_unit_oz: "औंस (oz)",
    food_diary_unit_tbsp: "चम्मच (tbsp)",
    food_diary_portion_builder: "कस्टम पोर्शन बिल्डर",
    food_diary_daily_targets: "दैनिक मैक्रो लक्ष्य",
    food_diary_target_kcal: "लक्ष्य: 2,000 किलोकैलोरी",
    food_diary_remaining: "शेष",
    food_diary_consumed: "सेवन किया",
    food_diary_preset_quick: "त्वरित लोकप्रिय खाद्य पदार्थ",
    food_diary_log_btn: "डायरी में दर्ज करें",
  },
  bn: {
    food_diary_quantity: "পরিমাণ",
    food_diary_unit: "একক",
    food_diary_unit_g: "গ্রাম (g)",
    food_diary_unit_serving: "সার্ভিংস",
    food_diary_unit_pcs: "পিস (pcs)",
    food_diary_unit_ml: "মিলিমিটার (ml)",
    food_diary_unit_cups: "কাপ (Cups)",
    food_diary_unit_oz: "আউন্স (oz)",
    food_diary_unit_tbsp: "টেবিলচামচ (tbsp)",
    food_diary_portion_builder: "কাস্টম পোরশন বিল্ডার",
    food_diary_daily_targets: "দৈনিক ম্যাক্রো লক্ষ্য",
    food_diary_target_kcal: "লক্ষ্য: ২,০০০ কিলোক্যালোরি",
    food_diary_remaining: "অবশিষ্ট",
    food_diary_consumed: "গ্রহণ করা হয়েছে",
    food_diary_preset_quick: "দ্রুত জনপ্রিয় খাবার",
    food_diary_log_btn: "ডায়েরিতে যোগ করুন",
  },
  ta: {
    food_diary_quantity: "அளவு",
    food_diary_unit: "அலகு",
    food_diary_unit_g: "கிராம் (g)",
    food_diary_unit_serving: "சர்விங்స్",
    food_diary_unit_pcs: "துண்டுகள் (pcs)",
    food_diary_unit_ml: "மில்லிலிட்டர் (ml)",
    food_diary_unit_cups: "கப்புகள் (Cups)",
    food_diary_unit_oz: "அவுன்ஸ் (oz)",
    food_diary_unit_tbsp: "ஸ்பூன் (tbsp)",
    food_diary_portion_builder: "தனிப்பயன் அளவு அமைப்பான்",
    food_diary_daily_targets: "தினசரி மேக்ரோ இலக்குகள்",
    food_diary_target_kcal: "இலக்கு: 2,000 கி.கலோரி",
    food_diary_remaining: "மீதமுள்ளது",
    food_diary_consumed: "உட்கொள்ளப்பட்டது",
    food_diary_preset_quick: "பிரபலமான உணவுகள்",
    food_diary_log_btn: "டைரியில் சேர்க்கவும்",
  },
  te: {
    food_diary_quantity: "పరిమాణం",
    food_diary_unit: "యూనిట్",
    food_diary_unit_g: "గ్రాములు (g)",
    food_diary_unit_serving: "సర్వింగ్స్",
    food_diary_unit_pcs: "ముక్కలు (pcs)",
    food_diary_unit_ml: "మిల్లీలీటర్లు (ml)",
    food_diary_unit_cups: "కప్పులు (Cups)",
    food_diary_unit_oz: "అవున్సులు (oz)",
    food_diary_unit_tbsp: "టేబుల్ స్పూన్లు (tbsp)",
    food_diary_portion_builder: "కస్టమ్ పోర్షన్ బిల్డర్",
    food_diary_daily_targets: "రోజువారీ మ్యాక్రో లక్ష్యాలు",
    food_diary_target_kcal: "లక్ష్యం: 2,000 కేలరీలు",
    food_diary_remaining: "మిగిలి ఉన్నవి",
    food_diary_consumed: "తీసుకున్నవి",
    food_diary_preset_quick: "ప్రసిద్ధ ఆహారాలు",
    food_diary_log_btn: "డైరీకి జతచేయండి",
  },
  mr: {
    food_diary_quantity: "प्रमाण",
    food_diary_unit: "एकक (Unit)",
    food_diary_unit_g: "ग्रॅम (g)",
    food_diary_unit_serving: "सर्व्हिंग्स",
    food_diary_unit_pcs: "नग (pcs)",
    food_diary_unit_ml: "मिलिलीटर (ml)",
    food_diary_unit_cups: "कप (Cups)",
    food_diary_unit_oz: "औंस (oz)",
    food_diary_unit_tbsp: "चमचे (tbsp)",
    food_diary_portion_builder: "कस्टम पोर्शन बिल्डर",
    food_diary_daily_targets: "दैनिक मॅक्रो उद्दिष्टे",
    food_diary_target_kcal: "उद्दिष्ट: 2,000 kcal",
    food_diary_remaining: "उरलेले",
    food_diary_consumed: "सेवन केलेले",
    food_diary_preset_quick: "झटपट लोकप्रिय अन्न",
    food_diary_log_btn: "डायरीत नोंदवा",
  },
  gu: {
    food_diary_quantity: "જથ્થો",
    food_diary_unit: "એકમ",
    food_diary_unit_g: "ગ્રામ (g)",
    food_diary_unit_serving: "સર્વિંગ્સ",
    food_diary_unit_pcs: "નંગ (pcs)",
    food_diary_unit_ml: "મિલિલિટર (ml)",
    food_diary_unit_cups: "કપ (Cups)",
    food_diary_unit_oz: "ઔંસ (oz)",
    food_diary_unit_tbsp: "ચમચી (tbsp)",
    food_diary_portion_builder: "કસ્ટમ પોર્શન બિલ્ડર",
    food_diary_daily_targets: "દૈનિક મેક્રો લક્ષ્યો",
    food_diary_target_kcal: "લક્ષ્ય: 2,000 kcal",
    food_diary_remaining: "બાકી",
    food_diary_consumed: "લીધેલું",
    food_diary_preset_quick: "ઝડપી લોકપ્રિય ખોરાક",
    food_diary_log_btn: "ડાયરીમાં ઉમેરો",
  }
};

const languagesList = ['en', 'hi', 'sa', 'as', 'bn', 'gu', 'kn', 'ks', 'ml', 'mr', 'ne', 'or', 'pa', 'sd', 'ta', 'te'];

for (const lang of languagesList) {
  const dict = newKeys[lang] || newKeys['hi'] || newKeys['en'];
  TRANSLATIONS[lang] = {
    ...TRANSLATIONS[lang],
    ...dict
  };
}

const jsContent = `/**
 * Multi-language translation dictionaries for 16 Indian & Regional Languages.
 * Fully translated with Food Diary Quantity & Unit System additions.
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
console.log('Successfully updated translations.js with Food Diary unit system keys!');
