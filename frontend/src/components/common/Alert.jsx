import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const alertStyles = {
  success: {
    badgeBg: 'bg-emerald-100/80 text-emerald-800 border-emerald-200',
    text: 'text-emerald-950',
    icon: CheckCircle,
    iconColor: 'text-emerald-600',
    closeColor: 'text-emerald-600/60 hover:text-emerald-900 hover:bg-emerald-100',
    border: 'border-emerald-300/80',
    accentBar: 'bg-emerald-500',
  },
  warning: {
    badgeBg: 'bg-amber-100/80 text-amber-800 border-amber-200',
    text: 'text-amber-950',
    icon: AlertTriangle,
    iconColor: 'text-amber-600',
    closeColor: 'text-amber-600/60 hover:text-amber-900 hover:bg-amber-100',
    border: 'border-amber-300/80',
    accentBar: 'bg-amber-500',
  },
  error: {
    badgeBg: 'bg-rose-100/80 text-rose-800 border-rose-200',
    text: 'text-rose-950',
    icon: XCircle,
    iconColor: 'text-rose-600',
    closeColor: 'text-rose-600/60 hover:text-rose-900 hover:bg-rose-100',
    border: 'border-rose-300/80',
    accentBar: 'bg-rose-500',
  },
  info: {
    badgeBg: 'bg-sky-100/80 text-sky-800 border-sky-200',
    text: 'text-[#0a192f]',
    icon: Info,
    iconColor: 'text-[#0284c7]',
    closeColor: 'text-sky-600/60 hover:text-sky-900 hover:bg-sky-100',
    border: 'border-sky-300/80',
    accentBar: 'bg-[#0284c7]',
  },
};

export default function Alert({ type = 'info', message, onClose, show = true, floating = true }) {
  if (!message || !show) return null;

  const style = alertStyles[type] || alertStyles.info;
  const IconComponent = style.icon;

  const content = (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className={`
            relative flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl border ${style.border}
            bg-white/95 backdrop-blur-xl shadow-2xl shadow-[#0a192f]/15 text-slate-900 overflow-hidden
            ${floating ? 'w-full max-w-lg mx-auto' : 'w-full my-2'}
          `}
        >
          {/* Left vertical accent bar */}
          <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${style.accentBar}`} />

          {/* Icon Badge */}
          <div className={`p-2 rounded-xl ${style.badgeBg} border shrink-0`}>
            <IconComponent className={`w-5 h-5 ${style.iconColor}`} />
          </div>

          {/* High-Contrast Message */}
          <p className={`text-xs sm:text-sm font-bold flex-1 ${style.text} leading-snug tracking-tight`}>
            {message}
          </p>

          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className={`p-1.5 rounded-full ${style.closeColor} transition-colors cursor-pointer shrink-0 ml-1`}
              aria-label="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  // If floating is enabled and document.body exists, portal to top-center of viewport
  if (floating && typeof document !== 'undefined') {
    return createPortal(
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-lg px-4 pointer-events-none">
        <div className="pointer-events-auto">
          {content}
        </div>
      </div>,
      document.body
    );
  }

  return content;
}
