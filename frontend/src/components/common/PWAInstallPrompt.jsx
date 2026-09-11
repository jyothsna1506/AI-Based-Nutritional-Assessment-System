import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Utensils, WifiOff, CheckCircle2 } from 'lucide-react';
import { useNetworkStatus } from '../../utils/offlineStorage';
import { useLanguage } from '../../context/LanguageContext';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [installed, setInstalled] = useState(false);
  const isOnline = useNetworkStatus();
  const { t } = useLanguage();

  useEffect(() => {
    // Check if app is already running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.deferredPWAInstallPrompt = e;
      // Check if user previously dismissed the prompt
      const dismissed = localStorage.getItem('nutriai_pwa_dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      window.deferredPWAInstallPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('nutriai_pwa_dismissed', 'true');
  };

  return (
    <>
      {/* Offline Status Banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-amber-600 via-rose-600 to-amber-600 text-white text-xs font-semibold py-2 px-4 flex items-center justify-center gap-2 shadow-xl border-b border-amber-400/30"
          >
            <WifiOff className="w-4 h-4 text-amber-200 animate-pulse" />
            <span>{t('pwa_offline_msg')}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating PWA Install Prompt Banner */}
      <AnimatePresence>
        {showPrompt && !installed && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[90] max-w-sm w-[calc(100vw-2rem)] glass-strong rounded-2xl p-4 sm:p-5 shadow-2xl border border-cyan-500/30"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20">
                  <Utensils className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">{t('pwa_install_title')}</h4>
                  <p className="text-xs text-gray-400 mt-0.5 leading-snug">
                    {t('pwa_install_desc')}
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Dismiss app install prompt"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={handleInstallClick}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-white gradient-bg shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all"
              >
                <Download className="w-4 h-4" />
                {t('pwa_install_btn')}
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                {t('pwa_not_now')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
