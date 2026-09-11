import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Save, User, Heart, Dumbbell, Shield, Leaf, Activity,
  Zap, Flame, Droplets, Check, Sparkles, Scale
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Input from '../../components/common/Input';
import { Select } from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { PageLoader } from '../../components/common/Loader';
import profileService from '../../services/profileService';
import { useLanguage } from '../../context/LanguageContext';

const defaultForm = {
  age: '', gender: '', height_cm: '', weight_kg: '',
  activity_level: '', dietary_preference: '', sleep_hours: '7',
  smoking: 'No', alcohol: 'No',
  health_goals: [], medical_conditions: [], allergies: [],
};

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const cardVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } } };

function SectionHeader({ icon: Icon, title, colorClass, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-xs ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h3 className="text-base font-black text-[#0a192f] leading-tight">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 font-semibold mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function TogglePill({ label, selected, onClick, icon: Icon }) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer border ${
        selected
          ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 text-white border-transparent shadow-md shadow-purple-500/25'
          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 border-slate-200'
      }`}
    >
      {Icon && <Icon className="w-3.5 h-3.5 text-white" />}
      <span>{label}</span>
      {selected && (
        <div className="w-4 h-4 rounded-full bg-white/25 text-white flex items-center justify-center ml-1">
          <Check className="w-2.5 h-2.5 stroke-[3]" />
        </div>
      )}
    </motion.button>
  );
}

export default function HealthProfile() {
  const { t } = useLanguage();

  const healthGoals = [
    t('hp_goal_weight_loss'), t('hp_goal_weight_gain'), t('hp_goal_muscle'), t('hp_goal_energy'),
    t('hp_goal_sleep'), t('hp_goal_immunity'), t('hp_goal_heart'), t('hp_goal_diabetes')
  ];
  const medicalConditions = [
    t('hp_condition_diabetes'), t('hp_condition_hypertension'), t('hp_condition_thyroid'), t('hp_condition_pcos'), t('hp_condition_anemia'),
    t('hp_condition_heart'), t('hp_condition_kidney'), t('hp_condition_none')
  ];
  const allergies = [
    t('hp_allergy_dairy'), t('hp_allergy_gluten'), t('hp_allergy_nuts'), t('hp_allergy_soy'), t('hp_allergy_eggs'), t('hp_allergy_seafood'), t('hp_allergy_none')
  ];

  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await profileService.getHealthProfile();
        if (data) {
          setForm({
            age: data.age ?? '',
            gender: data.gender ?? '',
            height_cm: data.height_cm ?? '',
            weight_kg: data.weight_kg ?? '',
            activity_level: data.activity_level ?? '',
            dietary_preference: data.dietary_preference ?? '',
            sleep_hours: data.sleep_hours ?? '7',
            smoking: data.smoking ? 'Yes' : 'No',
            alcohol: data.alcohol ? 'Yes' : 'No',
            health_goals: data.health_goal ? data.health_goal.split(', ').filter(Boolean) : [],
            medical_conditions: data.medical_conditions ? data.medical_conditions.split(', ').filter(Boolean) : [],
            allergies: data.allergies ? data.allergies.split(', ').filter(Boolean) : [],
          });
        }
      } catch (err) {
        // No existing profile — user can set up new profile
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    setIsDirty(true);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleItem = (field, item) => {
    setIsDirty(true);
    const current = form[field];
    if (item === 'None' || item === t('hp_condition_none') || item === t('hp_allergy_none')) {
      setForm({ ...form, [field]: current.includes(item) ? [] : [item] });
      return;
    }
    const withoutNone = current.filter(
      (i) => i !== 'None' && i !== t('hp_condition_none') && i !== t('hp_allergy_none')
    );
    setForm({
      ...form,
      [field]: withoutNone.includes(item)
        ? withoutNone.filter((i) => i !== item)
        : [...withoutNone, item],
    });
  };

  // BMI Calculation & Health Category Meter
  const bmi = useMemo(() => {
    const h = parseFloat(form.height_cm);
    const w = parseFloat(form.weight_kg);
    if (h && w && h > 0) {
      return (w / ((h / 100) ** 2)).toFixed(1);
    }
    return null;
  }, [form.height_cm, form.weight_kg]);

  const bmiCategory = useMemo(() => {
    if (!bmi) return null;
    const v = parseFloat(bmi);
    if (v < 18.5) return { label: t('hp_bmi_underweight'), color: 'text-amber-600 bg-amber-50 border-amber-200', pct: 15 };
    if (v < 25) return { label: t('hp_bmi_normal'), color: 'text-emerald-600 bg-emerald-50 border-emerald-200', pct: 45 };
    if (v < 30) return { label: t('hp_bmi_overweight'), color: 'text-amber-600 bg-amber-50 border-amber-200', pct: 75 };
    return { label: t('hp_bmi_obese'), color: 'text-rose-600 bg-rose-50 border-rose-200', pct: 95 };
  }, [bmi, t]);

  // Basal Metabolic Rate (BMR) Estimation
  const estimatedBMR = useMemo(() => {
    const h = parseFloat(form.height_cm);
    const w = parseFloat(form.weight_kg);
    const a = parseInt(form.age);
    if (h && w && a) {
      const isMale = form.gender === 'male';
      return Math.round(10 * w + 6.25 * h - 5 * a + (isMale ? 5 : -161));
    }
    return null;
  }, [form.height_cm, form.weight_kg, form.age, form.gender]);

  // Total Daily Energy Expenditure (TDEE) Estimation
  const estimatedTDEE = useMemo(() => {
    if (!estimatedBMR) return null;
    const multipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9,
    };
    const factor = multipliers[form.activity_level] || 1.2;
    return Math.round(estimatedBMR * factor);
  }, [estimatedBMR, form.activity_level]);

  // Recommended Water Intake (L/day)
  const recommendedWater = useMemo(() => {
    const w = parseFloat(form.weight_kg);
    if (w && w > 0) {
      return (w * 0.033).toFixed(1);
    }
    return '2.5';
  }, [form.weight_kg]);

  const handleSave = async () => {
    setSaving(true);
    setAlert({ show: false, type: 'success', message: '' });
    try {
      const payload = {
        age: form.age ? parseInt(form.age) : null,
        gender: form.gender || null,
        height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
        activity_level: form.activity_level || null,
        dietary_preference: form.dietary_preference || null,
        sleep_hours: form.sleep_hours ? parseFloat(form.sleep_hours) : null,
        smoking: form.smoking === 'Yes' || form.smoking === 'Regularly' || form.smoking === 'Occasionally',
        alcohol: form.alcohol === 'Yes' || form.alcohol === 'Regularly' || form.alcohol === 'Occasionally',
        health_goal: form.health_goals.join(', ') || null,
        medical_conditions: form.medical_conditions.join(', ') || null,
        allergies: form.allergies.join(', ') || null,
      };
      await profileService.updateHealthProfile(payload);
      setAlert({ show: true, type: 'success', message: t('hp_save_success') });
      setIsDirty(false);
    } catch (err) {
      setAlert({ show: true, type: 'error', message: err.response?.data?.detail || t('hp_save_error') });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title={t('hp_page_title')}>
        <PageLoader />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t('hp_page_title')} subtitle={t('hp_page_subtitle')}>
      {alert.show && (
        <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />
      )}

      <div className="text-[#0a192f]">
        {/* 🌟 Top Hero Health & Metabolic Intelligence Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8 mt-2">
          
          {/* Live BMI Meter & Category */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 rounded-3xl border border-slate-200 bg-white shadow-xs relative overflow-hidden flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0284c7]">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#0a192f] leading-tight">Body Mass Index (BMI)</h4>
                  <p className="text-[11px] text-slate-500 font-semibold">Biometric Indicator</p>
                </div>
              </div>
              {bmiCategory && (
                <span className={`text-xs font-black px-3 py-1 rounded-full border ${bmiCategory.color}`}>
                  {bmiCategory.label}
                </span>
              )}
            </div>

            <div className="my-3 text-center">
              <p className="text-4xl font-black text-[#0a192f] tracking-tight">
                {bmi || '--'} <span className="text-sm font-bold text-slate-500">kg/m²</span>
              </p>
            </div>

            {/* Visual BMI Range Gauge Spectrum Bar */}
            <div className="space-y-1 mt-2">
              <div className="relative w-full h-3 rounded-full bg-slate-100 overflow-hidden flex border border-slate-200">
                <div className="w-[18.5%] h-full bg-amber-400" title="Underweight (<18.5)" />
                <div className="w-[30%] h-full bg-emerald-500" title="Normal (18.5 - 24.9)" />
                <div className="w-[25%] h-full bg-amber-500" title="Overweight (25 - 29.9)" />
                <div className="w-[26.5%] h-full bg-rose-500" title="Obese (30+)" />
              </div>

              {bmiCategory && (
                <div className="flex justify-between text-[10px] font-bold text-slate-500 px-1 pt-1">
                  <span>15.0</span>
                  <span>18.5</span>
                  <span>25.0</span>
                  <span>30.0</span>
                  <span>40.0</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Metabolic Rate & Hydration Intelligence */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 glass-card p-6 rounded-3xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h4 className="text-sm font-black text-[#0a192f]">{t('hp_quick_summary')}</h4>
              </div>
              <span className="text-xs text-[#0284c7] font-black bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                AI Calculated
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* BMR Stat */}
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100">
                <div className="flex items-center gap-2 text-purple-700 text-xs font-black mb-1">
                  <Flame className="w-4 h-4 text-purple-600" />
                  <span>BMR (Basal)</span>
                </div>
                <p className="text-2xl font-black text-[#0a192f] mt-1">
                  {estimatedBMR ? `${estimatedBMR}` : '--'}{' '}
                  <span className="text-xs font-bold text-slate-500">kcal/day</span>
                </p>
                <p className="text-[10px] text-slate-500 font-semibold mt-1">{t('hp_bmr_label')}</p>
              </div>

              {/* TDEE Stat */}
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100">
                <div className="flex items-center gap-2 text-[#0284c7] text-xs font-black mb-1">
                  <Zap className="w-4 h-4 text-[#0284c7]" />
                  <span>TDEE (Daily Energy)</span>
                </div>
                <p className="text-2xl font-black text-[#0a192f] mt-1">
                  {estimatedTDEE ? `${estimatedTDEE}` : '--'}{' '}
                  <span className="text-xs font-bold text-slate-500">kcal/day</span>
                </p>
                <p className="text-[10px] text-slate-500 font-semibold mt-1">{t('hp_tdee_label')}</p>
              </div>

              {/* Water Target Stat */}
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                <div className="flex items-center gap-2 text-indigo-700 text-xs font-black mb-1">
                  <Droplets className="w-4 h-4 text-indigo-600" />
                  <span>Water Rec.</span>
                </div>
                <p className="text-2xl font-black text-[#0a192f] mt-1">
                  {recommendedWater}{' '}
                  <span className="text-xs font-bold text-slate-500">Liters/day</span>
                </p>
                <p className="text-[10px] text-slate-500 font-semibold mt-1">{t('hp_water_rec')}</p>
              </div>

            </div>
          </motion.div>

        </div>

        {/* 📝 Main Health Form Grid */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-5xl">
          
          {/* Section 1: Personal Biometrics */}
          <motion.div variants={cardVariants} className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-xs">
            <SectionHeader
              icon={User}
              title={t('hp_personal_info')}
              subtitle="Enter your physical measurements for accurate caloric calculations"
              colorClass="bg-sky-50 border-sky-100 text-[#0284c7]"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label={t('hp_age_label')}
                name="age"
                type="number"
                placeholder="25"
                min="1"
                max="120"
                value={form.age}
                onChange={handleChange}
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {t('hp_gender_label')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { code: 'male', label: t('hp_gender_male'), icon: '♂️' },
                    { code: 'female', label: t('hp_gender_female'), icon: '♀️' },
                    { code: 'other', label: t('hp_gender_other'), icon: '⚧️' },
                  ].map((g) => {
                    const selected = form.gender === g.code;
                    return (
                      <button
                        key={g.code}
                        type="button"
                        onClick={() => {
                          setIsDirty(true);
                          setForm({ ...form, gender: g.code });
                        }}
                        className={`p-3 rounded-2xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                          selected
                            ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 text-white border-transparent shadow-md shadow-purple-500/25'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 border-slate-200'
                        }`}
                      >
                        <span>{g.icon}</span>
                        <span>{g.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Input
                label={t('hp_height_label')}
                name="height_cm"
                type="number"
                placeholder="170"
                min="50"
                max="300"
                value={form.height_cm}
                onChange={handleChange}
              />

              <Input
                label={t('hp_weight_label')}
                name="weight_kg"
                type="number"
                placeholder="70"
                min="10"
                max="500"
                value={form.weight_kg}
                onChange={handleChange}
              />
            </div>
          </motion.div>

          {/* Section 2: Lifestyle & Habits */}
          <motion.div variants={cardVariants} className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-xs">
            <SectionHeader
              icon={Dumbbell}
              title={t('hp_lifestyle')}
              subtitle="Your activity level, dietary preference, and sleep habits"
              colorClass="bg-purple-50 border-purple-100 text-purple-600"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
              <Select
                label={t('hp_activity_label')}
                name="activity_level"
                value={form.activity_level}
                onChange={handleChange}
              >
                <option value="">{t('hp_select_activity')}</option>
                <option value="sedentary">{t('hp_activity_sedentary')}</option>
                <option value="lightly_active">{t('hp_activity_lightly')}</option>
                <option value="moderately_active">{t('hp_activity_moderately')}</option>
                <option value="very_active">{t('hp_activity_very')}</option>
                <option value="extremely_active">{t('hp_activity_extremely')}</option>
              </Select>

              <Select
                label={t('hp_diet_label')}
                name="dietary_preference"
                value={form.dietary_preference}
                onChange={handleChange}
              >
                <option value="">{t('hp_select_diet')}</option>
                <option value="vegetarian">{t('hp_diet_vegetarian')}</option>
                <option value="non_vegetarian">{t('hp_diet_non_veg')}</option>
                <option value="vegan">{t('hp_diet_vegan')}</option>
                <option value="eggetarian">{t('hp_diet_eggetarian')}</option>
                <option value="keto">{t('hp_diet_keto')}</option>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <Input
                label={t('hp_sleep_label')}
                name="sleep_hours"
                type="number"
                placeholder="7"
                min="1"
                max="24"
                step="0.5"
                value={form.sleep_hours}
                onChange={handleChange}
              />

              <Select label={t('hp_smoking_label')} name="smoking" value={form.smoking} onChange={handleChange}>
                <option value="No">{t('hp_freq_no')}</option>
                <option value="Occasionally">{t('hp_freq_occasionally')}</option>
                <option value="Regularly">{t('hp_freq_regularly')}</option>
              </Select>

              <Select label={t('hp_alcohol_label')} name="alcohol" value={form.alcohol} onChange={handleChange}>
                <option value="No">{t('hp_freq_no')}</option>
                <option value="Occasionally">{t('hp_freq_occasionally')}</option>
                <option value="Regularly">{t('hp_freq_regularly')}</option>
              </Select>
            </div>
          </motion.div>

          {/* Section 3: Health Goals */}
          <motion.div variants={cardVariants} className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-xs">
            <SectionHeader
              icon={Heart}
              title={t('hp_health_goals')}
              subtitle="Select all health objectives you wish NutriAI to target"
              colorClass="bg-emerald-50 border-emerald-100 text-emerald-600"
            />
            <div className="flex flex-wrap gap-2.5">
              {healthGoals.map((goal) => (
                <TogglePill
                  key={goal}
                  label={goal}
                  selected={form.health_goals.includes(goal)}
                  onClick={() => toggleItem('health_goals', goal)}
                  icon={Heart}
                />
              ))}
            </div>
          </motion.div>

          {/* Section 4: Medical Conditions */}
          <motion.div variants={cardVariants} className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-xs">
            <SectionHeader
              icon={Shield}
              title={t('hp_medical_conditions')}
              subtitle="Clinical conditions used by machine learning to screen deficiency risks"
              colorClass="bg-rose-50 border-rose-100 text-rose-600"
            />
            <div className="flex flex-wrap gap-2.5">
              {medicalConditions.map((cond) => (
                <TogglePill
                  key={cond}
                  label={cond}
                  selected={form.medical_conditions.includes(cond)}
                  onClick={() => toggleItem('medical_conditions', cond)}
                  icon={Shield}
                />
              ))}
            </div>
          </motion.div>

          {/* Section 5: Allergies & Intolerances */}
          <motion.div variants={cardVariants} className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-xs">
            <SectionHeader
              icon={Leaf}
              title={t('hp_allergies_title')}
              subtitle="Nutritional shields will exclude these items from meal plans"
              colorClass="bg-amber-50 border-amber-100 text-amber-600"
            />
            <div className="flex flex-wrap gap-2.5">
              {allergies.map((allergy) => (
                <TogglePill
                  key={allergy}
                  label={allergy}
                  selected={form.allergies.includes(allergy)}
                  onClick={() => toggleItem('allergies', allergy)}
                  icon={Leaf}
                />
              ))}
            </div>
          </motion.div>

          {/* Save Action Dock */}
          <motion.div
            variants={cardVariants}
            className="glass-card p-4 sm:p-6 rounded-3xl border border-sky-200 bg-white shadow-md flex items-center justify-between mt-8"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0284c7]">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-black text-[#0a192f]">Health Profile Status</p>
                <p className="text-xs text-slate-500 font-semibold">
                  {isDirty ? (
                    <span className="text-amber-600 font-bold">⚠️ Unsaved changes pending</span>
                  ) : (
                    <span className="text-emerald-600 font-bold">✓ Profile synced with AI</span>
                  )}
                </p>
              </div>
            </div>

            <Button
              onClick={handleSave}
              loading={saving}
              icon={Save}
              size="lg"
            >
              {t('hp_save_btn')}
            </Button>
          </motion.div>

        </motion.div>
      </div>
    </DashboardLayout>
  );
}
