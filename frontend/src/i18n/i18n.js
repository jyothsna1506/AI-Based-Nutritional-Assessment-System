import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { TRANSLATIONS } from './translations';

// Convert flat key structure to i18next resources format
// Our translations.js has: { en: { key: value }, hi: { key: value }, ... }
// i18next expects: { en: { translation: { key: value } }, hi: { translation: { key: value } }, ... }
const resources = {};
Object.keys(TRANSLATIONS).forEach((langCode) => {
  resources[langCode] = {
    translation: TRANSLATIONS[langCode],
  };
});

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('nutriai_language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
    react: {
      useSuspense: false, // Avoid suspense boundary issues
    },
  });

export default i18n;
