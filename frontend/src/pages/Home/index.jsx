import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Brain, Stethoscope, Utensils, Award, ArrowRight,
  TestTube2, Sparkles, ChevronDown, ChevronUp, Download, Smartphone,
  Activity, Check, ScanBarcode, Bot, Laptop, X
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PWAInstallPrompt from '../../components/common/PWAInstallPrompt';
import { useLanguage } from '../../context/LanguageContext';

export default function Home() {
  const { t } = useLanguage();
  const [openFaq, setOpenFaq] = useState(null);
  const [activeTab, setActiveTab] = useState('scanner');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState(['Fatigue', 'Dizziness']);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.deferredPWAInstallPrompt = e;
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      window.deferredPWAInstallPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallPWA = async () => {
    const promptEvent = deferredPrompt || window.deferredPWAInstallPrompt;
    if (promptEvent) {
      try {
        promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
        window.deferredPWAInstallPrompt = null;
      } catch (err) {
        setGuideModalOpen(true);
      }
    } else {
      setGuideModalOpen(true);
    }
  };

  const toggleSymptom = (sym) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const features = [
    {
      icon: Stethoscope,
      title: t('feat_deficiency_title', 'Deficiency Risk Engine'),
      desc: t('feat_deficiency_desc', 'Identify potential vitamin, mineral, and micronutrient gaps based on physical symptoms and dietary logs.'),
      color: 'cyan',
    },
    {
      icon: Brain,
      title: t('feat_ml_title', 'ML Clinical Predictor'),
      desc: t('feat_ml_desc', 'Random Forest and XGBoost models trained on clinical datasets to predict deficiency probabilities.'),
      color: 'purple',
    },
    {
      icon: Utensils,
      title: t('feat_meal_title', 'Smart Meal Planner'),
      desc: t('feat_meal_desc', '7-day rotating meal plans customized to your caloric goals, allergies, and deficiency correction targets.'),
      color: 'emerald',
    },
    {
      icon: TestTube2,
      title: t('feat_blood_title', 'Blood Lab OCR Analyzer'),
      desc: t('feat_blood_desc', 'Upload medical PDF blood lab reports to extract biomarkers, hemoglobin, ferritin, and Vitamin D levels.'),
      color: 'rose',
    },
    {
      icon: ScanBarcode,
      title: t('feat_scanner_title', 'Multi-Modal Food Scanner'),
      desc: t('feat_scanner_desc', 'Snap meal photos or scan barcodes to instantly estimate calories, macronutrients, and micronutrients.'),
      color: 'amber',
    },
    {
      icon: Bot,
      title: t('feat_coach_title', '24/7 Clinical AI Coach'),
      desc: t('feat_coach_desc', 'Interactive Gemini AI assistant offering instant personalized dietary advice, recipes, and wellness guidance.'),
      color: 'indigo',
    },
  ];

  const colorMap = {
    cyan: { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-[#0284c7]' },
    purple: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-600' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600' },
    rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-600' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600' },
    indigo: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600' },
  };

  const stats = [
    { value: '94.2%', label: t('stat_accuracy', '95% Accuracy'), desc: t('stat_accuracy_desc', 'Machine learning precision') },
    { value: '14+', label: t('stat_biomarkers', '50+ Nutrients'), desc: t('stat_biomarkers_desc', 'Comprehensive biomarker tracking') },
    { value: '58,000+', label: t('stat_foods', '58,000+ Foods'), desc: t('stat_foods_desc', 'Curated clinical food database') },
    { value: '7-Day', label: t('stat_plans', '7-Day Plans'), desc: t('stat_plans_desc', 'Weekly rotating personalized recipes') },
  ];

  const faqs = [
    { q: t('home_faq_q1'), a: t('home_faq_a1') },
    { q: t('home_faq_q2'), a: t('home_faq_a2') },
    { q: t('home_faq_q3'), a: t('home_faq_a3') },
    { q: t('home_faq_q4'), a: t('home_faq_a4') },
  ];

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } } };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200/80 via-sky-100/60 via-35% to-white text-[#0a192f] selection:bg-sky-500/20 selection:text-sky-800 flex flex-col overflow-x-hidden w-full relative">
      <Navbar />

      {/* 🌟 Atmospheric Sky-Cloud Hero Section */}
      <section className="relative pt-24 sm:pt-36 pb-20 sm:pb-32 px-4 sm:px-6 lg:px-8 flex-1 flex flex-col items-center justify-center min-h-[85vh] w-full overflow-hidden">
        {/* Soft Multi-Colour Cloud Ambient Light Spheres */}
        <div className="absolute top-0 right-1/4 w-[700px] h-[700px] bg-sky-300/30 rounded-full blur-[160px] pointer-events-none z-0" />
        <div className="absolute bottom-10 left-10 w-[600px] h-[600px] bg-indigo-200/30 rounded-full blur-[150px] pointer-events-none z-0" />
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-emerald-200/25 rounded-full blur-[140px] pointer-events-none z-0" />

        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          
          {/* Left Hero Text Column */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left flex-1 max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-sky-200 text-xs font-black text-[#0284c7] mb-6 tracking-wider uppercase shadow-xs"
            >
              <Shield className="w-4 h-4 text-[#0284c7] shrink-0" />
              <span>{t('hero_badge')}</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.08] text-[#0a192f]"
            >
              <span className="bg-gradient-to-r from-[#0a192f] via-[#0284c7] to-[#4338ca] bg-clip-text text-transparent">
                {t('hero_title_1')}
              </span>
              <br />
              <span className="mt-1 block text-[#0a192f] font-serif italic font-normal">{t('hero_title_2')}</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-xl text-slate-700 mb-8 sm:mb-10 leading-relaxed font-medium"
            >
              {t('hero_subtitle')}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 w-full"
            >
              <Link to="/register" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-8 py-4 text-sm sm:text-base font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-700 hover:to-sky-700 rounded-2xl shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer border-0"
                >
                  <span>{t('start_assessment')}</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
              </Link>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleInstallPWA}
                className="w-full sm:w-auto px-8 py-4 text-sm sm:text-base font-bold text-[#0a192f] bg-white/90 hover:bg-white border border-slate-200 rounded-2xl shadow-md flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5 text-[#0284c7] animate-bounce" />
                <span>{isInstalled ? t('home_pwa_app_installed') : t('home_pwa_download')}</span>
              </motion.button>
            </motion.div>
          </div>

          {/* Right Floating Product Telemetry Mockup Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex-1 w-full relative"
          >
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-sky-200/90 shadow-[0_20px_50px_rgba(2,132,199,0.15)] relative overflow-hidden bg-white/95">
              <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0a192f] flex items-center justify-center text-white font-bold shadow-md">
                    <Activity className="w-5 h-5 text-sky-400" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-[#0a192f] leading-tight">{t('home_mockup_title')}</h4>
                    <p className="text-xs text-[#0284c7] font-bold">{t('home_mockup_subtitle')}</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-black text-emerald-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> {t('home_mockup_badge')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-1">
                  <p className="text-xs text-slate-500 font-bold uppercase">{t('home_mockup_nutrition_score')}</p>
                  <p className="text-3xl font-black text-[#0a192f]">88<span className="text-sm font-medium text-slate-500">/100</span></p>
                  <span className="text-[11px] font-black text-emerald-600">{t('home_mockup_optimization')}</span>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-1">
                  <p className="text-xs text-slate-500 font-bold uppercase">{t('home_mockup_deficiency_risk')}</p>
                  <p className="text-3xl font-black text-amber-600">{t('home_mockup_mild')}</p>
                  <span className="text-[11px] font-black text-amber-600">{t('home_mockup_tracked')}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                  <div className="flex items-center gap-2.5">
                    <TestTube2 className="w-4 h-4 text-rose-500" />
                    <span className="font-extrabold text-slate-800">{t('home_mockup_item1_label')}</span>
                  </div>
                  <span className="font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">{t('home_mockup_item1_status')}</span>
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Utensils className="w-4 h-4 text-emerald-500" />
                    <span className="font-extrabold text-slate-800">{t('home_mockup_item2_label')}</span>
                  </div>
                  <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">{t('home_mockup_item2_status')}</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Floating Stats Bar Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="w-full max-w-6xl mt-12 sm:mt-16 bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 shadow-xl relative overflow-hidden border border-slate-200/80"
        >
          {stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center text-center p-2">
              <span className="text-3xl sm:text-5xl font-black text-[#0a192f] mb-1">
                {stat.value}
              </span>
              <span className="text-xs sm:text-sm font-black text-[#0284c7] mb-0.5">{stat.label}</span>
              <span className="text-[11px] text-slate-600 font-semibold hidden sm:block">{stat.desc}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ⚡ Interactive Instant Risk Assessment Micro-Calculator */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-6 sm:p-10 rounded-3xl border border-sky-200 shadow-xl relative overflow-hidden bg-white/95">
            <div className="text-center mb-8">
              <span className="text-xs font-black text-[#0284c7] uppercase tracking-widest bg-sky-50 px-3 py-1 rounded-full border border-sky-200 mb-3 inline-block">
                {t('home_calc_badge')}
              </span>
              <h3 className="text-2xl sm:text-4xl font-black text-[#0a192f]">{t('home_calc_title')}</h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">{t('home_calc_subtitle')}</p>
            </div>

            <div className="flex flex-wrap justify-center gap-2.5 mb-8">
              {[
                { id: 'Fatigue', label: t('home_calc_symptom_fatigue') },
                { id: 'Dizziness', label: t('home_calc_symptom_dizziness') },
                { id: 'Muscle Weakness', label: t('home_calc_symptom_muscle') },
                { id: 'Brittle Nails', label: t('home_calc_symptom_nails') },
                { id: 'Cold Hands', label: t('home_calc_symptom_cold') },
                { id: 'Hair Thinning', label: t('home_calc_symptom_hair') },
                { id: 'Frequent Cramps', label: t('home_calc_symptom_cramps') },
              ].map((symObj) => {
                const selected = selectedSymptoms.includes(symObj.id);
                return (
                  <button
                    key={symObj.id}
                    onClick={() => toggleSymptom(symObj.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selected
                        ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 text-white shadow-md shadow-purple-500/20'
                        : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {selected ? '✓ ' : '+ '} {symObj.label}
                  </button>
                );
              })}
            </div>

            <div className="p-5 rounded-2xl bg-sky-50/70 border border-sky-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('home_calc_result_header')}</span>
                <p className="text-lg sm:text-xl font-black text-[#0a192f] mt-0.5">
                  {selectedSymptoms.length > 2 ? t('home_calc_risk_high') : t('home_calc_risk_low')}
                </p>
              </div>
              <Link to="/register">
                <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-700 hover:to-sky-700 text-white text-xs font-bold shadow-md shadow-purple-500/25 hover:scale-105 transition-all border-0 cursor-pointer">
                  {t('home_calc_btn')}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 🛠️ Features Grid */}
      <section id="features" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 sm:mb-24"
          >
            <span className="text-xs font-black text-[#0284c7] uppercase tracking-widest bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-200 mb-4 inline-block">
              {t('home_features_badge')}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#0a192f] mb-4 sm:mb-6">
              {t('features_title')}
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed font-medium">
              {t('features_subtitle')}
            </p>
          </motion.div>

          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {features.map((feature, idx) => {
              const colors = colorMap[feature.color];
              return (
                <motion.div
                  key={idx}
                  variants={item}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="glass-card p-7 sm:p-9 rounded-3xl relative overflow-hidden group border border-slate-200/80 hover:border-sky-300 transition-all duration-300 flex flex-col justify-between bg-white/95 shadow-sm"
                >
                  <div>
                    <div className={`w-14 h-14 rounded-2xl ${colors.bg} border ${colors.border} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className={`w-7 h-7 ${colors.text}`} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-[#0a192f] mb-3">{feature.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">{feature.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ❓ Interactive FAQ Accordion */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3.5 py-1.5 rounded-full border border-indigo-200 mb-4 inline-block">
              {t('home_faq_badge')}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#0a192f] mb-4">{t('home_faq_title')}</h2>
            <p className="text-slate-600 text-xs sm:text-base font-medium">{t('home_faq_subtitle')}</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="glass-card rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs transition-all">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <span className="text-sm sm:text-base font-black text-[#0a192f] pr-4">{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-5 h-5 text-[#0284c7] shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium border-t border-slate-100 pt-4"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 📲 PWA App Download Banner */}
      <section className="py-16 sm:py-28 px-4 sm:px-6 lg:px-8 relative mb-12">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-8 sm:p-16 text-center relative overflow-hidden rounded-3xl border border-slate-200/80 shadow-xl bg-white/95"
          >
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-sky-50 border border-sky-200 flex items-center justify-center mb-6 sm:mb-8 text-[#0284c7] shadow-md">
                <Smartphone className="w-8 h-8 sm:w-10 sm:h-10 animate-bounce" />
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-[#0a192f] mb-4 sm:mb-6">
                {t('home_pwa_banner_title')}
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto mb-8 sm:mb-10 text-xs sm:text-base leading-relaxed font-medium">
                {t('home_pwa_banner_subtitle')}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleInstallPWA}
                  className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 text-sm sm:text-lg font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-700 hover:to-sky-700 rounded-2xl flex items-center justify-center gap-3 cursor-pointer shadow-lg shadow-purple-500/30 border-0"
                >
                  <Download className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  <span>{isInstalled ? t('home_pwa_app_installed') : t('home_pwa_download')}</span>
                </motion.button>

                <Link to="/register" className="w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 text-sm sm:text-lg font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-2xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{t('start_assessment')}</span>
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
      <PWAInstallPrompt />

      {/* PWA Installation Guide Modal */}
      <AnimatePresence>
        {guideModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 relative overflow-hidden text-[#0a192f]"
            >
              <button
                onClick={() => setGuideModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/25 shrink-0">
                  <Download className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#0a192f]">{t('pwa_guide_title')}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{t('pwa_guide_subtitle')}</p>
                </div>
              </div>

              <div className="space-y-3.5 mb-8">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
                  <Laptop className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-black text-[#0a192f] block mb-1">Desktop Chrome / Edge / Brave</span>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {t('pwa_guide_desktop')}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
                  <Smartphone className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-black text-[#0a192f] block mb-1">Android (Chrome / Samsung)</span>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {t('pwa_guide_android')}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
                  <Smartphone className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-black text-[#0a192f] block mb-1">iPhone / iPad (Safari)</span>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {t('pwa_guide_ios')}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setGuideModalOpen(false)}
                className="w-full py-4 text-sm font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-700 hover:to-sky-700 rounded-2xl transition-all cursor-pointer shadow-lg shadow-purple-500/25 border-0"
              >
                {t('pwa_guide_close')}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
