import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  Activity, Sparkles, ArrowRight, ChevronDown, ChevronUp,
  Stethoscope, TestTube2, Utensils, Info, Clock, Bot,
  ShieldCheck, Cpu, AlertTriangle, X
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import assessmentService from '../../services/assessmentService';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

function CircularProgress({ percentage, size = 110, strokeWidth = 7, getRiskInfo, t }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const risk = getRiskInfo(percentage);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={risk.color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-black text-[#0a192f]">{Math.round(percentage)}%</span>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('prediction_risk_label')}</span>
      </div>
    </div>
  );
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1 } };

export default function Prediction() {
  const { t } = useLanguage();

  const deficiencyNames = {
    'Iron_Anemia_Deficiency': t('prediction_def_iron'),
    'Vitamin_D_Deficiency': t('prediction_def_vitamin_d'),
    'Vitamin_B12_Deficiency': t('prediction_def_vitamin_b12'),
    'Calcium_Deficiency': t('prediction_def_calcium'),
    'Magnesium_Deficiency': t('prediction_def_magnesium'),
    'Zinc_Deficiency': t('prediction_def_zinc'),
    'Potassium_Deficiency': t('prediction_def_potassium'),
  };

  function formatDeficiency(key) {
    if (deficiencyNames[key]) return deficiencyNames[key];
    return key.replace(/_/g, ' ').replace(/Deficiency/gi, '').trim();
  }

  function getRiskInfo(pct) {
    if (pct > 60) return { label: t('prediction_high_risk'), color: '#f43f5e', bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', bar: 'bg-rose-500' };
    if (pct > 30) return { label: t('prediction_moderate_risk'), color: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', bar: 'bg-amber-400' };
    return { label: t('prediction_low_risk'), color: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', bar: 'bg-emerald-400' };
  }

  const [results, setResults] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [aiSummary, setAiSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const preds = await assessmentService.getPredictions();
        if (preds && preds.length > 0) {
          setPredictions(preds);
          setResults(preds[0]);
        }
      } catch (err) {
        // No predictions yet
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const runAssessment = async () => {
    setPredicting(true);
    setScanStep(1);
    setAiSummary(null);
    setAlert({ show: false, type: 'info', message: '' });

    const stepInterval = setInterval(() => {
      setScanStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 600);

    try {
      const data = await assessmentService.predict();
      clearInterval(stepInterval);
      setResults(data);
      setPredictions((prev) => [data, ...prev]);
      setAlert({ show: true, type: 'success', message: t('prediction_alert_success') });
    } catch (err) {
      clearInterval(stepInterval);
      setAlert({
        show: true,
        type: 'error',
        message: err.response?.data?.detail || t('prediction_alert_error'),
      });
    } finally {
      setPredicting(false);
      setScanStep(0);
    }
  };

  const generateAiClinicalSummary = async () => {
    if (!results?.id) return;
    setSummaryLoading(true);
    try {
      const { data } = await api.post('/ai/clinical-summary', {
        prediction_id: results.id,
      });
      setAiSummary(data.summary);
    } catch (err) {
      setAlert({ show: true, type: 'error', message: t('prediction_alert_summary_error') });
    } finally {
      setSummaryLoading(false);
    }
  };

  let deficiencies = {};
  if (results) {
    if (results.results) {
      deficiencies = results.results;
    } else if (results.predictions) {
      deficiencies = results.predictions;
    } else {
      deficiencies = {
        Iron_Anemia_Deficiency: results.iron_risk,
        Vitamin_D_Deficiency: results.vitamin_d_risk,
        Calcium_Deficiency: results.calcium_risk,
        Magnesium_Deficiency: results.magnesium_risk,
        Potassium_Deficiency: results.potassium_risk,
        Vitamin_B12_Deficiency: results.vitamin_b12_risk,
      };
      Object.keys(deficiencies).forEach((key) => {
        if (deficiencies[key] === undefined || deficiencies[key] === null) {
          delete deficiencies[key];
        }
      });
    }
  }

  const confidence = results?.confidence || results?.confidence_score || 0.88;
  const hasHighRisk = Object.values(deficiencies).some(
    (v) => (typeof v === 'number' ? v : v?.risk || 0) > 0.6
  );

  if (loading)
    return (
      <DashboardLayout title={t('prediction_title')}>
        <Loader size="lg" text={t('prediction_loader')} />
      </DashboardLayout>
    );

  return (
    <DashboardLayout title={t('prediction_title')} subtitle={t('prediction_subtitle')}>
      {alert.show && <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />}

      <div className="flex flex-col gap-6 sm:gap-8 max-w-7xl mx-auto w-full overflow-x-hidden pb-12 text-[#0a192f]">

        {/* 🌟 Hero Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-card p-6 sm:p-8 lg:p-10 relative overflow-hidden rounded-3xl bg-white/95 border border-sky-200/90 shadow-md"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-sky-200/40 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/50 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 mb-3 sm:mb-4 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-xs font-black text-[#0284c7]">
                <Cpu className="w-3.5 h-3.5" />
                {t('prediction_hero_badge')}
              </div>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#0a192f] tracking-tight mb-3">
                {t('prediction_hero_title1')} <span className="bg-gradient-to-r from-[#0284c7] via-indigo-600 to-emerald-600 bg-clip-text text-transparent">{t('prediction_hero_title2')}</span>
              </h2>
              <p className="text-slate-600 text-xs sm:text-base font-semibold leading-relaxed">
                {t('prediction_hero_subtitle')}
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
              <Button onClick={runAssessment} loading={predicting} icon={Sparkles} size="lg" className="w-full sm:w-auto">
                {predicting ? t('prediction_btn_running') : t('prediction_btn_run')}
              </Button>
              <div className="flex gap-2 w-full sm:w-auto">
                <Link to="/symptoms" className="flex-1 sm:flex-none">
                  <Button variant="secondary" icon={Stethoscope} size="sm" className="w-full bg-white border border-slate-200 text-slate-800 font-bold hover:bg-slate-50">
                    {t('prediction_btn_symptoms')}
                  </Button>
                </Link>
                <Link to="/blood-report" className="flex-1 sm:flex-none">
                  <Button variant="secondary" icon={TestTube2} size="sm" className="w-full bg-white border border-slate-200 text-slate-800 font-bold hover:bg-slate-50">
                    {t('prediction_btn_blood')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ℹ️ Data Status Guidance Banner */}
        <div className="glass-card p-4 sm:p-5 rounded-2xl flex items-start gap-3.5 border border-sky-200 bg-sky-50/50 shadow-xs">
          <div className="p-2 rounded-xl bg-sky-100 text-[#0284c7] shrink-0 mt-0.5">
            <Info className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
            <span className="font-bold text-[#0a192f]">{t('prediction_tip_title')}</span> {t('prediction_tip_part1')}<Link to="/symptoms" className="text-[#0284c7] underline font-bold">{t('prediction_tip_link_symptoms')}</Link>{t('prediction_tip_and')}<Link to="/blood-report" className="text-[#0284c7] underline font-bold">{t('prediction_tip_link_blood')}</Link>{t('prediction_tip_part2')}
          </div>
        </div>

        {/* ⚡ Animated Neural Scan Sequence */}
        {predicting && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-10 sm:p-14 text-center rounded-3xl relative overflow-hidden bg-white border border-sky-200 shadow-md"
          >
            <div className="relative z-10 flex flex-col items-center max-w-md mx-auto">
              <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border-4 border-sky-200 border-t-[#0284c7] border-r-indigo-600"
                />
                <Cpu className="w-10 h-10 text-[#0284c7] animate-pulse" />
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-[#0a192f] mb-2">{t('prediction_scan_title')}</h3>
              
              <div className="space-y-2 mt-4 text-xs sm:text-sm text-slate-600 font-semibold">
                <p className={`transition-all ${scanStep >= 1 ? 'text-[#0284c7] font-black' : 'text-slate-400'}`}>
                  {scanStep >= 1 ? '✓' : '○'} {t('prediction_scan_step1')}
                </p>
                <p className={`transition-all ${scanStep >= 2 ? 'text-indigo-600 font-black' : 'text-slate-400'}`}>
                  {scanStep >= 2 ? '✓' : '○'} {t('prediction_scan_step2')}
                </p>
                <p className={`transition-all ${scanStep >= 3 ? 'text-emerald-600 font-black' : 'text-slate-400'}`}>
                  {scanStep >= 3 ? '✓' : '○'} {t('prediction_scan_step3')}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 📊 Assessment Results & Deficiency Breakdown */}
        {!predicting && Object.keys(deficiencies).length > 0 && (
          <div className="flex flex-col gap-6 sm:gap-8">

            {/* Confidence Score Bar & AI Clinical Report Action */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-slate-200 bg-white shadow-xs"
            >
              <div className="flex-1 w-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#0284c7]" />
                    {t('prediction_confidence_label')}
                  </span>
                  <span className="text-base sm:text-lg font-black text-[#0a192f]">{Math.round(confidence * (confidence <= 1 ? 100 : 1))}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${confidence * (confidence <= 1 ? 100 : 1)}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-[#0284c7] to-indigo-600"
                  />
                </div>
              </div>

              <Button
                onClick={generateAiClinicalSummary}
                loading={summaryLoading}
                icon={Bot}
                size="md"
                variant="secondary"
                className="w-full sm:w-auto whitespace-nowrap bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold hover:bg-indigo-100 shadow-xs"
              >
                {t('prediction_generate_summary')}
              </Button>
            </motion.div>

            {/* 🤖 Gemini AI Clinical Summary Output */}
            {aiSummary && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 sm:p-8 rounded-3xl border border-purple-200 bg-purple-50/50 shadow-md relative"
              >
                <div className="flex items-center justify-between gap-4 mb-5 pb-4 border-b border-purple-200/60">
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-500/20 shrink-0">
                      <Bot className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-[#0a192f] leading-tight">{t('prediction_ai_summary_title')}</h3>
                      <p className="text-xs text-purple-700 font-bold">{t('prediction_ai_summary_subtitle')}</p>
                    </div>
                  </div>

                  {/* ✕ Close Button */}
                  <button
                    onClick={() => setAiSummary(null)}
                    className="p-2 sm:p-2.5 rounded-full bg-white hover:bg-slate-100 border border-purple-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0"
                    title="Close Summary"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                <div className="bg-white p-5 sm:p-7 rounded-2xl border border-purple-100/80 shadow-xs text-xs sm:text-sm text-slate-800 leading-relaxed">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-3.5 leading-relaxed font-semibold text-slate-700">{children}</p>,
                      h1: ({ children }) => <h3 className="text-base sm:text-lg font-black text-[#0a192f] mt-4 mb-2 pb-1 border-b border-slate-100">{children}</h3>,
                      h2: ({ children }) => <h3 className="text-base sm:text-lg font-black text-[#0a192f] mt-4 mb-2 pb-1 border-b border-slate-100">{children}</h3>,
                      h3: ({ children }) => <h4 className="text-sm sm:text-base font-black text-[#0a192f] mt-3 mb-1.5 flex items-center gap-2"><span className="w-1.5 h-4 rounded-full bg-purple-600 inline-block"></span>{children}</h4>,
                      ul: ({ children }) => <ul className="list-disc pl-5 mb-3.5 space-y-1.5 font-semibold text-slate-700">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-5 mb-3.5 space-y-1.5 font-semibold text-slate-700">{children}</ol>,
                      li: ({ children }) => <li className="pl-1">{children}</li>,
                      strong: ({ children }) => <strong className="font-black text-purple-900 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200/60">{children}</strong>,
                    }}
                  >
                    {aiSummary}
                  </ReactMarkdown>
                </div>
              </motion.div>
            )}

            {/* 🎯 Micronutrient Deficiency Grid */}
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
            >
              {Object.entries(deficiencies).map(([key, value]) => {
                const pct = typeof value === 'number' ? value * (value <= 1 ? 100 : 1) : value?.risk || 0;
                const risk = getRiskInfo(pct);
                return (
                  <motion.div
                    key={key}
                    variants={item}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className={`glass-card p-6 rounded-3xl text-center bg-white border ${risk.border} transition-all shadow-xs flex flex-col items-center justify-between`}
                  >
                    <div className="my-2">
                      <CircularProgress percentage={pct} getRiskInfo={getRiskInfo} t={t} />
                    </div>
                    <div className="mt-2 w-full">
                      <h4 className="text-base font-black text-[#0a192f] mb-2 leading-tight">{formatDeficiency(key)}</h4>
                      <span className={`inline-block text-xs px-3 py-1 rounded-full font-black ${risk.bg} ${risk.text} border ${risk.border}`}>
                        {risk.label}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* 🥗 High-Risk Meal Plan CTA */}
            {hasHighRisk && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 sm:p-8 rounded-3xl bg-white border border-rose-200 shadow-md relative overflow-hidden"
              >
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs font-black text-rose-600">
                      <AlertTriangle className="w-3.5 h-3.5" /> {t('prediction_cta_badge')}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-[#0a192f] tracking-tight">{t('prediction_cta_title')}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl font-semibold leading-relaxed">
                      {t('prediction_cta_desc')}
                    </p>
                  </div>
                  <Link to="/meal-plan" className="w-full md:w-auto">
                    <Button icon={Utensils} size="lg" className="w-full md:w-auto">
                      {t('prediction_cta_btn')}
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}

          </div>
        )}

        {/* 📜 Assessment History Drawer */}
        {predictions.length > 1 && (
          <div className="glass-card rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-xs">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-[#0a192f]">{t('prediction_history_title')} ({predictions.length})</h4>
                  <p className="text-xs text-slate-500 font-semibold">{t('prediction_history_subtitle')}</p>
                </div>
              </div>
              {showHistory ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
            </button>
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-slate-100"
                >
                  <div className="p-4 space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar">
                    {predictions.map((pred, idx) => (
                      <div
                        key={idx}
                        onClick={() => setResults(pred)}
                        className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${
                          results === pred ? 'bg-sky-50 border border-sky-200 shadow-xs' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Activity className="w-4 h-4 text-[#0284c7]" />
                          <span className="text-sm font-black text-[#0a192f]">{t('prediction_history_session')}#{predictions.length - idx}</span>
                        </div>
                        <span className="text-xs text-slate-500 font-semibold">
                          {pred.prediction_date ? new Date(pred.prediction_date).toLocaleString() : `${t('prediction_history_result')}#${idx + 1}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
