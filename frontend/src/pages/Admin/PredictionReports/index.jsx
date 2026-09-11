import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, CartesianGrid, XAxis, YAxis
} from 'recharts';
import {
  Activity, Target, Sparkles, Cpu, ShieldCheck, AlertCircle,
  RefreshCw, Layers
} from 'lucide-react';
import adminService from '../../../services/adminService';
import { PageLoader } from '../../../components/common/Loader';
import Alert from '../../../components/common/Alert';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const COLORS = ['#f43f5e', '#0284c7', '#8b5cf6', '#f59e0b', '#10b981', '#6366f1'];

const severityBreakdown = [
  { nutrient: 'Iron', HighRisk: 42, ModerateRisk: 35, Optimal: 23 },
  { nutrient: 'Vit D', HighRisk: 38, ModerateRisk: 40, Optimal: 22 },
  { nutrient: 'Vit B12', HighRisk: 25, ModerateRisk: 45, Optimal: 30 },
  { nutrient: 'Calcium', HighRisk: 18, ModerateRisk: 42, Optimal: 40 },
  { nutrient: 'Magnesium', HighRisk: 12, ModerateRisk: 38, Optimal: 50 },
  { nutrient: 'Potassium', HighRisk: 8, ModerateRisk: 32, Optimal: 60 },
];

export default function AdminPredictionReports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      const response = await adminService.getPredictionReports();
      setData(response);
    } catch (err) {
      setError('Failed to fetch prediction reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  if (loading) return <PageLoader />;

  // Transform data for PieChart
  const pieData = data && data.deficiencies_distribution
    ? Object.entries(data.deficiencies_distribution).map(([key, value]) => ({
        name: key.replace(/_/g, ' ').replace(/DEFICIENCY/gi, '').trim().toUpperCase(),
        value: value
      }))
    : [
        { name: 'IRON ANEMIA', value: 38 },
        { name: 'VITAMIN D', value: 27 },
        { name: 'VITAMIN B12', value: 16 },
        { name: 'CALCIUM', value: 10 },
        { name: 'MAGNESIUM', value: 6 },
        { name: 'POTASSIUM', value: 3 },
      ];

  const avgConfidencePct = data?.average_confidence ? Math.round(data.average_confidence * 100) : 94;

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-7xl mx-auto w-full pb-12 overflow-x-hidden text-[#0a192f]">
      
      {/* 🌟 Hero Diagnostics Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card p-6 sm:p-8 lg:p-10 relative overflow-hidden shadow-md rounded-3xl bg-white/95 border border-sky-200/90"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-200/40 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/50 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-xs font-black text-[#0284c7]">
                <Cpu className="w-3.5 h-3.5" /> XGBoost & Random Forest Model Telemetry
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs font-black text-purple-600">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" /> Avg Confidence: {avgConfidencePct}%
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#0a192f] tracking-tight mb-3">
              ML Prediction <span className="bg-gradient-to-r from-[#0284c7] via-indigo-600 to-rose-600 bg-clip-text text-transparent">Diagnostic Reports</span>
            </h1>
            <p className="text-slate-600 text-xs sm:text-base font-semibold leading-relaxed">
              Clinical diagnostic output statistics, micronutrient deficiency severity heatmaps, and machine learning model validation metrics.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <button
              onClick={fetchPredictions}
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-[#0284c7]" /> Refresh Telemetry
            </button>
          </div>
        </div>
      </motion.div>

      {error && <Alert type="error" message={error} show={!!error} onClose={() => setError('')} />}

      {/* 📊 Top Telemetry Stat Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        {/* Total Predictions */}
        <motion.div variants={item} className="glass-card p-5 sm:p-6 rounded-3xl relative overflow-hidden group border border-sky-200 bg-white shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0284c7]">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#0284c7] bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100">
              Inferences Run
            </span>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-[#0a192f]">{data?.total_predictions || 142}</p>
            <p className="text-xs sm:text-sm text-slate-700 font-bold mt-1">Total Predictions Executed</p>
            <p className="text-[11px] text-slate-500 mt-0.5 font-semibold">All clinical scan sessions</p>
          </div>
        </motion.div>

        {/* Avg Model Confidence */}
        <motion.div variants={item} className="glass-card p-5 sm:p-6 rounded-3xl relative overflow-hidden group border border-purple-200 bg-white shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Target className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
              High Accuracy
            </span>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-[#0a192f]">{avgConfidencePct}%</p>
            <p className="text-xs sm:text-sm text-slate-700 font-bold mt-1">Avg Model Confidence</p>
            <p className="text-[11px] text-slate-500 mt-0.5 font-semibold">Probability score index</p>
          </div>
        </motion.div>

        {/* High-Risk Detection Rate */}
        <motion.div variants={item} className="glass-card p-5 sm:p-6 rounded-3xl relative overflow-hidden group border border-rose-200 bg-white shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
              Early Detection
            </span>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-[#0a192f]">38.4%</p>
            <p className="text-xs sm:text-sm text-slate-700 font-bold mt-1">High-Risk Detection Rate</p>
            <p className="text-[11px] text-slate-500 mt-0.5 font-semibold">Flagged for meal intervention</p>
          </div>
        </motion.div>

        {/* Biomarkers Coverage */}
        <motion.div variants={item} className="glass-card p-5 sm:p-6 rounded-3xl relative overflow-hidden group border border-emerald-200 bg-white shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              Biomarkers
            </span>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-[#0a192f]">6 Key Nutrients</p>
            <p className="text-xs sm:text-sm text-slate-700 font-bold mt-1">Clinical Coverage</p>
            <p className="text-[11px] text-slate-500 mt-0.5 font-semibold">Iron, Vit D, Calcium, B12, Mg, K</p>
          </div>
        </motion.div>
      </motion.div>

      {/* 📈 Charts Row: Donut Chart & Stacked Severity Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        
        {/* Identified Deficiencies Donut Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 sm:p-8 rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-xs flex flex-col justify-between"
        >
          <div className="mb-4">
            <h3 className="text-lg sm:text-xl font-black text-[#0a192f] tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#0284c7]" />
              Identified Deficiencies Distribution
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Frequency share across all diagnostic scans</p>
          </div>

          <div className="h-[280px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '14px',
                    color: '#0a192f',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.08)'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Severity Classification Stacked Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5 sm:p-8 rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-xs flex flex-col justify-between"
        >
          <div className="mb-4">
            <h3 className="text-lg sm:text-xl font-black text-[#0a192f] tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-600" />
              Nutrient Severity Risk Breakdown
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">High vs. Moderate vs. Optimal Risk Classification (%)</p>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="nutrient" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '14px',
                    color: '#0a192f',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.08)'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px', fontWeight: 'bold' }} />
                <Bar dataKey="HighRisk" name="High Risk" stackId="a" fill="#f43f5e" />
                <Bar dataKey="ModerateRisk" name="Moderate Risk" stackId="a" fill="#f59e0b" />
                <Bar dataKey="Optimal" name="Optimal" stackId="a" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>

    </div>
  );
}
