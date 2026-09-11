import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  Utensils, RefreshCw, Sun, Coffee, Moon, Cookie,
  Leaf, Beef, Vegan, X, CheckCircle2, Bot, Clock, Sparkles,
  ShoppingCart, Download, Copy, Printer, FileText
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import mealService from '../../services/mealService';
import api from '../../services/api';
import { saveOfflineMealPlan, getOfflineMealPlan } from '../../utils/offlineStorage';
import { useLanguage } from '../../context/LanguageContext';

const mealIcons = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Moon,
  snack: Cookie,
};

const mealGradients = {
  breakfast: 'from-amber-500/20 to-orange-500/10',
  lunch: 'from-sky-500/20 to-blue-500/10',
  dinner: 'from-purple-500/20 to-indigo-500/10',
  snack: 'from-pink-500/20 to-rose-500/10',
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
};

function MealCard({ slot, meal, onMealClick, t }) {
  const [imgFailed, setImgFailed] = useState(false);
  const Icon = mealIcons[slot] || Utensils;
  const gradient = mealGradients[slot];

  if (!meal) {
    return (
      <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 opacity-60 flex flex-col items-center justify-center min-h-[260px] sm:min-h-[280px]">
        <Icon size={32} className="opacity-40 mb-3 text-slate-400" />
        <span className="text-base sm:text-lg font-black text-slate-600 capitalize">{slot}</span>
        <p className="text-xs sm:text-sm text-slate-500 italic mt-2">{t('meal_no_meal_scheduled')}</p>
      </div>
    );
  }

  const hasValidImage = meal.recipe_image && !imgFailed;
  const titleText = meal.recipe_title || meal.food_name || t('meal_default_title');

  return (
    <motion.div
      variants={cardVariant}
      whileHover={{ y: -6, scale: 1.015 }}
      onClick={() => onMealClick(meal, slot)}
      className="relative rounded-3xl overflow-hidden cursor-pointer group shadow-xs min-h-[320px] sm:min-h-[360px] flex flex-col border border-slate-200 bg-white"
    >
      {hasValidImage ? (
        <img
          src={meal.recipe_image}
          alt=""
          onError={() => setImgFailed(true)}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <Utensils className="w-24 h-24 text-slate-300/40" />
        </div>
      )}

      <div className={`absolute inset-0 bg-gradient-to-t ${hasValidImage ? 'from-[#0a192f] via-[#0a192f]/40 to-black/30' : 'from-[#0a192f] via-[#0a192f]/20 to-transparent'}`} />
      
      <div className="relative z-10 p-4 sm:p-6 flex flex-col h-full justify-between">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-white/90 backdrop-blur-md px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-slate-200 shadow-xs">
            <Icon size={14} className="text-[#0284c7] shrink-0" />
            <span className="text-[10px] sm:text-xs font-black text-[#0a192f] uppercase tracking-wider">{slot}</span>
          </div>
          {meal.recipe_ready_in && (
            <div className="bg-white/90 backdrop-blur-md px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-slate-200 shadow-xs flex items-center gap-1.5 shrink-0">
              <Clock size={12} className="text-amber-600 shrink-0" />
              <span className="text-[10px] sm:text-xs font-bold text-[#0a192f]">{meal.recipe_ready_in} {t('common_min')}</span>
            </div>
          )}
        </div>

        <div className="mt-auto pt-6 sm:pt-8 space-y-3">
          <h4
            title={titleText}
            className="text-lg sm:text-xl xl:text-2xl font-black text-white leading-snug drop-shadow-md group-hover:text-sky-300 transition-colors line-clamp-2"
          >
            {titleText}
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-[#0a192f]/90 backdrop-blur-md p-2 rounded-2xl border border-white/20 text-center text-white">
            <div className="flex flex-col items-center justify-center p-1">
              <span className="text-xs font-black text-amber-300 leading-none">{Math.round(meal.calories || 0)}</span>
              <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tight mt-1">{t('common_kcal')}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-1 sm:border-l border-white/15">
              <span className="text-xs font-black text-emerald-300 leading-none">{Math.round(meal.protein || 0)}g</span>
              <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tight mt-1">{t('common_protein')}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-1 border-l sm:border-l border-white/15">
              <span className="text-xs font-black text-sky-300 leading-none">{Math.round(meal.carbohydrates || 0)}g</span>
              <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tight mt-1">{t('common_carbs')}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-1 border-l border-white/15">
              <span className="text-xs font-black text-rose-300 leading-none">{Math.round(meal.fat || 0)}g</span>
              <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tight mt-1">{t('common_fat')}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function MealPlanner() {
  const { t } = useLanguage();

  const dietOptions = [
    { value: 'vegetarian', label: t('meal_diet_vegetarian'), icon: Leaf, color: 'text-emerald-600' },
    { value: 'non_vegetarian', label: t('meal_diet_non_veg'), icon: Beef, color: 'text-rose-600' },
    { value: 'vegan', label: t('meal_diet_vegan'), icon: Vegan, color: 'text-green-600' },
  ];

  const dayNames = [
    t('common_days_mon'), t('common_days_tue'), t('common_days_wed'), t('common_days_thu'),
    t('common_days_fri'), t('common_days_sat'), t('common_days_sun'),
  ];

  const fullDayNames = [
    t('common_days_monday'), t('common_days_tuesday'), t('common_days_wednesday'), t('common_days_thursday'),
    t('common_days_friday'), t('common_days_saturday'), t('common_days_sunday'),
  ];

  const [selectedDiet, setSelectedDiet] = useState('vegetarian');
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [weeklyPlan, setWeeklyPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });

  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [modalImgFailed, setModalImgFailed] = useState(false);

  const [aiRecipes, setAiRecipes] = useState(null);
  const [recipesLoading, setRecipesLoading] = useState(false);

  // Shopping List States
  const [shoppingListModalOpen, setShoppingListModalOpen] = useState(false);
  const [shoppingListLoading, setShoppingListLoading] = useState(false);
  const [shoppingListData, setShoppingListData] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadWeeklyPlan(selectedDiet);
  }, []);

  const loadWeeklyPlan = async (diet) => {
    const cached = getOfflineMealPlan();
    if (cached && (cached.diet_preference === diet || cached.diet_type === diet)) {
      setWeeklyPlan(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      const data = await mealService.getWeeklyMealPlan(diet);
      if (data && data.days && data.days.length > 0) {
        setWeeklyPlan(data);
        if (data.diet_preference) {
          setSelectedDiet(data.diet_preference);
        }
        saveOfflineMealPlan(data);
      }
    } catch (err) {
      console.error('Failed to load meal plan', err);
      if (cached) {
        setWeeklyPlan(cached);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDietChange = (diet) => {
    setSelectedDiet(diet);
    loadWeeklyPlan(diet);
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    setAlert({ show: false, type: 'success', message: '' });
    try {
      const data = await mealService.regeneratePlan(selectedDiet);
      setWeeklyPlan(data);
      setAlert({ show: true, type: 'success', message: t('meal_regenerate_success') });
    } catch (err) {
      console.error('Regenerate failed', err);
      setAlert({ show: true, type: 'error', message: t('meal_regenerate_error') });
    } finally {
      setRegenerating(false);
    }
  };

  const handleGenerateAiRecipes = async () => {
    setRecipesLoading(true);
    try {
      const { data } = await api.post('/ai/recipes', {
        dietary_preference: selectedDiet,
        target_calories: 2000
      });
      setAiRecipes(data.recipes);
    } catch (err) {
      setAlert({ show: true, type: 'error', message: t('meal_ai_recipes_error') });
    } finally {
      setRecipesLoading(false);
    }
  };

  const handleGenerateShoppingList = async () => {
    if (!weeklyPlan) return;
    setShoppingListLoading(true);
    try {
      const data = await mealService.generateShoppingList(weeklyPlan);
      setShoppingListData(data);
      setShoppingListModalOpen(true);
    } catch (err) {
      console.error('Failed to generate shopping list', err);
      setAlert({ show: true, type: 'error', message: 'Failed to generate shopping list. Please try again.' });
    } finally {
      setShoppingListLoading(false);
    }
  };

  const toggleCheckItem = (key) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDownloadTxt = () => {
    if (!shoppingListData) return;
    let txt = `=================================================
`;
    txt += `  NUTRI-AI WEEKLY GROCERY SHOPPING LIST
`;
    txt += `  Diet Preference: ${shoppingListData.diet_preference || selectedDiet}
`;
    txt += `  Generated via Google Gemini AI
`;
    txt += `=================================================

`;

    shoppingListData.categories?.forEach((cat) => {
      txt += `[ ${cat.name.toUpperCase()} ]
`;
      cat.items?.forEach((item) => {
        txt += `  • ${item.item} (${item.quantity})${item.notes ? ` - ${item.notes}` : ''}
`;
      });
      txt += `
`;
    });

    txt += `-------------------------------------------------
`;
    txt += `Generated on ${new Date().toLocaleDateString()} | NutriAI Clinical Nutrition System
`;

    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NutriAI_Shopping_List_${selectedDiet}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyClipboard = () => {
    if (!shoppingListData) return;
    let text = `🛒 NutriAI Grocery Shopping List (${shoppingListData.diet_preference || selectedDiet})

`;
    shoppingListData.categories?.forEach((cat) => {
      text += `📌 ${cat.name}:
`;
      cat.items?.forEach((item) => {
        text += `  • ${item.item}: ${item.quantity}${item.notes ? ` (${item.notes})` : ''}
`;
      });
      text += `
`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintPdf = () => {
    if (!shoppingListData) return;

    const printWin = window.open('', '_blank');
    if (!printWin) return;

    const dietLabel = (shoppingListData.diet_preference || selectedDiet).toUpperCase();
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    let categoriesHtml = '';
    shoppingListData.categories?.forEach((cat, catIdx) => {
      let itemsHtml = '';
      cat.items?.forEach((item, itemIdx) => {
        const itemKey = `${catIdx}-${itemIdx}`;
        const isChecked = checkedItems[itemKey];
        itemsHtml += `
          <div class="item-row ${isChecked ? 'completed' : ''}">
            <div class="checkbox ${isChecked ? 'checked' : ''}">
              ${isChecked ? '✓' : ''}
            </div>
            <div class="item-details">
              <span class="item-name">${item.item}</span>
              ${item.notes ? `<span class="item-notes">(${item.notes})</span>` : ''}
            </div>
            <span class="item-qty">${item.quantity}</span>
          </div>
        `;
      });

      categoriesHtml += `
        <div class="category-block">
          <div class="category-header">
            <h3>${cat.name}</h3>
            <span class="badge">${cat.items?.length || 0} ${t('common_items').toUpperCase()}</span>
          </div>
          <div class="items-grid">
            ${itemsHtml}
          </div>
        </div>
      `;
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>NutriAI Grocery Shopping List - ${dietLabel}</title>
        <style>
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #0a192f;
            background: #ffffff;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #0284c7;
            padding-bottom: 12px;
            margin-bottom: 20px;
          }
          .brand {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .logo-box {
            width: 40px;
            height: 40px;
            background: #0284c7;
            color: white;
            font-weight: 900;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
          }
          .title {
            font-size: 22px;
            font-weight: 900;
            margin: 0;
            color: #0a192f;
          }
          .subtitle {
            font-size: 12px;
            color: #64748b;
            margin-top: 2px;
          }
          .meta-badge {
            background: #e0f2fe;
            color: #0369a1;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 800;
            border: 1px solid #bae6fd;
          }
          .category-block {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 14px;
            margin-bottom: 16px;
            page-break-inside: avoid;
          }
          .category-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 8px;
            margin-bottom: 10px;
          }
          .category-header h3 {
            margin: 0;
            font-size: 13px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #0f172a;
          }
          .badge {
            background: #dcfce7;
            color: #15803d;
            font-size: 10px;
            font-weight: 800;
            padding: 2px 8px;
            border-radius: 10px;
            border: 1px solid #bbf7d0;
          }
          .items-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 8px;
          }
          .item-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 12px;
          }
          .item-row.completed {
            background: #f1f5f9;
            text-decoration: line-through;
            color: #94a3b8;
          }
          .checkbox {
            width: 16px;
            height: 16px;
            border: 1.5px solid #0284c7;
            border-radius: 4px;
            margin-right: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: bold;
            color: #ffffff;
          }
          .checkbox.checked {
            background: #10b981;
            border-color: #10b981;
          }
          .item-details {
            display: flex;
            align-items: center;
            gap: 6px;
            flex: 1;
          }
          .item-name {
            font-weight: 700;
            color: #0f172a;
          }
          .item-notes {
            font-size: 10px;
            color: #64748b;
            font-style: italic;
          }
          .item-qty {
            font-weight: 800;
            color: #047857;
            background: #ecfdf5;
            padding: 3px 8px;
            border-radius: 6px;
            border: 1px solid #a7f3d0;
            font-size: 11px;
          }
          .footer {
            margin-top: 24px;
            padding-top: 12px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 10px;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">
            <div class="logo-box">Ψ</div>
            <div>
              <h1 class="title">AI Grocery Shopping List</h1>
              <p class="subtitle">NutriAI Clinical Nutrition & Meal Planning System</p>
            </div>
          </div>
          <div class="meta-badge">
            ${dietLabel} • ${dateStr}
          </div>
        </div>

        ${categoriesHtml}

        <div class="footer">
          <span>Generated by NutriAI Google Gemini AI Engine</span>
          <span>Official NutriAI Document</span>
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          }
        </script>
      </body>
      </html>
    `;

    printWin.document.open();
    printWin.document.write(htmlContent);
    printWin.document.close();
  };

  const currentDayData = weeklyPlan?.days?.[selectedDayIndex];
  const currentMeals = currentDayData?.meals || {};

  return (
    <DashboardLayout title={t('meal_page_title')} subtitle={t('meal_page_subtitle')}>
      {alert.show && (
        <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />
      )}

      {/* Controls Bar */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 mb-6 sm:mb-8 w-full max-w-full overflow-x-hidden text-[#0a192f]">
        {/* Diet Selector Pills */}
        <div className="grid grid-cols-3 gap-1 p-1.5 bg-slate-900/90 backdrop-blur-md rounded-2xl w-full xl:w-auto shadow-md border border-slate-800">
          {dietOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedDiet === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleDietChange(opt.value)}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer truncate ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 text-white shadow-md shadow-purple-500/25'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={14} className={`shrink-0 ${isSelected ? 'text-white' : opt.color}`} />
                <span className="truncate">{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full xl:w-auto">
          <Button
            onClick={handleGenerateShoppingList}
            loading={shoppingListLoading}
            icon={ShoppingCart}
            size="md"
            className="w-full sm:w-auto justify-center text-xs sm:text-sm py-2.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white font-bold rounded-2xl shadow-md shadow-emerald-500/20 border-0 cursor-pointer"
          >
            {t('meal_shopping_list_btn')}
          </Button>
          <Button
            onClick={handleGenerateAiRecipes}
            loading={recipesLoading}
            icon={Bot}
            size="md"
            className="w-full sm:w-auto justify-center text-xs sm:text-sm py-2.5 px-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-700 hover:to-sky-700 text-white font-bold rounded-2xl shadow-md shadow-purple-500/20 border-0 cursor-pointer"
          >
            {t('meal_generate_ai_btn')}
          </Button>
          <Button
            onClick={handleRegenerate}
            loading={regenerating}
            icon={RefreshCw}
            size="md"
            className="w-full sm:w-auto justify-center text-xs sm:text-sm py-2.5 px-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-700 hover:to-sky-700 text-white font-bold rounded-2xl shadow-md shadow-purple-500/25 border-0 cursor-pointer"
          >
            {t('meal_regenerate_btn')}
          </Button>
        </div>
      </div>

      {/* Gemini Generative Recipes Section */}
      {aiRecipes && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 sm:p-8 mb-6 sm:mb-8 border border-purple-200 bg-purple-50/50 rounded-3xl relative text-[#0a192f] shadow-md"
        >
          <div className="flex items-center justify-between gap-4 mb-5 pb-4 border-b border-purple-200/60">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-500/20 shrink-0">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-xl font-black text-[#0a192f] leading-tight">{t('meal_ai_recipes_title')}</h3>
                <p className="text-xs text-purple-700 font-bold">{t('meal_ai_recipes_subtitle')}</p>
              </div>
            </div>

            <button
              onClick={() => setAiRecipes(null)}
              className="p-2 rounded-full bg-white hover:bg-slate-100 border border-purple-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0"
              title="Close Recipes"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-white p-5 sm:p-7 rounded-2xl border border-purple-100/80 shadow-xs text-xs sm:text-sm text-slate-800 leading-relaxed">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-3.5 leading-relaxed font-semibold text-slate-700">{children}</p>,
                h1: ({ children }) => <h3 className="text-base sm:text-lg font-black text-[#0a192f] mt-4 mb-2 pb-1 border-b border-purple-100 flex items-center gap-2">{children}</h3>,
                h2: ({ children }) => <h3 className="text-base sm:text-lg font-black text-[#0a192f] mt-4 mb-2 pb-1 border-b border-purple-100 flex items-center gap-2">{children}</h3>,
                h3: ({ children }) => <h4 className="text-sm sm:text-base font-black text-purple-900 mt-4 mb-2 flex items-center gap-2 bg-purple-50 p-3 rounded-xl border border-purple-200/60"><Sparkles className="w-4 h-4 text-purple-600 shrink-0" />{children}</h4>,
                hr: () => <hr className="my-4 border-purple-100" />,
                ul: ({ children }) => <ul className="list-disc pl-5 mb-3.5 space-y-1.5 font-semibold text-slate-700">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-5 mb-3.5 space-y-1.5 font-semibold text-slate-700">{children}</ol>,
                li: ({ children }) => <li className="pl-1">{children}</li>,
                strong: ({ children }) => <strong className="font-black text-purple-950 bg-purple-50/80 px-1.5 py-0.5 rounded border border-purple-200/50">{children}</strong>,
              }}
            >
              {aiRecipes}
            </ReactMarkdown>
          </div>
        </motion.div>
      )}

      {/* Days Tabs (Scrollable Bar) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 sm:mb-8 custom-scrollbar max-w-full">
        {fullDayNames.map((day, idx) => {
          const isSelected = selectedDayIndex === idx;
          return (
            <button
              key={day}
              onClick={() => setSelectedDayIndex(idx)}
              className={`flex flex-col items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl border transition-all cursor-pointer shrink-0 min-w-[70px] sm:min-w-[90px] ${
                isSelected
                  ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 border-transparent text-white shadow-md shadow-purple-500/25 scale-105'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-wider opacity-80">{dayNames[idx]}</span>
              <span className="text-xs sm:text-sm font-bold mt-0.5">{day}</span>
            </button>
          );
        })}
      </div>

      {/* Meal Slot Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-80 rounded-3xl bg-slate-100 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          key={selectedDayIndex}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6"
        >
          {['breakfast', 'lunch', 'dinner', 'snack'].map((slot) => (
            <MealCard
              key={slot}
              slot={slot}
              meal={currentMeals[slot]}
              t={t}
              onMealClick={(meal) => {
                setSelectedMeal(meal);
                setSelectedSlot(slot);
                setModalImgFailed(false);
              }}
            />
          ))}
        </motion.div>
      )}

      {/* Full Recipe Modal */}
      {selectedMeal && createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-6 bg-[#0a192f]/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-2xl my-auto max-h-[85vh] sm:max-h-[88vh] flex flex-col overflow-hidden text-[#0a192f]"
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#0284c7] bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                  {selectedSlot}
                </span>
                {selectedMeal.recipe_ready_in && (
                  <span className="text-xs font-bold text-slate-500">
                    {selectedMeal.recipe_ready_in} {t('common_min')}
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedMeal(null)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0 shadow-xs"
                title="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-4 sm:space-y-5 custom-scrollbar">
              <div className="relative rounded-2xl overflow-hidden h-40 sm:h-52 bg-slate-100 border border-slate-200 shrink-0">
                {selectedMeal.recipe_image && !modalImgFailed ? (
                  <img
                    src={selectedMeal.recipe_image}
                    alt=""
                    onError={() => setModalImgFailed(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center relative overflow-hidden">
                    <Utensils size={48} className="text-slate-300" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f] via-[#0a192f]/40 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 z-10">
                  <h3 className="text-lg sm:text-2xl font-black text-white leading-tight drop-shadow-md">
                    {selectedMeal.recipe_title || selectedMeal.food_name}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
                <div>
                  <span className="text-[10px] sm:text-xs text-slate-500 font-bold block">{t('common_calories')}</span>
                  <span className="text-base sm:text-lg font-black text-amber-600">{Math.round(selectedMeal.calories || 0)} kcal</span>
                </div>
                <div>
                  <span className="text-[10px] sm:text-xs text-slate-500 font-bold block">{t('common_protein')}</span>
                  <span className="text-base sm:text-lg font-black text-emerald-600">{Math.round(selectedMeal.protein || 0)}g</span>
                </div>
                <div>
                  <span className="text-[10px] sm:text-xs text-slate-500 font-bold block">{t('common_carbs')}</span>
                  <span className="text-base sm:text-lg font-black text-[#0284c7]">{Math.round(selectedMeal.carbohydrates || 0)}g</span>
                </div>
                <div>
                  <span className="text-[10px] sm:text-xs text-slate-500 font-bold block">{t('common_fat')}</span>
                  <span className="text-base sm:text-lg font-black text-rose-600">{Math.round(selectedMeal.fat || 0)}g</span>
                </div>
              </div>

              {selectedMeal.recipe_ingredients && selectedMeal.recipe_ingredients.length > 0 && (
                <div>
                  <h4 className="text-base font-black text-[#0a192f] mb-2.5">{t('meal_ingredients')}</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-700">
                    {selectedMeal.recipe_ingredients.map((ing, i) => (
                      <li key={i} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-semibold">
                        <CheckCircle2 size={15} className="text-[#0284c7] shrink-0" />
                        <span>{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedMeal.recipe_instructions && selectedMeal.recipe_instructions.length > 0 && (
                <div>
                  <h4 className="text-base font-black text-[#0a192f] mb-2.5">{t('meal_cooking_instructions')}</h4>
                  <ol className="space-y-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                    {selectedMeal.recipe_instructions.map((step, i) => (
                      <li key={i} className="flex gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="w-5 h-5 rounded-lg bg-[#0a192f] text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed font-semibold">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </motion.div>
        </div>,
        document.body
      )}

      {/* AI Shopping List Modal */}
      {shoppingListModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto custom-scrollbar">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden my-auto max-h-[90vh] flex flex-col text-[#0a192f]"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-2xl font-black text-[#0a192f] leading-tight">
                    {t('meal_shopping_list_modal_title')}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {t('meal_shopping_list_subtitle')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShoppingListModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-5 custom-scrollbar mb-5">
              {shoppingListData?.categories?.map((cat, catIdx) => (
                <div key={catIdx} className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/60">
                    <h4 className="text-xs sm:text-sm font-black text-[#0a192f] uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      {cat.name}
                    </h4>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {cat.items?.length || 0} {t('common_items')}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {cat.items?.map((item, itemIdx) => {
                      const itemKey = `${catIdx}-${itemIdx}`;
                      const isChecked = checkedItems[itemKey];
                      return (
                        <div
                          key={itemIdx}
                          onClick={() => toggleCheckItem(itemKey)}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-emerald-50/60 border-emerald-200 text-slate-400 line-through'
                              : 'bg-white border-slate-200 text-slate-800 hover:border-emerald-300 shadow-xs'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                              isChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'
                            }`}>
                              {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </div>
                            <span className="text-xs sm:text-sm font-bold">{item.item}</span>
                          </div>
                          <div className="flex items-center gap-2 text-right shrink-0">
                            <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                              {item.quantity}
                            </span>
                            {item.notes && (
                              <span className="text-[10px] text-slate-400 italic hidden sm:inline">
                                ({item.notes})
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-4 border-t border-slate-100 shrink-0">
              <button
                onClick={handleCopyClipboard}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Copy className="w-4 h-4 text-slate-500" />
                <span>{copied ? t('meal_shopping_list_copied') : t('meal_shopping_list_copy_clipboard')}</span>
              </button>
              <button
                onClick={handlePrintPdf}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>{t('meal_shopping_list_print')}</span>
              </button>
              <button
                onClick={handleDownloadTxt}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{t('meal_shopping_list_download_txt')}</span>
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </DashboardLayout>
  );
}
