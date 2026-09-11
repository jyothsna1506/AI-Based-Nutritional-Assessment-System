import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity, AlertTriangle, Flame, Droplets, Utensils,
  Stethoscope, Plus, ArrowRight, Sparkles, ChevronRight,
  Zap, ScanBarcode, Bot, TestTube2, Headphones, ShieldCheck,
  TrendingUp, Award, HeartPulse, PieChart, RotateCcw, Info, X
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { SkeletonCard } from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import { useAuth } from '../../context/AuthContext';
import dashboardService from '../../services/dashboardService';
import { saveOfflineDashboard, getOfflineDashboard } from '../../utils/offlineStorage';
import { useLanguage } from '../../context/LanguageContext';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } } };

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [waterAmount, setWaterAmount] = useState(0.0);
  const [addingWater, setAddingWater] = useState(false);
  const [scoreInfoModalOpen, setScoreInfoModalOpen] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardService.getDashboard();
        setData(res);
        if (res?.water_intake !== undefined) setWaterAmount(res.water_intake);
        saveOfflineDashboard(res);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        const cached = getOfflineDashboard();
        if (cached) {
          setData(cached);
          if (cached.water_intake !== undefined) setWaterAmount(cached.water_intake);
        } else {
          setData({
            nutrition_score: 85,
            deficiency_count: 1,
            daily_calories: 1450,
            daily_calorie_target: 2150,
            water_intake: 0.0,
            water_target: 3.0,
            recent_predictions: [],
            nutrient_summary: { calories_today: 1450, protein_today: 68, carbs_today: 175, fat_today: 48 }
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleAddWater = async () => {
    setAddingWater(true);
    try {
      const res = await dashboardService.logWaterIntake(250);
      if (res?.water_intake !== undefined) {
        setWaterAmount(res.water_intake);
      } else {
        setWaterAmount((prev) => parseFloat((prev + 0.25).toFixed(2)));
      }
    } catch (err) {
      setWaterAmount((prev) => parseFloat((prev + 0.25).toFixed(2)));
    } finally {
      setTimeout(() => setAddingWater(false), 300);
    }
  };

  const handleResetWater = async () => {
    setAddingWater(true);
    try {
      const res = await dashboardService.resetWaterIntake();
      if (res?.water_intake !== undefined) {
        setWaterAmount(res.water_intake);
      } else {
        setWaterAmount(0.0);
      }
    } catch (err) {
      setWaterAmount(0.0);
    } finally {
      setTimeout(() => setAddingWater(false), 300);
    }
  };

  const userName = user?.full_name || user?.name || user?.email?.split('@')[0] || 'User';

  // Calculations & Fallbacks
  const currentCalories = Math.round(data?.daily_calories || data?.nutrient_summary?.calories_today || 0);
  const targetCalories = Math.round(data?.daily_calorie_target || 2000);
  const caloriePercent = Math.min(100, Math.round((currentCalories / targetCalories) * 100));

  const waterTarget = data?.water_target || 3.0;
  const waterPercent = Math.min(100, Math.round((waterAmount / waterTarget) * 100));

  const deficiencyCount = data?.deficiency_count ?? 0;
  const riskLevelText = data?.risk_level || (deficiencyCount > 0 ? t('dashboard_mild_risk') : 'Optimal');
  const nutritionScoreVal = Math.round(data?.nutrition_score || 85);
  const nutritionScoreTrend = data?.nutrition_score_trend || (nutritionScoreVal >= 80 ? '+5% Optimal' : nutritionScoreVal >= 60 ? 'Moderate' : 'Needs Focus');

  const proteinToday = Math.round(data?.nutrient_summary?.protein_today || 0);
  const carbsToday = Math.round(data?.nutrient_summary?.carbs_today || 0);
  const fatToday = Math.round(data?.nutrient_summary?.fat_today || 0);

  const shortcutLinks = [
    { label: t('dashboard_qa_blood_label'), icon: TestTube2, path: '/blood-report', color: 'from-purple-600 to-pink-600' },
    { label: t('dashboard_qa_symptoms_label'), icon: Stethoscope, path: '/symptoms', color: 'from-amber-500 to-orange-600' },
    { label: t('dashboard_qa_scan_label'), icon: ScanBarcode, path: '/food-scanner', color: 'from-emerald-600 to-teal-600' },
    { label: t('dashboard_qa_coach_label'), icon: Bot, path: '/ai-coach', color: 'from-sky-600 to-blue-700' },
  ];

  return (
    <DashboardLayout title={t('dashboard_title')} subtitle={t('dashboard_subtitle')}>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div className="flex flex-col gap-6 sm:gap-8 max-w-7xl mx-auto w-full overflow-x-hidden pb-12 text-[#0a192f]">
        
        {/* 🌟 Ultra-Modern Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-card p-6 sm:p-8 lg:p-10 relative overflow-hidden shadow-xl rounded-3xl bg-gradient-to-br from-white via-slate-50/80 to-sky-50/40 border border-slate-200/90"
        >
          {/* Ambient Soft Sky & Indigo Glow Orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-sky-200/40 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/50 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200/80 text-xs font-black text-[#0284c7] shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#0284c7]" />
                  {t('dashboard_good') + ' '}{new Date().getHours() < 12 ? t('dashboard_morning') : new Date().getHours() < 18 ? t('dashboard_afternoon') : t('dashboard_evening')}
                </span>
                <span className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-xs font-black text-emerald-700 shadow-xs">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  {t('dashboard_health_streak')}
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#0a192f] tracking-tight mb-3 break-words">
                {t('dashboard_welcome_back') + ' '}<span className="bg-gradient-to-r from-[#0284c7] via-indigo-600 to-emerald-600 bg-clip-text text-transparent break-all sm:break-normal">{userName}</span>!
              </h2>

              <p className="text-slate-600 text-xs sm:text-base max-w-xl font-semibold leading-relaxed">
                {t('dashboard_metabolic_prefix') + ' '}<span className="text-[#0284c7] font-black">{t('dashboard_metabolic_highlight')}</span>{' ' + t('dashboard_metabolic_suffix')}
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
              <Link
                to="/prediction"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-700 hover:to-sky-700 shadow-md shadow-purple-500/25 transition-all cursor-pointer border-0 active:scale-95"
              >
                <Activity className="w-4 h-4 text-white" />
                {t('dashboard_btn_run_ai')}
              </Link>
              <Link
                to="/meal-plan"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200/90 transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <Utensils className="w-4 h-4 text-emerald-600" />
                {t('dashboard_btn_meal_plan')}
              </Link>
            </div>
          </div>
        </motion.div>

        {/* 📊 Interactive Metric Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {/* Card 1: Nutrition Score */}
            <motion.div variants={item} className="glass-card p-5 sm:p-6 rounded-3xl relative overflow-hidden group border border-slate-200/90 bg-white/95 hover:border-sky-300 transition-all shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0284c7] shrink-0 shadow-xs">
                    <Activity className="w-5 h-5" />
                  </div>
                  <button
                    onClick={() => setScoreInfoModalOpen(true)}
                    className="w-7 h-7 rounded-full bg-slate-100 hover:bg-sky-100 text-slate-500 hover:text-[#0284c7] border border-slate-200/80 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
                    title="How to increase Nutrition Score"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
                <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${
                  nutritionScoreVal >= 80 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                  nutritionScoreVal >= 60 ? 'text-[#0284c7] bg-sky-50 border-sky-200' :
                  'text-amber-700 bg-amber-50 border-amber-200'
                }`}>
                  {nutritionScoreTrend}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{t('dashboard_nutrition_score_label')}</p>
                  <p className="text-3xl sm:text-4xl font-black text-[#0a192f]">{nutritionScoreVal}<span className="text-sm font-bold text-slate-400">/100</span></p>
                </div>
                <div className="w-12 h-12 relative flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-100" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className={nutritionScoreVal >= 80 ? 'text-emerald-500' : nutritionScoreVal >= 60 ? 'text-[#0284c7]' : 'text-amber-500'} strokeDasharray={`${nutritionScoreVal}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                </div>
              </div>
            </motion.div>

            {/* Card 2: Deficiency Risks */}
            <motion.div variants={item} className="glass-card p-5 sm:p-6 rounded-3xl relative overflow-hidden group border border-slate-200/90 bg-white/95 hover:border-amber-300 transition-all shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0 shadow-xs">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <span className="text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                  {riskLevelText}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{t('dashboard_deficiency_risks_label')}</p>
                <p className="text-3xl sm:text-4xl font-black text-[#0a192f]">{deficiencyCount} <span className="text-xs font-bold text-slate-400">{t('dashboard_nutrients_tracked')}</span></p>
                <div className="mt-3 flex items-center gap-1.5">
                  <div className="h-1.5 flex-1 bg-amber-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(10, deficiencyCount * 25))}%` }} />
                  </div>
                  <span className="text-[10px] font-black text-amber-600">{riskLevelText}</span>
                </div>
              </div>
            </motion.div>

            {/* Card 3: Daily Calories Meter */}
            <motion.div variants={item} className="glass-card p-5 sm:p-6 rounded-3xl relative overflow-hidden group border border-slate-200/90 bg-white/95 hover:border-emerald-300 transition-all shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 shadow-xs">
                  <Flame className="w-5 h-5" />
                </div>
                <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  {t('dashboard_target_label')} {targetCalories.toLocaleString()}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{t('dashboard_daily_calories_label')}</p>
                <p className="text-3xl sm:text-4xl font-black text-[#0a192f]">{currentCalories.toLocaleString()} <span className="text-xs font-bold text-slate-400">kcal</span></p>
                <div className="mt-3 flex items-center gap-1.5">
                  <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${caloriePercent}%` }} />
                  </div>
                  <span className="text-[10px] font-black text-emerald-600">{caloriePercent}%</span>
                </div>
              </div>
            </motion.div>

            {/* Card 4: Interactive Hydration Tracker */}
            <motion.div variants={item} className="glass-card p-5 sm:p-6 rounded-3xl relative overflow-hidden group border border-slate-200/90 bg-white/95 hover:border-purple-300 transition-all shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0 shadow-xs">
                  <Droplets className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleResetWater}
                    disabled={addingWater}
                    className="p-1.5 rounded-full text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                    title={t('dashboard_reset_water_title') || 'Reset Water Intake to 0.0L'}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleAddWater}
                    disabled={addingWater}
                    className="text-xs font-black text-purple-600 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-full border border-purple-100 flex items-center gap-1 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                    title={t('dashboard_add_water')}
                  >
                    <Plus className="w-3 h-3" /> 250ml
                  </button>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{t('dashboard_water_label')}</p>
                <p className="text-3xl sm:text-4xl font-black text-[#0a192f]">{waterAmount}L <span className="text-xs font-bold text-slate-400">/ {waterTarget}L {t('dashboard_target_water_label')}</span></p>
                <div className="mt-3 flex items-center gap-1.5">
                  <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${waterPercent}%` }} />
                  </div>
                  <span className="text-[10px] font-black text-purple-600">{waterPercent}%</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* 🥗 Macro-Nutrients Progress & AI Clinical Insights Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Macro Breakdown (2 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="glass-card p-6 sm:p-8 rounded-3xl bg-white/95 border border-slate-200/90 shadow-md lg:col-span-2 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600">
                  <PieChart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-[#0a192f] tracking-tight">{t('dashboard_macros_summary_title')}</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">{t('dashboard_macros_summary_subtitle')}</p>
                </div>
              </div>
              <Link to="/food-diary" className="text-xs sm:text-sm font-extrabold text-[#0284c7] hover:text-sky-800 transition-colors flex items-center gap-1">
                {t('dashboard_btn_log_food')} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {/* Protein */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-emerald-800 uppercase tracking-wider">{t('common_protein')}</span>
                  <span className="text-xs font-bold text-emerald-700">{proteinToday}g / 110g</span>
                </div>
                <div className="h-2 w-full bg-emerald-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, Math.round((proteinToday / 110) * 100))}%` }} />
                </div>
                <p className="text-[11px] text-emerald-600 font-semibold mt-2">{t('dashboard_protein_subtext')}</p>
              </div>

              {/* Carbs */}
              <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-[#0284c7] uppercase tracking-wider">{t('common_carbs')}</span>
                  <span className="text-xs font-bold text-sky-700">{carbsToday}g / 240g</span>
                </div>
                <div className="h-2 w-full bg-sky-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#0284c7] rounded-full" style={{ width: `${Math.min(100, Math.round((carbsToday / 240) * 100))}%` }} />
                </div>
                <p className="text-[11px] text-sky-600 font-semibold mt-2">{t('dashboard_carbs_subtext')}</p>
              </div>

              {/* Fats */}
              <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-purple-800 uppercase tracking-wider">{t('common_fat')}</span>
                  <span className="text-xs font-bold text-purple-700">{fatToday}g / 65g</span>
                </div>
                <div className="h-2 w-full bg-purple-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(100, Math.round((fatToday / 65) * 100))}%` }} />
                </div>
                <p className="text-[11px] text-purple-600 font-semibold mt-2">{t('dashboard_fat_subtext')}</p>
              </div>
            </div>
          </motion.div>

          {/* AI Clinical Health Tip (1 col) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="glass-card p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-[#0a192f] text-white shadow-xl flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="p-2 rounded-xl bg-purple-500/20 border border-purple-400/30 text-purple-300">
                  <Bot className="w-5 h-5" />
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-purple-300">{t('dashboard_ai_rec_title')}</span>
              </div>

              <h4 className="text-lg font-black leading-snug mb-2 text-white">
                {deficiencyCount > 0 ? t('dashboard_ai_rec_head_boost') : t('dashboard_ai_rec_head_optimal')}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {deficiencyCount > 0
                  ? t('dashboard_ai_rec_body_boost')
                  : t('dashboard_ai_rec_body_optimal')}
              </p>
            </div>

            <Link
              to="/ai-coach"
              className="mt-6 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-sky-600 hover:from-purple-700 hover:to-sky-700 text-white font-bold text-xs shadow-md transition-all border-0 cursor-pointer active:scale-95"
            >
              {t('dashboard_btn_ask_coach')} <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        {/* 🚀 Main Timeline: Recent Diagnostic & Assessment Records */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="glass-card p-6 sm:p-8 rounded-3xl bg-white/95 border border-slate-200/90 shadow-md w-full"
        >
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-[#0a192f] tracking-tight">{t('dashboard_diagnostic_title')}</h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">{t('dashboard_diagnostic_subtitle')}</p>
            </div>
            <Link to="/reports" className="text-xs sm:text-sm font-extrabold text-[#0284c7] hover:text-sky-800 transition-colors flex items-center gap-1">
              {t('common_view_all')} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {data?.recent_predictions?.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {data.recent_predictions.slice(0, 5).map((pred, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ scale: 1.005 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-sky-300 transition-all cursor-pointer gap-3 sm:gap-0 shadow-xs"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0 ${
                       (pred.risk || 0) > 60 ? 'bg-rose-50 border-rose-200 text-rose-600' :
                       (pred.risk || 0) > 30 ? 'bg-amber-50 border-amber-200 text-amber-600' :
                       'bg-emerald-50 border-emerald-200 text-emerald-600'
                    }`}>
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-black text-[#0a192f] leading-tight">{pred.deficiency || t('dashboard_default_assessment')}</p>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">{pred.date || 'Today, 10:45 AM'}</p>
                    </div>
                  </div>
                  <span className={`self-start sm:self-auto text-[10px] sm:text-xs px-3.5 py-1.5 rounded-full font-black uppercase tracking-wider ${
                    (pred.risk || 0) > 60 ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                    (pred.risk || 0) > 30 ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                    'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  }`}>
                    {(pred.risk || 0) > 60 ? t('common_high_risk') : (pred.risk || 0) > 30 ? t('common_moderate_risk') : t('common_low_risk')}
                  </span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 sm:py-14 flex flex-col items-center justify-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 p-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4 text-[#0284c7] shadow-xs">
                <Activity className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <h4 className="text-base sm:text-lg font-black text-[#0a192f] mb-2">{t('dashboard_empty_title')}</h4>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold mb-6 max-w-sm mx-auto leading-relaxed">
                {t('dashboard_empty_desc')}
              </p>
              <Link
                to="/prediction"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#0a192f] hover:bg-[#0284c7] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all hover:scale-105"
              >
                {t('dashboard_empty_btn')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </motion.div>

        {/* 🔗 Floating Feature Shortcuts Pill Bar */}
        <div className="flex items-center gap-3 overflow-x-auto py-2 custom-scrollbar">
          {shortcutLinks.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                to={item.path}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 text-[#0a192f] font-bold text-xs shrink-0 shadow-xs hover:shadow-md transition-all cursor-pointer group"
              >
                <div className={`p-1.5 rounded-xl bg-gradient-to-r ${item.color} text-white`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span>{item.label}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0284c7] transition-colors" />
              </Link>
            );
          })}
        </div>

      </div>

      {/* ℹ️ Nutrition Score Guide Modal */}
      {scoreInfoModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto custom-scrollbar">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden my-auto text-[#0a192f]"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-500/20">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-2xl font-black text-[#0a192f] leading-tight">
                    Nutrition Score Guide
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    How to boost your metabolic nutrition score
                  </p>
                </div>
              </div>
              <button
                onClick={() => setScoreInfoModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-6 text-xs sm:text-sm text-slate-700">
              <div className="p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-200/80 flex items-start gap-3">
                <div className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-black shrink-0 text-[11px] mt-0.5 shadow-xs">
                  +8 PTS
                </div>
                <div>
                  <h4 className="font-black text-emerald-950 text-xs sm:text-sm">Log Daily Meals in Food Diary</h4>
                  <p className="text-slate-600 font-medium text-xs mt-0.5">Log breakfast, lunch, or dinner daily to build your tracking streak and earn meal points.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-sky-50/90 border border-sky-200/80 flex items-start gap-3">
                <div className="px-2.5 py-1 rounded-xl bg-[#0284c7] text-white font-black shrink-0 text-[11px] mt-0.5 shadow-xs">
                  +5 PTS
                </div>
                <div>
                  <h4 className="font-black text-sky-950 text-xs sm:text-sm">Hit Daily Calorie & Macro Target</h4>
                  <p className="text-slate-600 font-medium text-xs mt-0.5">Staying within 70% – 115% of your recommended BMR/TDEE calorie target boosts score stability.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-50/90 border border-purple-200/80 flex items-start gap-3">
                <div className="px-2.5 py-1 rounded-xl bg-purple-600 text-white font-black shrink-0 text-[11px] mt-0.5 shadow-xs">
                  +4 PTS
                </div>
                <div>
                  <h4 className="font-black text-purple-950 text-xs sm:text-sm">Maintain Water Hydration Goal</h4>
                  <p className="text-slate-600 font-medium text-xs mt-0.5">Log water intake to reach at least 75% of your body weight hydration target (e.g. 2.5L+).</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/80 flex items-start gap-3">
                <div className="px-2.5 py-1 rounded-xl bg-amber-500 text-white font-black shrink-0 text-[11px] mt-0.5 shadow-xs">
                  +20 PTS
                </div>
                <div>
                  <h4 className="font-black text-amber-950 text-xs sm:text-sm">Resolve Tracked Nutrient Deficiencies</h4>
                  <p className="text-slate-600 font-medium text-xs mt-0.5">Run AI assessments and follow AI meal plans to reduce Iron, Vitamin D, Calcium, and B12 risks.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50/90 border border-indigo-200/80 flex items-start gap-3">
                <div className="px-2.5 py-1 rounded-xl bg-indigo-600 text-white font-black shrink-0 text-[11px] mt-0.5 shadow-xs">
                  +3 PTS
                </div>
                <div>
                  <h4 className="font-black text-indigo-950 text-xs sm:text-sm">Optimal Body Mass Index (BMI)</h4>
                  <p className="text-slate-600 font-medium text-xs mt-0.5">Maintaining a healthy BMI range (18.5 – 24.9) automatically adds structural metabolic points.</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setScoreInfoModalOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-[#0a192f] hover:bg-[#0284c7] text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
              >
                Got It
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </DashboardLayout>
  );
}
