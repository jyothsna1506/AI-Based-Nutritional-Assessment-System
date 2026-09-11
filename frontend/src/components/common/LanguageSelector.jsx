import { Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function LanguageSelector({ compact = false }) {
  const { currentLanguageObj, openLanguageModal } = useLanguage();

  return (
    <button
      onClick={openLanguageModal}
      type="button"
      className={`
        flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl border border-slate-200/90
        bg-slate-100/90 hover:bg-slate-200/80 text-[#0a192f] hover:text-[#0284c7]
        transition-all duration-200 text-xs sm:text-sm font-bold shadow-xs hover:border-sky-300
        shrink-0 cursor-pointer active:scale-95
      `}
      title="Change Language / भाषा बदलें"
    >
      <Globe className="w-4 h-4 text-[#0284c7] shrink-0 animate-pulse" />
      <span className="truncate max-w-[90px] sm:max-w-[120px]">
        {currentLanguageObj.native}
      </span>
    </button>
  );
}
