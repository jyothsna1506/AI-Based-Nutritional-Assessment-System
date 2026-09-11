import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Zap, Scissors, Activity, Droplets, Fingerprint,
  Frown, Sun, Bone, Eye, Clock, UtensilsCrossed,
  Brain, ShieldAlert, Send
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { PageLoader } from '../../components/common/Loader';
import assessmentService from '../../services/assessmentService';
import { useLanguage } from '../../context/LanguageContext';

const severityColors = [
  'text-slate-400', 'text-emerald-600', 'text-emerald-600',
  'text-amber-600', 'text-rose-600', 'text-rose-600'
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.03 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Symptoms() {
  const { t } = useLanguage();

  const symptomsList = [
    { key: 'fatigue', label: t('symptoms_fatigue'), icon: Zap },
    { key: 'hair_loss', label: t('symptoms_hair_loss'), icon: Scissors },
    { key: 'muscle_weakness', label: t('symptoms_muscle_weakness'), icon: Activity },
    { key: 'dry_skin', label: t('symptoms_dry_skin'), icon: Droplets },
    { key: 'brittle_nails', label: t('symptoms_brittle_nails'), icon: Fingerprint },
    { key: 'mood_changes', label: t('symptoms_mood_changes'), icon: Frown },
    { key: 'pale_skin', label: t('symptoms_pale_skin'), icon: Sun },
    { key: 'bone_pain', label: t('symptoms_bone_pain'), icon: Bone },
    { key: 'poor_vision', label: t('symptoms_poor_vision'), icon: Eye },
    { key: 'slow_healing', label: t('symptoms_slow_healing'), icon: Clock },
    { key: 'loss_of_appetite', label: t('symptoms_loss_of_appetite'), icon: UtensilsCrossed },
    { key: 'tingling', label: t('symptoms_tingling'), icon: Zap },
    { key: 'difficulty_concentrating', label: t('symptoms_difficulty_concentrating'), icon: Brain },
    { key: 'frequent_illness', label: t('symptoms_frequent_illness'), icon: ShieldAlert },
  ];

  const severityLabels = [
    t('symptoms_severity_none'),
    t('symptoms_severity_mild'),
    t('symptoms_severity_mild'),
    t('symptoms_severity_moderate'),
    t('symptoms_severity_severe'),
    t('symptoms_severity_severe'),
  ];

  const [symptoms, setSymptoms] = useState(() =>
    symptomsList.reduce((acc, s) => ({ ...acc, [s.key]: 0 }), {})
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const history = await assessmentService.getSymptomHistory();
        if (history && history.length > 0) {
          const last = history[0];
          const data = last.symptoms || last;
          setSymptoms(prev => {
            const filled = { ...prev };
            Object.keys(filled).forEach(key => {
              if (data[key] !== undefined && data[key] !== null) filled[key] = data[key];
            });
            return filled;
          });
        }
      } catch (err) {
        // No history, use defaults
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSlider = (key, value) => {
    setSymptoms(prev => ({ ...prev, [key]: parseInt(value) }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setAlert({ show: false, type: 'success', message: '' });
    try {
      await assessmentService.submitSymptoms(symptoms);
      setAlert({ show: true, type: 'success', message: t('symptoms_submit_success') });
    } catch (err) {
      setAlert({ show: true, type: 'error', message: err.response?.data?.detail || t('symptoms_submit_error') });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <DashboardLayout title={t('symptoms_title')}><PageLoader /></DashboardLayout>;

  return (
    <DashboardLayout title={t('symptoms_title')} subtitle={t('symptoms_subtitle')}>
      <Alert type={alert.type} message={alert.message} show={alert.show} onClose={() => setAlert({ ...alert, show: false })} />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mt-4 text-[#0a192f]"
      >
        {symptomsList.map((symptom) => {
          const val = symptoms[symptom.key] || 0;
          const Icon = symptom.icon;
          return (
            <motion.div key={symptom.key} variants={item} className="glass-card p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs group">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2.5 rounded-2xl transition-colors duration-300 ${
                  val === 0 ? 'bg-slate-100' : val <= 2 ? 'bg-emerald-50 border border-emerald-100' : val === 3 ? 'bg-amber-50 border border-amber-100' : 'bg-rose-50 border border-rose-100'
                }`}>
                  <Icon className={`w-5 h-5 ${severityColors[val]}`} />
                </div>
                <div>
                  <p className="text-sm font-black text-[#0a192f]">{symptom.label}</p>
                  <p className={`text-xs font-bold ${severityColors[val]}`}>{severityLabels[val]}</p>
                </div>
                <span className={`ml-auto text-lg font-black ${severityColors[val]}`}>{val}</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                value={val}
                onChange={(e) => handleSlider(symptom.key, e.target.value)}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${val === 0 ? '#cbd5e1' : val <= 2 ? '#10b981' : val <= 3 ? '#f59e0b' : '#f43f5e'} ${val * 20}%, #e2e8f0 ${val * 20}%)`,
                }}
              />
              <div className="flex justify-between mt-2">
                <span className="text-[10px] font-bold text-slate-400">0</span>
                <span className="text-[10px] font-bold text-slate-400">5</span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="mt-8 flex justify-end">
        <Button
          onClick={handleSubmit}
          loading={submitting}
          icon={Send}
          size="lg"
          className="bg-[#0a192f] hover:bg-[#0284c7] text-white font-bold shadow-md rounded-xl"
        >
          {t('symptoms_submit_btn')}
        </Button>
      </div>
    </DashboardLayout>
  );
}
