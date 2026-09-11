import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check, Sparkles, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function LanguageModal() {
  const {
    language,
    languages,
    selectLanguage,
    showModal,
    closeLanguageModal,
    hasSelectedLanguage,
    t,
  } = useLanguage();

  if (!showModal) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative w-full max-w-4xl bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl my-auto max-h-[92vh] flex flex-col overflow-hidden text-[#0a192f]"
      >
        {/* Close button if user has already selected a language before */}
        {hasSelectedLanguage && (
          <button
            onClick={closeLanguageModal}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors z-20 cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-4 sm:mb-6 shrink-0 pt-2 sm:pt-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-[#0284c7] text-[10px] sm:text-xs font-black uppercase tracking-wider mb-2 sm:mb-3">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Multi-Language Support
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-[#0a192f] flex items-center justify-center gap-2 sm:gap-3">
            <Globe className="w-5 h-5 sm:w-7 sm:h-7 text-[#0284c7] shrink-0" />
            <span>{t('select_language')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-1 max-w-lg mx-auto">
            {t('choose_language_sub')}
          </p>
        </div>

        {/* 16 Languages Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3.5 overflow-y-auto pr-1 py-1 custom-scrollbar flex-1">
          {languages.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <motion.button
                key={lang.code}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => selectLanguage(lang.code)}
                className={`
                  relative p-3 sm:p-4 rounded-xl sm:rounded-2xl text-left transition-all duration-200 flex flex-col justify-between border cursor-pointer
                  ${
                    isSelected
                      ? 'bg-sky-50/90 border-2 border-[#0284c7] shadow-md shadow-sky-500/10'
                      : 'bg-slate-50/80 hover:bg-slate-100 border-slate-200/90 hover:border-slate-300'
                  }
                `}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <span className={`text-[9px] sm:text-xs font-bold px-2 py-0.5 rounded truncate max-w-[80%] ${isSelected ? 'bg-[#0284c7] text-white' : 'bg-slate-200/80 text-slate-600'}`}>
                    {lang.region}
                  </span>
                  {isSelected && (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#0284c7] text-white flex items-center justify-center shadow-xs shrink-0">
                      <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm sm:text-lg font-black text-[#0a192f] leading-tight truncate">
                    {lang.native}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-bold truncate">{lang.name}</p>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Footer Action Button */}
        <div className="pt-3 sm:pt-4 mt-2 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-600 font-semibold hidden sm:block truncate">
            Selected: <strong className="text-[#0284c7] font-black">{languages.find(l => l.code === language)?.native} ({languages.find(l => l.code === language)?.name})</strong>
          </span>
          <button
            onClick={() => selectLanguage(language)}
            className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#0a192f] hover:bg-[#0284c7] shadow-md transition-all duration-200 ml-auto flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t('continue_btn')}</span> &rarr;
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
