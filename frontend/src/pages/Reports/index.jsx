import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import html2pdf from 'html2pdf.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import {
  TrendingUp, Activity, Target, CalendarDays, TestTube2, AlertCircle,
  Clock, Sparkles, ArrowRight, Download, FileText, Printer, Eye, X, CheckCircle2, ShieldCheck, Utensils, Trash2
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { PageLoader } from '../../components/common/Loader';
import assessmentService from '../../services/assessmentService';
import { saveOfflinePredictions, getOfflinePredictions } from '../../utils/offlineStorage';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

function StatCard({ icon: Icon, label, value, sub, color, border, aiVerifiedLabel }) {
  return (
    <motion.div
      variants={item}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`glass-card p-5 sm:p-6 rounded-3xl relative overflow-hidden group border ${border} bg-white shadow-xs`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-2xl ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider text-[#0284c7] bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
          {aiVerifiedLabel}
        </span>
      </div>
      <div>
        <p className="text-2xl sm:text-3xl font-black text-[#0a192f] tracking-tight leading-tight">{value}</p>
        <p className="text-xs sm:text-sm text-slate-700 font-bold mt-1">{label}</p>
        {sub && <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 font-semibold">{sub}</p>}
      </div>
    </motion.div>
  );
}

export default function Reports() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedView, setSelectedView] = useState('chart');
  
  // Selected Report Modal State
  const [selectedReport, setSelectedReport] = useState(null);

  // Clear History Modal State
  const [clearingHistory, setClearingHistory] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleConfirmClearHistory = async () => {
    try {
      setClearingHistory(true);
      await assessmentService.clearPredictions();
      saveOfflinePredictions([]);
      setPredictions([]);
      setShowClearConfirm(false);
    } catch (err) {
      console.error('Failed to clear diagnostic history:', err);
    } finally {
      setClearingHistory(false);
    }
  };

  const RISK_LABELS = {
    iron_risk: { label: t('reports_risk_iron') || 'Iron Deficiency', color: '#f43f5e', border: 'border-rose-200', bg: 'bg-rose-50', text: 'text-rose-600', foods: ['Spinach', 'Lentils', 'Tofu', 'Beans', 'Pumpkin Seeds'] },
    vitamin_d_risk: { label: t('reports_risk_vitamin_d') || 'Vitamin D Deficiency', color: '#0284c7', border: 'border-sky-200', bg: 'bg-sky-50', text: 'text-[#0284c7]', foods: ['Fortified Milk', 'Fatty Fish', 'Egg Yolks', 'Sunlight (15m)'] },
    calcium_risk: { label: t('reports_risk_calcium') || 'Calcium Deficiency', color: '#8b5cf6', border: 'border-purple-200', bg: 'bg-purple-50', text: 'text-purple-600', foods: ['Dairy / Yogurt', 'Sesame Seeds', 'Almonds', 'Broccoli'] },
    magnesium_risk: { label: t('reports_risk_magnesium') || 'Magnesium Deficiency', color: '#f59e0b', border: 'border-amber-200', bg: 'bg-amber-50', text: 'text-amber-600', foods: ['Dark Chocolate', 'Almonds', 'Cashews', 'Whole Grains'] },
    potassium_risk: { label: t('reports_risk_potassium') || 'Potassium Deficiency', color: '#10b981', border: 'border-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-600', foods: ['Bananas', 'Coconut Water', 'Potatoes', 'Oranges'] },
    vitamin_b12_risk: { label: t('reports_risk_b12') || 'Vitamin B12 Deficiency', color: '#6366f1', border: 'border-indigo-200', bg: 'bg-indigo-50', text: 'text-indigo-600', foods: ['Eggs', 'Milk / Cheese', 'Nutritional Yeast', 'Fortified Cereals'] },
  };

  function getRiskStatus(score) {
    if (score > 0.6) return { label: t('common_high_risk') || 'HIGH RISK', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', bar: 'bg-rose-500' };
    if (score > 0.3) return { label: t('common_moderate_risk') || 'MODERATE RISK', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', bar: 'bg-amber-400' };
    return { label: t('common_low_risk') || 'OPTIMAL / LOW RISK', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', bar: 'bg-emerald-500' };
  }

  useEffect(() => {
    const load = async () => {
      try {
        const preds = await assessmentService.getPredictions();
        setPredictions(preds || []);
        saveOfflinePredictions(preds);
      } catch (err) {
        console.error('Failed to load predictions:', err);
        const cached = getOfflinePredictions();
        if (cached) {
          setPredictions(cached);
        } else {
          setError(t('reports_load_error'));
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // 🖨️ Direct PDF Download Function via html2pdf
  const handlePrintPDF = async (report) => {
    const targetReport = report || predictions[0];
    if (!targetReport) return;

    const patientName = user?.full_name || user?.name || user?.email?.split('@')[0] || 'Patient';
    const dateStr = new Date(targetReport.prediction_date || Date.now()).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const confidencePct = Math.round((targetReport.confidence_score || 0.85) * 100);

    const rowsHtml = Object.entries(RISK_LABELS).map(([key, info]) => {
      const val = targetReport[key] || 0;
      const pct = Math.round(val * 100);
      const status = getRiskStatus(val);
      return `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 12px; font-weight: bold; color: #0a192f; font-size: 12px; vertical-align: middle;">${info.label}</td>
          <td style="padding: 10px 12px; font-weight: bold; color: #0284c7; font-size: 12px; vertical-align: middle;">${pct}%</td>
          <td style="padding: 10px 12px; vertical-align: middle;"><span style="display: inline-block; white-space: nowrap; background: ${val > 0.6 ? '#ffe4e6' : val > 0.3 ? '#fef3c7' : '#d1fae5'}; color: ${val > 0.6 ? '#e11d48' : val > 0.3 ? '#d97706' : '#059669'}; font-weight: 800; padding: 4px 10px; border-radius: 9999px; font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.3px;">${status.label}</span></td>
          <td style="padding: 10px 12px; color: #475569; font-size: 11px; font-weight: 600; vertical-align: middle;">${info.foods.join(', ')}</td>
        </tr>
      `;
    }).join('');

    const element = document.createElement('div');
    element.style.padding = '30px';
    element.style.fontFamily = "'Segoe UI', Roboto, Helvetica, sans-serif";
    element.style.color = '#0a192f';
    element.style.background = '#ffffff';
    element.style.width = '800px';

    element.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0284c7; padding-bottom: 15px; margin-bottom: 20px;">
        <div>
          <div style="font-size: 24px; font-weight: 900; color: #0a192f;">Nutri<span style="color: #0284c7;">AI</span> Clinical Health</div>
          <div style="font-size: 11px; color: #64748b; font-weight: 700; margin-top: 2px;">Precision Metabolic & Nutritional Assessment System</div>
        </div>
        <div style="text-align: right; font-size: 11px; color: #64748b;">
          <div style="font-weight: 900; color: #0a192f; font-size: 13px;">OFFICIAL DIAGNOSTIC REPORT</div>
          <div>Report ID: #${targetReport.id || 'NUTR-2026'}</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #f8fafc; padding: 15px; border-radius: 14px; margin-bottom: 20px; border: 1px solid #e2e8f0; font-size: 12px;">
        <div><strong>Patient Name:</strong> ${patientName}</div>
        <div><strong>Assessment Date:</strong> ${dateStr}</div>
        <div><strong>AI Telemetry:</strong> Gemini 2.0 Clinical Risk Engine</div>
        <div><strong>Model Confidence:</strong> <span style="color: #059669; font-weight: 800;">${confidencePct}% Verified</span></div>
      </div>

      <div style="font-size: 15px; font-weight: 900; color: #0a192f; margin-bottom: 10px; border-left: 4px solid #0284c7; padding-left: 10px;">
        Micro-Nutrient Risk & Biomarker Assessment
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; text-align: left;">
        <thead>
          <tr style="background: #0a192f; color: #ffffff;">
            <th style="padding: 10px 12px; font-size: 11px; text-transform: uppercase; width: 24%;">Biomarker / Nutrient</th>
            <th style="padding: 10px 12px; font-size: 11px; text-transform: uppercase; width: 14%;">Predicted Risk</th>
            <th style="padding: 10px 12px; font-size: 11px; text-transform: uppercase; width: 24%;">Classification</th>
            <th style="padding: 10px 12px; font-size: 11px; text-transform: uppercase; width: 38%;">Clinical Dietary Countermeasures</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div style="font-size: 15px; font-weight: 900; color: #0a192f; margin-bottom: 10px; border-left: 4px solid #0284c7; padding-left: 10px;">
        Clinical Action Plan & Recommendations
      </div>

      <div style="background: #f0f9ff; padding: 15px; border-radius: 14px; border: 1px solid #bae6fd; font-size: 12px; line-height: 1.6; color: #0369a1;">
        <p style="margin: 0; font-weight: 700;">
          <strong>Targeted Countermeasures:</strong> Increase dietary consumption of foods highlighted above for moderate and high risk biomarkers. Maintain daily hydration target of 2.5L+ to optimize nutrient bioavailability, and schedule a routine blood screening panel every 60-90 days.
        </p>
      </div>

      <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 12px; text-align: center; font-size: 10px; color: #94a3b8; font-weight: 600;">
        NutriAI Health Systems • Certified Clinical Decision Support • Confidential Medical Record
      </div>
    `;

    const sanitizeFilename = patientName.replace(/[^a-zA-Z0-9]/g, '_');
    const opt = {
      margin: 8,
      filename: `NutriAI_Clinical_Report_${sanitizeFilename}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('PDF export failed:', err);
    }
  };

  // 📊 CSV Export Function
  const handleExportCSV = () => {
    if (!predictions || predictions.length === 0) return;

    const headers = ['Report_ID', 'Date', 'Iron_Risk_%', 'Vitamin_D_Risk_%', 'Calcium_Risk_%', 'Magnesium_Risk_%', 'Potassium_Risk_%', 'Vitamin_B12_Risk_%', 'Confidence_Score_%'];
    const rows = predictions.map((p, idx) => [
      `#${predictions.length - idx}`,
      new Date(p.prediction_date).toLocaleDateString(),
      Math.round((p.iron_risk || 0) * 100),
      Math.round((p.vitamin_d_risk || 0) * 100),
      Math.round((p.calcium_risk || 0) * 100),
      Math.round((p.magnesium_risk || 0) * 100),
      Math.round((p.potassium_risk || 0) * 100),
      Math.round((p.vitamin_b12_risk || 0) * 100),
      Math.round((p.confidence_score || 0.85) * 100),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NutriAI_Assessment_History_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 💾 JSON Export Function
  const handleDownloadJSON = (report) => {
    const targetReport = report || predictions[0];
    if (!targetReport) return;

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(targetReport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `NutriAI_Report_${targetReport.id || 'export'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (loading) return <DashboardLayout title={t('reports_title')}><PageLoader /></DashboardLayout>;

  const latest = predictions[0];

  const chartData = [...predictions].reverse().map((p, idx) => ({
    name: `Test #${idx + 1}`,
    date: new Date(p.prediction_date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    Iron: Math.round((p.iron_risk || 0) * 100),
    'Vitamin D': Math.round((p.vitamin_d_risk || 0) * 100),
    Calcium: Math.round((p.calcium_risk || 0) * 100),
    Magnesium: Math.round((p.magnesium_risk || 0) * 100),
    Potassium: Math.round((p.potassium_risk || 0) * 100),
    B12: Math.round((p.vitamin_b12_risk || 0) * 100),
  }));

  const highRiskCount = latest
    ? Object.keys(RISK_LABELS).filter((k) => (latest[k] || 0) > 0.6).length
    : 0;
  const latestConfidence = latest ? Math.round((latest.confidence_score || 0) * 100) : 0;

  return (
    <DashboardLayout title={t('reports_title')} subtitle={t('reports_subtitle')}>
      <div className="flex flex-col gap-6 sm:gap-8 max-w-7xl mx-auto w-full overflow-x-hidden pb-12 text-[#0a192f]">

        {/* 🌟 Hero Header Banner */}
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
              <div className="inline-flex items-center gap-2 mb-3 sm:mb-4 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-xs font-black text-purple-600">
                <Sparkles className="w-3.5 h-3.5" />
                {t('reports_hero_badge')}
              </div>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#0a192f] tracking-tight mb-3">
                {t('reports_hero_title1')} <span className="bg-gradient-to-r from-purple-600 via-[#0284c7] to-rose-600 bg-clip-text text-transparent">{t('reports_hero_title2')}</span>
              </h2>
              <p className="text-slate-600 text-xs sm:text-base font-semibold leading-relaxed">
                {t('reports_hero_subtitle')}
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
              {predictions.length > 0 && (
                <>
                  <button
                    onClick={() => handlePrintPDF(latest)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-700 hover:to-sky-700 shadow-md shadow-purple-500/25 transition-all cursor-pointer border-0"
                  >
                    <Printer className="w-4 h-4 text-white" />
                    Download PDF Report
                  </button>

                  <button
                    onClick={handleExportCSV}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-[#0284c7]" />
                    Export CSV
                  </button>
                </>
              )}

              <Link
                to="/prediction"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-[#0284c7] bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-all cursor-pointer"
              >
                <Activity className="w-4 h-4" />
                {t('reports_hero_btn_run')}
              </Link>
            </div>
          </div>
        </motion.div>

        {/* 📊 Summary Metric Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6"
        >
          <StatCard
            icon={Activity}
            label={t('reports_stat_total_label')}
            value={predictions.length}
            sub={t('reports_stat_total_sub')}
            color="bg-sky-50 text-[#0284c7]"
            border="border-sky-200"
            aiVerifiedLabel={t('reports_ai_verified')}
          />
          <StatCard
            icon={AlertCircle}
            label={t('reports_stat_high_label')}
            value={highRiskCount}
            sub={latest ? t('reports_stat_high_in_latest') : t('reports_stat_high_no_data')}
            color="bg-rose-50 text-rose-600"
            border="border-rose-200"
            aiVerifiedLabel={t('reports_ai_verified')}
          />
          <StatCard
            icon={Target}
            label={t('reports_stat_confidence_label')}
            value={latest ? `${latestConfidence}%` : '—'}
            sub={t('reports_stat_confidence_sub')}
            color="bg-purple-50 text-purple-600"
            border="border-purple-200"
            aiVerifiedLabel={t('reports_ai_verified')}
          />
          <StatCard
            icon={Clock}
            label={t('reports_stat_date_label')}
            value={latest ? new Date(latest.prediction_date).toLocaleDateString() : '—'}
            sub={latest ? new Date(latest.prediction_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : t('reports_stat_date_run')}
            color="bg-amber-50 text-amber-600"
            border="border-amber-200"
            aiVerifiedLabel={t('reports_ai_verified')}
          />
        </motion.div>

        {predictions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-10 sm:p-16 text-center rounded-3xl border border-dashed border-slate-300 bg-white"
          >
            <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center mx-auto mb-4 text-purple-600">
              <Activity className="w-8 h-8" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#0a192f] mb-2">{t('reports_empty_title')}</h3>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold max-w-md mx-auto mb-6 leading-relaxed">
              {t('reports_empty_desc')}
            </p>
            <Link
              to="/prediction"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#0a192f] hover:bg-[#0284c7] text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md transition-all"
            >
              {t('reports_empty_btn')} <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-6 sm:gap-8">

            {/* 📈 Interactive Deficiency Risk Trend Analytics Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-5 sm:p-8 rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-[#0a192f] tracking-tight flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#0284c7]" />
                    {t('reports_chart_title')}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">{t('reports_chart_subtitle')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedView('chart')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedView === 'chart' ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 text-white shadow-md shadow-purple-500/25' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {t('reports_chart_btn_area')}
                  </button>
                  <button
                    onClick={() => setSelectedView('cards')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedView === 'cards' ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 text-white shadow-md shadow-purple-500/25' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {t('reports_chart_btn_cards')}
                  </button>
                </div>
              </div>

              {selectedView === 'chart' ? (
                <div className="h-[320px] sm:h-[380px] w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorIron" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorVitD" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorB12" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="%" domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderColor: '#cbd5e1',
                          borderRadius: '16px',
                          color: '#0a192f',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px', fontWeight: 'bold' }} />
                      <Area type="monotone" dataKey="Iron" stroke="#f43f5e" fillOpacity={1} fill="url(#colorIron)" strokeWidth={2.5} />
                      <Area type="monotone" dataKey="Vitamin D" stroke="#0284c7" fillOpacity={1} fill="url(#colorVitD)" strokeWidth={2.5} />
                      <Area type="monotone" dataKey="B12" stroke="#6366f1" fillOpacity={1} fill="url(#colorB12)" strokeWidth={2.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  {Object.entries(RISK_LABELS).map(([key, info]) => {
                    const score = latest ? latest[key] || 0 : 0;
                    const status = getRiskStatus(score);
                    const pct = Math.round(score * 100);
                    return (
                      <motion.div
                        key={key}
                        whileHover={{ scale: 1.02 }}
                        className={`p-4 rounded-2xl bg-white border ${info.border} space-y-3 shadow-xs`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-black ${info.text}`}>{info.label}</span>
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-2xl font-black text-[#0a192f]">{pct}%</span>
                          <span className="text-xs text-slate-500 font-bold">{t('reports_chart_risk_score')}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <div className={`h-full rounded-full ${status.bar}`} style={{ width: `${pct}%` }} />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* 📋 Comprehensive Assessment History Timeline Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-5 sm:p-8 rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-600 shrink-0">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-[#0a192f] tracking-tight">{t('reports_history_title')}</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">{predictions.length} {t('reports_history_subtitle')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                  <button
                    onClick={handleExportCSV}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#0284c7] bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-all cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export CSV Spreadsheet
                  </button>
                  {predictions.length > 0 && (
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer shadow-xs"
                      title="Clear Diagnostic History"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear History
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto custom-scrollbar -mx-5 px-5 sm:mx-0 sm:px-0">
                <table className="w-full min-w-[850px] text-xs sm:text-sm text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-black uppercase text-[11px] tracking-wider border-b border-slate-200">
                      <th className="py-3 px-4 rounded-l-xl">{t('reports_table_session')}</th>
                      <th className="py-3 px-4">{t('reports_table_date')}</th>
                      <th className="py-3 px-4 text-rose-600">{t('reports_table_iron')}</th>
                      <th className="py-3 px-4 text-[#0284c7]">{t('reports_table_vitd')}</th>
                      <th className="py-3 px-4 text-purple-600">{t('reports_table_calcium')}</th>
                      <th className="py-3 px-4 text-amber-600">{t('reports_table_magnesium')}</th>
                      <th className="py-3 px-4 text-emerald-600">{t('reports_table_potassium')}</th>
                      <th className="py-3 px-4 text-indigo-600">{t('reports_table_b12')}</th>
                      <th className="py-3 px-4">{t('reports_table_confidence')}</th>
                      <th className="py-3 px-4 text-right rounded-r-xl">Actions / Reports</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {predictions.map((pred, idx) => {
                      const conf = Math.round((pred.confidence_score || 0.85) * 100);
                      const getRiskStatus = (val) => {
                        if (val > 0.6) return { color: 'text-rose-600' };
                        if (val > 0.3) return { color: 'text-amber-600' };
                        return { color: 'text-emerald-600' };
                      };
                      return (
                        <tr key={pred.id || idx} className="hover:bg-sky-50/50 transition-all group">
                          <td className="py-4 px-4 font-black text-slate-500 group-hover:text-[#0a192f]">
                            #{predictions.length - idx}
                          </td>
                          <td className="py-4 px-4 font-bold text-slate-700 whitespace-nowrap">
                            {new Date(pred.prediction_date).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          {['iron_risk', 'vitamin_d_risk', 'calcium_risk', 'magnesium_risk', 'potassium_risk', 'vitamin_b12_risk'].map((key) => {
                            const val = Math.round((pred[key] || 0) * 100);
                            const status = getRiskStatus(pred[key] || 0);
                            return (
                              <td key={key} className={`py-4 px-4 font-black ${status.color}`}>
                                {val}%
                              </td>
                            );
                          })}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                              conf > 60 ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                              'bg-amber-50 text-amber-600 border border-amber-200'
                            }`}>
                              {conf}%
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => setSelectedReport(pred)}
                                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-[#0a192f] text-slate-700 hover:text-white font-bold transition-all text-xs flex items-center gap-1 cursor-pointer shadow-xs"
                                title="View Detailed Report"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Details</span>
                              </button>
                              <button
                                onClick={() => handlePrintPDF(pred)}
                                className="px-2.5 py-1.5 rounded-xl bg-sky-50 hover:bg-[#0284c7] text-[#0284c7] hover:text-white font-bold transition-all text-xs flex items-center gap-1 cursor-pointer border border-sky-200 shadow-xs"
                                title="Download PDF Report"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>PDF</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>

          </div>
        )}
        {/* 📑 Detailed Clinical Assessment Report Modal */}
        {selectedReport && createPortal(
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-6 bg-[#0a192f]/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-2xl my-auto max-h-[88vh] flex flex-col overflow-hidden text-[#0a192f]"
            >
              {/* Sticky Header Bar */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#0a192f] flex items-center justify-center text-white shadow-md shrink-0">
                    <FileText className="w-5 h-5 text-[#0284c7]" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-[#0a192f] leading-tight">
                      Detailed Clinical Assessment Report
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold">
                      ID: #{selectedReport.id || 'NUTR-2026'} • {new Date(selectedReport.prediction_date).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Report Content */}
              <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-5 custom-scrollbar">

                {/* Patient & Model Telemetry Badge Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Patient</span>
                    <span className="text-xs sm:text-sm font-black text-[#0a192f]">{user?.full_name || user?.email?.split('@')[0] || 'Patient'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">AI Model</span>
                    <span className="text-xs sm:text-sm font-black text-[#0284c7]">Gemini 2.0 Risk Engine</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Confidence</span>
                    <span className="text-xs sm:text-sm font-black text-emerald-600">{Math.round((selectedReport.confidence_score || 0.85) * 100)}% Verified</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Date & Time</span>
                    <span className="text-xs font-bold text-slate-700">{new Date(selectedReport.prediction_date).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Biomarker Risk Analysis Grid */}
                <div>
                  <h4 className="text-sm font-black text-[#0a192f] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#0284c7]" />
                    Biomarker Deficiency Risk Analysis
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(RISK_LABELS).map(([key, info]) => {
                      const val = selectedReport[key] || 0;
                      const pct = Math.round(val * 100);
                      const status = getRiskStatus(val);
                      return (
                        <div key={key} className={`p-4 rounded-2xl bg-white border ${info.border} space-y-2 shadow-xs`}>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-[#0a192f]">{info.label}</span>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                              {status.label}
                            </span>
                          </div>
                          <div className="flex items-baseline justify-between">
                            <span className="text-xl font-black text-[#0a192f]">{pct}%</span>
                            <span className="text-[10px] font-bold text-slate-500">Risk Score</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                            <div className={`h-full rounded-full ${status.bar}`} style={{ width: `${pct}%` }} />
                          </div>
                          <div className="pt-1.5 border-t border-slate-100 text-[11px] font-semibold text-slate-600">
                            <strong className="text-[#0284c7]">Target Foods:</strong> {info.foods.slice(0, 3).join(', ')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Clinical Recommendations & Action Items */}
                <div className="bg-sky-50/70 p-4 sm:p-5 rounded-2xl border border-sky-200 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#0284c7] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Targeted Clinical Dietary Recommendations
                  </h4>
                  <ul className="space-y-2 text-xs sm:text-sm font-semibold text-slate-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Increase dietary intake of key micronutrients identified with moderate/high risk scores.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Maintain consistent daily hydration (2.5L+ target) for optimal metabolic bioavailability.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Schedule periodic blood lab follow-up every 60 to 90 days to monitor biomarker trends.</span>
                    </li>
                  </ul>
                </div>

              </div>

              {/* Footer Action Buttons */}
              <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 pt-4 mt-2 border-t border-slate-100 shrink-0">
                <button
                  onClick={() => handleDownloadJSON(selectedReport)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Raw JSON
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer flex-1 sm:flex-none"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handlePrintPDF(selectedReport)}
                    className="px-5 py-2.5 rounded-xl bg-[#0a192f] hover:bg-[#0284c7] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer flex-1 sm:flex-none"
                  >
                    <Printer className="w-4 h-4 text-sky-400" />
                    Download Official PDF Report
                  </button>
                </div>
              </div>

            </motion.div>
          </div>,
          document.body
        )}

        {/* ⚠️ Clear History Confirmation Modal */}
        {showClearConfirm && createPortal(
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl my-auto text-slate-900"
            >
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">Clear Diagnostic History?</h3>
                  <p className="text-xs text-rose-600 font-bold">This action cannot be undone</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 font-semibold mb-6 leading-relaxed">
                Are you sure you want to delete all <strong className="text-slate-900">{predictions.length} recorded diagnostic sessions</strong>? All past biomarker predictions and clinical risk reports will be permanently removed.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="w-1/2 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={clearingHistory}
                  onClick={handleConfirmClearHistory}
                  className="w-1/2 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 cursor-pointer disabled:opacity-50"
                >
                  {clearingHistory ? 'Clearing...' : 'Yes, Clear All'}
                </button>
              </div>
            </motion.div>
          </div>,
          document.body
        )}

      </div>
    </DashboardLayout>
  );
}
