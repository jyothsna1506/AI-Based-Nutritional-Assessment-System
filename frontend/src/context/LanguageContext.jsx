import { createContext, useContext, useState } from 'react';
import i18n from '../i18n/i18n';
import { LANGUAGES } from '../i18n/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('nutriai_language') || 'en';
  });

  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(() => {
    return !!localStorage.getItem('nutriai_language');
  });

  const [showModal, setShowModal] = useState(() => {
    return !localStorage.getItem('nutriai_language');
  });

  const selectLanguage = (langCode) => {
    setLanguageState(langCode);
    localStorage.setItem('nutriai_language', langCode);
    i18n.changeLanguage(langCode); // Sync with i18next
    setHasSelectedLanguage(true);
    setShowModal(false);
  };

  const openLanguageModal = () => {
    setShowModal(true);
  };

  const closeLanguageModal = () => {
    setShowModal(false);
  };

  // Use i18next's t() function — handles fallback to English automatically
  const t = (key) => {
    return i18n.t(key);
  };

  const currentLanguageObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        languages: LANGUAGES,
        currentLanguageObj,
        selectLanguage,
        hasSelectedLanguage,
        showModal,
        openLanguageModal,
        closeLanguageModal,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;
