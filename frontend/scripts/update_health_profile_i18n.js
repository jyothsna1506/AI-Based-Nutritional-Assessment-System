import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TRANSLATIONS } from '../src/i18n/translations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const newKeys = {
  en: {
    hp_bmr_label: "Est. Basal Metabolic Rate (BMR)",
    hp_tdee_label: "Est. Daily Energy Expenditure (TDEE)",
    hp_water_rec: "Recommended Water Intake",
    hp_lifestyle_score: "Lifestyle & Habits",
    hp_unsaved_changes: "You have unsaved profile changes",
    hp_quick_summary: "Metabolic & Biomarker Health Summary",
  },
  hi: {
    hp_bmr_label: "अनुमानित बेसल मेटाबॉलिक दर (BMR)",
    hp_tdee_label: "अनुमानित दैनिक ऊर्जा व्यय (TDEE)",
    hp_water_rec: "अनुशंसित जल का सेवन",
    hp_lifestyle_score: "जीवन शैली और आदतें",
    hp_unsaved_changes: "आपके पास अवांछित परिवर्तन हैं",
    hp_quick_summary: "चयापचय और बायोमार्कर स्वास्थ्य सारांश",
  },
  bn: {
    hp_bmr_label: "আনুমানিক বেসাল মেটাবলিক রেট (BMR)",
    hp_tdee_label: "আনুমানিক দৈনিক শক্তি ব্যয় (TDEE)",
    hp_water_rec: "সুপারিশকৃত পানি পানের পরিমাণ",
    hp_lifestyle_score: "জীবনধারা ও অভ্যাস",
    hp_unsaved_changes: "সংরক্ষণ না করা পরিবর্তন রয়েছে",
    hp_quick_summary: "বিপাকীয় ও বায়োমার্কার স্বাস্থ্য সারসংক্ষেপ",
  },
  ta: {
    hp_bmr_label: "மதிப்பிடப்பட்ட அடிப்படை வளர்சிதை மாற்ற விகிதம் (BMR)",
    hp_tdee_label: "மதிப்பிடப்பட்ட தினசரி ஆற்றல் செலவு (TDEE)",
    hp_water_rec: "பரிந்துரைக்கப்பட்ட நீர் உட்கொள்ளல்",
    hp_lifestyle_score: "வாழ்க்கை முறை மற்றும் பழக்கவழக்கங்கள்",
    hp_unsaved_changes: "சேமிக்கப்படாத மாற்றங்கள் உள்ளன",
    hp_quick_summary: "வளர்சிதை மாற்ற சுகாதார சுருக்கம்",
  },
  te: {
    hp_bmr_label: "అంచనా వేసిన బేసల్ మెటబాలిక్ రేటు (BMR)",
    hp_tdee_label: "అంచనా వేసిన రోజువారీ శక్తి వ్యయం (TDEE)",
    hp_water_rec: "సిఫార్సు చేసిన నీటి వినియోగం",
    hp_lifestyle_score: "జీవనశైలి & అలవాట్లు",
    hp_unsaved_changes: "సేవ్ చేయని మార్పులు ఉన్నాయి",
    hp_quick_summary: "జీవక్రియ ఆరోగ్య నివేదిక",
  },
  mr: {
    hp_bmr_label: "अंदाजित बेसल मेटाबॉलिक दर (BMR)",
    hp_tdee_label: "अंदाजित दैनिक ऊर्जा खर्च (TDEE)",
    hp_water_rec: "शिफारस केलेले पाणी सेवन",
    hp_lifestyle_score: "जीवनशैली आणि सवयी",
    hp_unsaved_changes: "तुमच्याकडे जतन न केलेले बदल आहेत",
    hp_quick_summary: "चयापचय आरोग्य सारांश",
  },
  gu: {
    hp_bmr_label: "અંદાજિત બેસલ મેટાબોલિક રેટ (BMR)",
    hp_tdee_label: "અંદાજિત દૈનિક ઉર્જા ખર્ચ (TDEE)",
    hp_water_rec: "ભલામણ કરેલ પાણીનું સેવન",
    hp_lifestyle_score: "જીવનશૈલી અને ટેવો",
    hp_unsaved_changes: "તમારી પાસે સાચવ્યા વગરના ફેરફારો છે",
    hp_quick_summary: "મેટાબોલિક સ્વાસ્થ્ય સારાંશ",
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
 * Includes Health Profile enhancements.
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
console.log('Successfully updated translations.js with Health Profile keys!');
