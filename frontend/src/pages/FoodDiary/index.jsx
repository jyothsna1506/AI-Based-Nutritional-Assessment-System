import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Coffee, Sun, Moon, Cookie,
  Flame, Droplets, Trash2, Utensils, Sparkles,
  CheckCircle2, RefreshCw, Scale, ChevronRight, ChevronLeft, Sliders, Zap,
  TrendingUp, Award, Clock, ArrowUpRight, Calendar as CalendarIcon
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import foodService from '../../services/foodService';
import { useLanguage } from '../../context/LanguageContext';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 100, damping: 20 }
  }
};

export default function FoodDiary() {
  const { t, language } = useLanguage();

  // Calendar Date Navigation State
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const isToday = selectedDate === todayStr;
  const isYesterday = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return selectedDate === d.toISOString().split('T')[0];
  }, [selectedDate]);

  const formattedDateLabel = useMemo(() => {
    try {
      const parts = selectedDate.split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return selectedDate;
    }
  }, [selectedDate, language]);

  const changeDateByDays = (days) => {
    try {
      const parts = selectedDate.split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      d.setDate(d.getDate() + days);
      const newStr = d.toISOString().split('T')[0];
      setSelectedDate(newStr);
    } catch (err) {
      console.error('Date shift error:', err);
    }
  };

  // Presets mapped with translated labels
  const popularPresets = useMemo(() => [
    { key: 'apple', name: t('food_diary_preset_apple') || 'Apple', queryName: 'Apple', qty: 1, unit: 'pcs', icon: '🍎' },
    { key: 'milk', name: t('food_diary_preset_milk') || 'Whole Milk', queryName: 'Whole Milk', qty: 250, unit: 'ml', icon: '🥛' },
    { key: 'rice', name: t('food_diary_preset_rice') || 'Brown Rice', queryName: 'Brown Rice', qty: 150, unit: 'g', icon: '🍚' },
    { key: 'avocado', name: t('food_diary_preset_avocado') || 'Avocado', queryName: 'Avocado', qty: 1, unit: 'pcs', icon: '🥑' },
    { key: 'almonds', name: t('food_diary_preset_almonds') || 'Almonds', queryName: 'Almonds', qty: 30, unit: 'g', icon: '🥜' },
    { key: 'oatmeal', name: t('food_diary_preset_oatmeal') || 'Oatmeal Porridge', queryName: 'Oatmeal Porridge', qty: 1, unit: 'cups', icon: '🥣' },
  ], [language, t]);

  const mealTypes = useMemo(() => [
    { value: 'breakfast', label: t('food_diary_breakfast'), icon: Coffee, color: 'text-amber-500', accentBg: 'bg-amber-50 border-amber-200 text-amber-700', gradient: 'from-amber-50/50 via-white to-white', border: 'border-slate-200' },
    { value: 'lunch', label: t('food_diary_lunch'), icon: Sun, color: 'text-blue-500', accentBg: 'bg-blue-50 border-blue-200 text-blue-700', gradient: 'from-blue-50/50 via-white to-white', border: 'border-slate-200' },
    { value: 'dinner', label: t('food_diary_dinner'), icon: Moon, color: 'text-purple-500', accentBg: 'bg-purple-50 border-purple-200 text-purple-700', gradient: 'from-purple-50/50 via-white to-white', border: 'border-slate-200' },
    { value: 'snack', label: t('food_diary_snack'), icon: Cookie, color: 'text-pink-500', accentBg: 'bg-pink-50 border-pink-200 text-pink-700', gradient: 'from-pink-50/50 via-white to-white', border: 'border-slate-200' },
  ], [language, t]);

  const unitOptions = useMemo(() => [
    { code: 'servings', label: t('food_diary_unit_serving') || 'Servings' },
    { code: 'pcs', label: t('food_diary_unit_pcs') || 'Pieces (pcs)' },
    { code: 'g', label: t('food_diary_unit_g') || 'Grams (g)' },
    { code: 'ml', label: t('food_diary_unit_ml') || 'Milliliters (ml)' },
    { code: 'cups', label: t('food_diary_unit_cups') || 'Cups' },
    { code: 'oz', label: t('food_diary_unit_oz') || 'Ounces (oz)' },
    { code: 'tbsp', label: t('food_diary_unit_tbsp') || 'Tablespoon (tbsp)' },
  ], [language, t]);

  // Core Page State
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [foodInput, setFoodInput] = useState('');
  const [inputQuantity, setInputQuantity] = useState('1');
  const [inputUnit, setInputUnit] = useState('servings');
  const [loggingAI, setLoggingAI] = useState(false);

  const [diary, setDiary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });

  // Optional Fine-Tuning Modal State
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailForm, setDetailForm] = useState({
    food_name: '',
    quantity: '1',
    unit: 'servings',
    calories: '',
    protein: '0',
    carbs: '0',
    fat: '0',
  });
  const [estimatingDetails, setEstimatingDetails] = useState(false);

  useEffect(() => {
    loadDiary(selectedDate);
  }, [selectedDate]);

  const loadDiary = async (targetDate = selectedDate) => {
    setLoading(true);
    try {
      const res = await foodService.getFoodDiary(targetDate);
      setDiary(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Diary load error:', err);
      setDiary([]);
    } finally {
      setLoading(false);
    }
  };

  // 🤖 Direct AI Log Handler: Calculates macros using Gemini and logs to diary instantly
  const handleDirectAILog = async (overrideName = null, overrideQty = null, overrideUnit = null) => {
    const targetName = (overrideName !== null ? overrideName : foodInput).trim();
    if (!targetName) {
      setAlert({ show: true, type: 'error', message: t('food_diary_input_placeholder') || 'Please enter a food item or dish name.' });
      return;
    }

    const qty = Number(overrideQty !== null ? overrideQty : inputQuantity) || 1;
    const unit = overrideUnit !== null ? overrideUnit : inputUnit;

    setLoggingAI(true);
    setAlert({ show: false, type: 'info', message: '' });

    try {
      // Step 1: Query Gemini AI for exact nutrition breakdown
      const aiData = await foodService.estimateNutrition({
        food_name: targetName,
        quantity: qty,
        unit: unit,
      });

      const kcal = aiData?.calories !== undefined ? Math.round(Number(aiData.calories)) : 150;
      const protein = aiData?.protein !== undefined ? parseFloat(Number(aiData.protein).toFixed(1)) : 0;
      const carbs = aiData?.carbs !== undefined ? parseFloat(Number(aiData.carbs).toFixed(1)) : 0;
      const fat = aiData?.fat !== undefined ? parseFloat(Number(aiData.fat).toFixed(1)) : 0;

      // Step 2: Log food item directly to backend food diary
      await foodService.logFood({
        food_name: targetName,
        meal_type: selectedMeal,
        quantity: qty,
        unit: unit,
        calories: kcal,
        protein: protein,
        carbs: carbs,
        fat: fat,
      });

      setAlert({
        show: true,
        type: 'success',
        message: `✨ ${targetName} (${qty} ${unit}) — ${kcal} kcal ${t('food_diary_added_food') || 'Added to your diary!'}`,
      });

      setFoodInput('');
      loadDiary();
    } catch (err) {
      console.error('AI food log error:', err);
      const msg = err?.response?.data?.detail || t('food_diary_log_error') || 'Failed to log food.';
      setAlert({ show: true, type: 'error', message: msg });
    } finally {
      setLoggingAI(false);
    }
  };

  // Opens the Fine-Tuning / Review Modal with pre-estimated Gemini values
  const handleOpenDetailModal = async () => {
    if (!foodInput.trim()) {
      setAlert({ show: true, type: 'error', message: t('food_diary_input_placeholder') || 'Please enter a food name first.' });
      return;
    }

    const targetName = foodInput.trim();
    const qty = Number(inputQuantity) || 1;
    const unit = inputUnit;

    setDetailForm({
      food_name: targetName,
      quantity: String(qty),
      unit: unit,
      calories: '...',
      protein: '...',
      carbs: '...',
      fat: '...',
    });
    setShowDetailModal(true);
    setEstimatingDetails(true);

    try {
      const aiData = await foodService.estimateNutrition({
        food_name: targetName,
        quantity: qty,
        unit: unit,
      });

      if (aiData) {
        setDetailForm({
          food_name: targetName,
          quantity: String(qty),
          unit: unit,
          calories: String(aiData.calories || 150),
          protein: String(aiData.protein || 0),
          carbs: String(aiData.carbs || 0),
          fat: String(aiData.fat || 0),
        });
      }
    } catch (err) {
      console.error('AI detail estimation error:', err);
    } finally {
      setEstimatingDetails(false);
    }
  };

  const handleSaveDetailModal = async (e) => {
    if (e) e.preventDefault();
    if (!detailForm.food_name.trim()) return;

    setLoggingAI(true);
    try {
      await foodService.logFood({
        food_name: detailForm.food_name.trim(),
        meal_type: selectedMeal,
        quantity: Number(detailForm.quantity) || 1,
        unit: detailForm.unit || 'servings',
        calories: Math.round(Number(detailForm.calories) || 0),
        protein: parseFloat(detailForm.protein) || 0,
        carbs: parseFloat(detailForm.carbs) || 0,
        fat: parseFloat(detailForm.fat) || 0,
      });

      setAlert({
        show: true,
        type: 'success',
        message: `${detailForm.food_name} ${t('food_diary_added_food') || 'Added to your diary!'}`,
      });
      setShowDetailModal(false);
      setFoodInput('');
      loadDiary();
    } catch (err) {
      console.error('Save detail food error:', err);
      const msg = err?.response?.data?.detail || t('food_diary_log_error') || 'Failed to log food.';
      setAlert({ show: true, type: 'error', message: msg });
    } finally {
      setLoggingAI(false);
    }
  };

  const handleDeleteFood = async (entryId, foodName) => {
    try {
      await foodService.deleteFoodEntry(entryId);
      setAlert({ show: true, type: 'success', message: `${foodName} ${t('food_diary_removed_food') || 'Removed from diary.'}` });
      loadDiary();
    } catch (err) {
      console.error('Delete food error:', err);
      setAlert({ show: true, type: 'error', message: t('food_diary_remove_error') || 'Failed to remove food item.' });
    }
  };

  // Calculate Daily Totals
  const totalKcal = useMemo(() => diary.reduce((sum, e) => sum + (e.calories || 0), 0), [diary]);
  const totalProtein = useMemo(() => diary.reduce((sum, e) => sum + (e.protein || 0), 0), [diary]);
  const totalCarbs = useMemo(() => diary.reduce((sum, e) => sum + (e.carbs || 0), 0), [diary]);
  const totalFat = useMemo(() => diary.reduce((sum, e) => sum + (e.fat || 0), 0), [diary]);

  const targetKcal = 2000;
  const kcalPct = Math.min(100, Math.round((totalKcal / targetKcal) * 100));

  const targetProtein = 120;
  const targetCarbs = 250;
  const targetFat = 65;

  const groupedDiary = useMemo(() => {
    return mealTypes.reduce((acc, mt) => {
      acc[mt.value] = diary.filter((d) => d.meal_type === mt.value);
      return acc;
    }, {});
  }, [diary, mealTypes]);

  if (loading) {
    return (
      <DashboardLayout title={t('food_diary_page_title') || t('sidebar_food_diary')}>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <RefreshCw className="w-10 h-10 text-[#0077ff] animate-spin mb-3" />
          <p className="text-sm font-bold text-slate-600">Loading your AI Food Diary...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={t('food_diary_page_title') || t('sidebar_food_diary')}
      subtitle={t('food_diary_subtitle') || "Direct AI-powered caloric and macronutrient food logging"}
    >
      {alert.show && (
        <Alert
          type={alert.type}
          message={alert.message}
          show={alert.show}
          onClose={() => setAlert({ ...alert, show: false })}
        />
      )}

      {/* 🗓️ Interactive Calendar & Date Picker System Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-white/95 border border-slate-200 shadow-sm mb-6 text-[#0a192f] relative overflow-hidden"
      >
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-sky-100/50 rounded-full blur-2xl pointer-events-none" />

        {/* Left: Selected Date Info & Status Badge */}
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20 shrink-0">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-[#0a192f] tracking-tight">{formattedDateLabel}</h3>
              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border shadow-xs ${
                isToday ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                isYesterday ? 'bg-sky-50 text-[#0284c7] border-sky-200' :
                'bg-purple-50 text-purple-700 border-purple-200'
              }`}>
                {isToday ? (t('calendar_today') || 'Today') : isYesterday ? (t('calendar_yesterday') || 'Yesterday') : (t('calendar_viewing_past') ? `${t('calendar_viewing_past')} (${selectedDate})` : `Archived (${selectedDate})`)}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              {isToday ? 'Viewing live today food entries' : `Viewing food diary history for ${selectedDate}`}
            </p>
          </div>
        </div>

        {/* Right: Quick Date Controls (Prev Day, Today, Next Day, Calendar Date Input) */}
        <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto justify-between sm:justify-end relative z-10">
          <button
            onClick={() => changeDateByDays(-1)}
            className="px-3 py-2 rounded-2xl bg-slate-100 hover:bg-sky-50 hover:text-[#0284c7] border border-slate-200 text-slate-700 font-bold transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1 text-xs"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t('calendar_prev_day') || 'Prev'}</span>
          </button>

          {!isToday && (
            <button
              onClick={() => setSelectedDate(todayStr)}
              className="px-3.5 py-2 rounded-2xl bg-[#0a192f] hover:bg-[#0284c7] text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              {t('calendar_today') || 'Today'}
            </button>
          )}

          <button
            onClick={() => changeDateByDays(1)}
            disabled={isToday}
            className="px-3 py-2 rounded-2xl bg-slate-100 hover:bg-sky-50 hover:text-[#0284c7] border border-slate-200 text-slate-700 font-bold transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 text-xs"
            title="Next Day"
          >
            <span className="hidden sm:inline">{t('calendar_next_day') || 'Next'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Native HTML5 Calendar Date Picker Input */}
          <div className="relative shrink-0">
            <input
              type="date"
              max={todayStr}
              value={selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              className="px-3 py-2 rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-[#0284c7] text-xs font-black transition-all cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
            />
          </div>
        </div>
      </motion.div>

      {/* 🌟 Hero Calorie & Macro Intelligence Hub Header */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8 mt-2"
      >
        {/* Radial Calorie Progress Gauge Card */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -2 }}
          className="glass-card p-5 sm:p-6 rounded-3xl border border-slate-200 flex items-center gap-4 sm:gap-5 shadow-sm relative overflow-hidden sm:col-span-2 lg:col-span-1"
        >
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100 stroke-current"
                strokeWidth="3.5"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#0077ff] stroke-current transition-all duration-1000 ease-out"
                strokeDasharray={`${kcalPct}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <Flame className="w-4 h-4 text-amber-500 mb-0.5 animate-bounce" />
              <span className="text-sm sm:text-base font-black text-slate-900 leading-none">{totalKcal}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">/ {targetKcal}</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-tight truncate">
              {t('food_diary_daily_goal') || 'Daily Calorie Goal'}
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-1 truncate font-medium">
              {t('food_diary_remaining') || 'Remaining:'} <strong className="text-[#0077ff] font-bold">{Math.max(0, targetKcal - totalKcal)} kcal</strong>
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[10px] font-black text-[#0077ff]">
              <Zap className="w-3 h-3 text-[#0077ff] shrink-0" /> {kcalPct}% {t('food_diary_target_met') || 'Target Met'}
            </div>
          </div>
        </motion.div>

        {/* Protein Progress Card */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -2 }}
          className="glass-card p-4 sm:p-5 rounded-3xl border border-slate-200 flex flex-col justify-between shadow-sm relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
              <span className="text-xs font-black text-blue-600 uppercase tracking-wider">
                {t('food_diary_protein') || 'PROTEIN'}
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-bold">{Math.round(totalProtein)} / {targetProtein}g</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 my-2">
            {Math.round(totalProtein)} <span className="text-xs font-medium text-slate-400">g</span>
          </p>
          <div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (totalProtein / targetProtein) * 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-[#0077ff] rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Carbs Progress Card */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -2 }}
          className="glass-card p-4 sm:p-5 rounded-3xl border border-slate-200 flex flex-col justify-between shadow-sm relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shrink-0" />
              <span className="text-xs font-black text-purple-600 uppercase tracking-wider">
                {t('food_diary_carbs') || 'CARBS'}
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-bold">{Math.round(totalCarbs)} / {targetCarbs}g</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 my-2">
            {Math.round(totalCarbs)} <span className="text-xs font-medium text-slate-400">g</span>
          </p>
          <div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (totalCarbs / targetCarbs) * 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-purple-500 rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Fat Progress Card */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -2 }}
          className="glass-card p-4 sm:p-5 rounded-3xl border border-slate-200 flex flex-col justify-between shadow-sm relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
              <span className="text-xs font-black text-rose-600 uppercase tracking-wider">
                {t('food_diary_fat') || 'FAT'}
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-bold">{Math.round(totalFat)} / {targetFat}g</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 my-2">
            {Math.round(totalFat)} <span className="text-xs font-medium text-slate-400">g</span>
          </p>
          <div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (totalFat / targetFat) * 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-rose-500 rounded-full"
              />
            </div>
          </div>
        </motion.div>

      </motion.div>

      {/* 🤖 Direct AI Food Logger Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-4 sm:p-6 lg:p-8 rounded-3xl border border-slate-200 mb-8 shadow-sm relative overflow-hidden bg-white"
      >
        {/* Logger Header & Responsive Mobile Meal Tabs */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#0077ff] flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                {t('food_diary_logger_title') || 'Direct Gemini AI Food Logger'}
              </h3>
              <p className="text-[11px] sm:text-xs text-[#0077ff] font-bold mt-0.5">
                {t('food_diary_logger_subtitle') || 'Type any dish or meal — AI automatically calculates Calories & Macros'}
              </p>
            </div>
          </div>

          {/* Fully Scrollable & Responsive Meal Category Selector Tabs */}
          <div className="w-full overflow-x-auto pb-1 custom-scrollbar">
            <div className="inline-flex bg-slate-100 p-1 rounded-2xl border border-slate-200 gap-1 min-w-full sm:min-w-0">
              {mealTypes.map((mt) => {
                const Icon = mt.icon;
                const active = selectedMeal === mt.value;
                return (
                  <button
                    key={mt.value}
                    type="button"
                    onClick={() => setSelectedMeal(mt.value)}
                    className={`relative px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer select-none whitespace-nowrap flex-1 sm:flex-initial min-w-[95px] sm:min-w-0 ${
                      active ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="activeMealTab"
                        className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 rounded-xl shadow-md shadow-purple-500/25"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    <Icon className={`w-3.5 h-3.5 relative z-10 shrink-0 ${active ? 'text-white' : mt.color}`} />
                    <span className="relative z-10">{mt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Interactive Food Input Bar & Portion Stepper */}
        <div className="flex flex-col lg:flex-row gap-3 mb-6">
          
          {/* Main Food Input */}
          <div className="flex-1">
            <Input
              placeholder={t('food_diary_input_placeholder') || "What did you eat? (e.g. Masala Dosa, 1 Apple, 250ml Milk)"}
              value={foodInput}
              onChange={(e) => setFoodInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleDirectAILog()}
            />
          </div>

          {/* Responsive Stepper & Unit Selector Row */}
          <div className="grid grid-cols-2 gap-2 w-full lg:w-auto">
            
            {/* Quantity Stepper */}
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-1 w-full">
              <button
                type="button"
                onClick={() => {
                  const curr = Number(inputQuantity) || 0;
                  if (curr > 0.5) setInputQuantity(String(curr - 0.5));
                }}
                className="w-8 h-9 sm:w-9 sm:h-9 rounded-lg bg-white hover:bg-slate-200 text-slate-800 font-bold text-sm flex items-center justify-center cursor-pointer transition-colors active:scale-95 select-none shrink-0 shadow-xs border border-slate-200"
              >
                -
              </button>
              <input
                type="number"
                step="0.5"
                min="0.1"
                value={inputQuantity}
                onChange={(e) => {
                  const val = e.target.value;
                  setInputQuantity(val === '' ? '' : val);
                }}
                onBlur={() => {
                  if (!inputQuantity || Number(inputQuantity) <= 0) setInputQuantity('1');
                }}
                className="w-10 sm:w-12 h-9 text-center bg-transparent text-xs sm:text-sm font-black text-slate-900 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  const curr = Number(inputQuantity) || 0;
                  setInputQuantity(String(curr + 0.5));
                }}
                className="w-8 h-9 sm:w-9 sm:h-9 rounded-lg bg-white hover:bg-slate-200 text-slate-800 font-bold text-sm flex items-center justify-center cursor-pointer transition-colors active:scale-95 select-none shrink-0 shadow-xs border border-slate-200"
              >
                +
              </button>
            </div>

            {/* Unit Dropdown */}
            <select
              value={inputUnit}
              onChange={(e) => setInputUnit(e.target.value)}
              className="h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0077ff] cursor-pointer w-full"
            >
              {unitOptions.map((u) => (
                <option key={u.code} value={u.code} className="bg-white text-slate-900">
                  {u.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons Row */}
          <div className="flex gap-2 w-full lg:w-auto">
            <Button
              onClick={() => handleDirectAILog()}
              loading={loggingAI}
              size="md"
              className="bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-700 hover:to-sky-700 text-white font-bold shadow-md shadow-purple-500/25 whitespace-nowrap px-5 sm:px-6 h-11 rounded-xl flex-1 lg:flex-none cursor-pointer text-xs sm:text-sm border-0"
            >
              <Sparkles className="w-4 h-4 text-white mr-1.5 shrink-0" />
              <span>{t('food_diary_btn_calculate_log') || 'Calculate & Log'}</span>
            </Button>

            {/* Fine-Tuning Adjust Button */}
            <button
              type="button"
              onClick={handleOpenDetailModal}
              title={t('food_diary_tooltip_finetune') || "Fine-tune macros manually before saving"}
              className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95"
            >
              <Sliders className="w-5 h-5 text-[#0077ff]" />
            </button>
          </div>

        </div>

        {/* Quick 1-Tap Preset Food Chips */}
        <div>
          <p className="text-xs font-bold text-slate-500 mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{t('food_diary_presets_header') || 'Quick 1-Tap AI Logging Presets'}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {popularPresets.map((preset) => (
              <motion.button
                key={preset.key}
                type="button"
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleDirectAILog(preset.queryName, preset.qty, preset.unit)}
                disabled={loggingAI}
                className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 hover:text-slate-900 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs shrink-0"
              >
                <span>{preset.icon}</span>
                <span>{preset.name}</span>
                <span className="text-[10px] text-[#0077ff] bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-md font-black">
                  {preset.qty} {preset.unit}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 🍽️ Logged Meal Category Section Cards */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4 sm:space-y-6">
        {mealTypes.map((mt) => {
          const Icon = mt.icon;
          const entries = groupedDiary[mt.value] || [];

          const mealKcal = entries.reduce((sum, e) => sum + (e.calories || 0), 0);
          const mealProtein = entries.reduce((sum, e) => sum + (e.protein || 0), 0);
          const mealCarbs = entries.reduce((sum, e) => sum + (e.carbs || 0), 0);
          const mealFat = entries.reduce((sum, e) => sum + (e.fat || 0), 0);

          return (
            <motion.div
              key={mt.value}
              variants={cardVariants}
              className="glass-card rounded-3xl p-4 sm:p-6 lg:p-7 border border-slate-200 bg-white shadow-sm relative overflow-hidden"
            >
              {/* Meal Section Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${mt.color}`} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-lg font-black text-slate-900 flex items-center gap-2 leading-tight truncate">
                      <span>{mt.label}</span>
                      <span className="text-[10px] sm:text-xs text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {entries.length} {t('food_diary_items_count') || 'items'}
                      </span>
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 font-medium truncate">
                      P: <strong className="text-blue-600 font-bold">{Math.round(mealProtein)}g</strong> • C:{' '}
                      <strong className="text-purple-600 font-bold">{Math.round(mealCarbs)}g</strong> • F:{' '}
                      <strong className="text-rose-600 font-bold">{Math.round(mealFat)}g</strong>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-base sm:text-xl font-black text-amber-600 tracking-tight">{Math.round(mealKcal)}</span>
                  <span className="text-[10px] sm:text-xs text-slate-400 font-bold ml-1">kcal</span>
                </div>
              </div>

              {/* Logged Food Entries List */}
              {entries.length === 0 ? (
                <div className="py-6 sm:py-7 text-center text-slate-400 text-xs italic bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  {t('food_diary_no_foods')}
                </div>
              ) : (
                <div className="space-y-2.5 sm:space-y-3">
                  <AnimatePresence>
                    {entries.map((entry) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 15 }}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition-all group gap-2 sm:gap-4 shadow-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0077ff] shrink-0">
                            <Utensils className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">{entry.food_name}</p>
                            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate font-medium">
                              {t('food_diary_portion') || 'Portion:'} <strong className="text-[#0077ff] font-bold">{entry.quantity} {entry.unit || 'servings'}</strong> • P: {entry.protein}g • C: {entry.carbs}g • F: {entry.fat}g
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                          <span className="text-xs sm:text-sm font-black text-[#0077ff] bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-100">
                            {entry.calories} kcal
                          </span>
                          <button
                            onClick={() => handleDeleteFood(entry.id, entry.food_name)}
                            className="text-slate-400 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer active:scale-95"
                            title="Delete entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* ✨ Optional Fine-Tuning Review Modal Overlay */}
      {showDetailModal && createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-2xl my-auto max-h-[90vh] overflow-y-auto custom-scrollbar text-slate-900"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-5 pb-3 sm:pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#0077ff] flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                    {t('food_diary_modal_title') || 'Review & Fine-Tune AI Food Entry'}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#0077ff] font-bold">
                    {t('food_diary_modal_subtitle') || 'Gemini AI Calculated Breakdown'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="text-slate-400 hover:text-slate-800 p-2 rounded-full bg-slate-100 hover:bg-slate-200 cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDetailModal} className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('food_diary_modal_food_name') || 'Food / Dish Name'} *
                </label>
                <Input
                  placeholder="e.g. Masala Dosa, Chicken Curry"
                  value={detailForm.food_name}
                  onChange={(e) => setDetailForm({ ...detailForm, food_name: e.target.value })}
                  required
                />
              </div>

              {/* Calories & Quantity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {t('food_diary_modal_calories') || 'Calories (kcal)'} *
                  </label>
                  <Input
                    type="number"
                    placeholder="150"
                    value={detailForm.calories}
                    onChange={(e) => setDetailForm({ ...detailForm, calories: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {t('food_diary_modal_quantity') || 'Quantity'}
                  </label>
                  <Input
                    type="number"
                    placeholder="1"
                    min="1"
                    value={detailForm.quantity}
                    onChange={(e) => setDetailForm({ ...detailForm, quantity: e.target.value })}
                  />
                </div>
              </div>

              {/* Measurement Unit Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {t('food_diary_modal_unit') || 'Measurement Unit'}
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {unitOptions.map((unit) => {
                    const selected = detailForm.unit === unit.code;
                    return (
                      <button
                        key={unit.code}
                        type="button"
                        onClick={() => setDetailForm({ ...detailForm, unit: unit.code })}
                        className={`p-2 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                          selected
                            ? 'bg-[#0077ff] text-white border-[#0077ff] shadow-md shadow-blue-500/20'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        {unit.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Macros (Protein, Carbs, Fat) */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-[11px] font-black text-blue-600 uppercase mb-1">
                    {t('food_diary_modal_protein') || 'Protein (g)'}
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    step="0.1"
                    value={detailForm.protein}
                    onChange={(e) => setDetailForm({ ...detailForm, protein: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-purple-600 uppercase mb-1">
                    {t('food_diary_modal_carbs') || 'Carbs (g)'}
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    step="0.1"
                    value={detailForm.carbs}
                    onChange={(e) => setDetailForm({ ...detailForm, carbs: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-rose-600 uppercase mb-1">
                    {t('food_diary_modal_fat') || 'Fat (g)'}
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    step="0.1"
                    value={detailForm.fat}
                    onChange={(e) => setDetailForm({ ...detailForm, fat: e.target.value })}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="w-1/3 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  {t('food_diary_modal_cancel') || 'Cancel'}
                </button>
                <Button
                  type="submit"
                  loading={loggingAI}
                  size="md"
                  className="w-2/3 py-3 bg-[#0077ff] hover:bg-[#0066ff] text-white font-bold rounded-xl shadow-md shadow-blue-500/20"
                >
                  {t('food_diary_modal_submit') || 'Log Food to Diary'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>,
        document.body
      )}
    </DashboardLayout>
  );
}
