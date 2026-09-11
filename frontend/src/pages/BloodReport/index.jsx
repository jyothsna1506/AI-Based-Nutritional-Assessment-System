import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TestTube2, Send, Info } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { PageLoader } from '../../components/common/Loader';
import assessmentService from '../../services/assessmentService';
import { useLanguage } from '../../context/LanguageContext';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

export default function BloodReport() {
  const { t } = useLanguage();

  const bloodMarkers = [
    { key: 'hemoglobin', label: t('blood_marker_hemoglobin'), unit: 'g/dL', range: 'M: 13.5-17.5 | F: 12.0-16.0' },
    { key: 'iron', label: t('blood_marker_iron'), unit: 'µg/dL', range: '60 - 170' },
    { key: 'ferritin', label: t('blood_marker_ferritin'), unit: 'ng/mL', range: 'M: 20-500 | F: 20-200' },
    { key: 'vitamin_d', label: t('blood_marker_vitamin_d'), unit: 'ng/mL', range: '30 - 100' },
    { key: 'vitamin_b12', label: t('blood_marker_vitamin_b12'), unit: 'pg/mL', range: '200 - 900' },
    { key: 'calcium', label: t('blood_marker_calcium'), unit: 'mg/dL', range: '8.5 - 10.5' },
    { key: 'magnesium', label: t('blood_marker_magnesium'), unit: 'mg/dL', range: '1.7 - 2.2' },
    { key: 'zinc', label: t('blood_marker_zinc'), unit: 'µg/dL', range: '66 - 110' },
    { key: 'blood_sugar', label: t('blood_marker_blood_sugar'), unit: 'mg/dL', range: '70 - 100' },
    { key: 'cholesterol', label: t('blood_marker_cholesterol'), unit: 'mg/dL', range: '< 200' },
  ];

  const [form, setForm] = useState(() =>
    bloodMarkers.reduce((acc, m) => ({ ...acc, [m.key]: '' }), {})
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const reports = await assessmentService.getBloodReports();
        if (reports && reports.length > 0) {
          const last = reports[0];
          setForm(prev => {
            const filled = { ...prev };
            Object.keys(filled).forEach(key => {
              if (last[key] !== undefined && last[key] !== null) filled[key] = last[key];
            });
            return filled;
          });
        }
      } catch (err) {
        // No previous reports
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setAlert({ show: false, type: 'success', message: '' });
    try {
      const payload = {};
      Object.entries(form).forEach(([key, val]) => {
        if (val !== '' && val !== null) payload[key] = parseFloat(val);
      });
      await assessmentService.submitBloodReport(payload);
      setAlert({ show: true, type: 'success', message: t('blood_submit_success') });
    } catch (err) {
      setAlert({ show: true, type: 'error', message: err.response?.data?.detail || t('blood_submit_error') });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <DashboardLayout title={t('blood_title')}><PageLoader /></DashboardLayout>;

  return (
    <DashboardLayout title={t('blood_title')} subtitle={t('blood_subtitle')}>
      <Alert type={alert.type} message={alert.message} show={alert.show} onClose={() => setAlert({ ...alert, show: false })} />

      <div className="glass-card p-4 mb-6 mt-2 flex items-start gap-3 border border-sky-200 bg-sky-50/50 shadow-xs rounded-2xl">
        <Info className="w-5 h-5 text-[#0284c7] mt-0.5 shrink-0" />
        <p className="text-sm text-slate-700 font-medium">
          {t('blood_info_notice')}
        </p>
      </div>

      <div className="glass-card p-6 sm:p-8 mb-8 text-center rounded-3xl border-dashed border-2 border-slate-300 hover:border-[#0284c7] bg-white/95 transition-all shadow-sm">
        <h3 className="text-lg font-black text-[#0a192f] mb-2">{t('blood_autofill_title')}</h3>
        <p className="text-sm text-slate-600 font-semibold mb-4">{t('blood_autofill_subtitle')}</p>
        
        <input 
          type="file" 
          id="report-upload" 
          className="hidden" 
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            setAlert({ show: true, type: 'info', message: t('blood_analyzing') });
            try {
              const res = await assessmentService.parseBloodReport(file);
              if (res && res.extracted) {
                setForm(prev => ({ ...prev, ...res.extracted }));
                setAlert({ show: true, type: 'success', message: t('blood_parse_success') });
              }
            } catch (err) {
              setAlert({ show: true, type: 'error', message: err.response?.data?.detail || t('blood_parse_error') });
            }
          }} 
        />
        <label htmlFor="report-upload" className="cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-sky-50 border border-sky-200 text-[#0284c7] font-bold hover:bg-sky-100 transition-colors shadow-xs">
          <TestTube2 className="w-5 h-5" />
          {t('blood_select_file')}
        </label>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl text-[#0a192f]"
      >
        {bloodMarkers.map((marker) => (
          <motion.div key={marker.key} variants={item} className="glass-card p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <TestTube2 className="w-4 h-4 text-[#0284c7]" />
              <span className="text-sm font-black text-[#0a192f]">{marker.label}</span>
              <span className="text-xs text-slate-500 font-bold ml-auto">({marker.unit})</span>
            </div>
            <Input
              name={marker.key}
              type="number"
              placeholder={`Enter ${marker.label.toLowerCase()}`}
              value={form[marker.key] ?? ''}
              onChange={handleChange}
              step="0.1"
            />
            <p className="text-xs text-slate-500 font-semibold mt-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              {t('blood_normal_range')}: {marker.range}
            </p>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-8 flex justify-end max-w-4xl">
        <Button
          onClick={handleSubmit}
          loading={submitting}
          icon={Send}
          size="lg"
          className="bg-[#0a192f] hover:bg-[#0284c7] text-white font-bold shadow-md rounded-xl"
        >
          {t('blood_submit_btn')}
        </Button>
      </div>
    </DashboardLayout>
  );
}
