import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, Shield, Calendar,
  Heart, Ruler, Weight, Dumbbell, Leaf,
  Edit3, Save, X
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import profileService from '../../services/profileService';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

function InfoRow({ icon: Icon, label, value, color = 'text-[#0284c7]' }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
      <Icon size={16} className={color} />
      <span className="text-xs sm:text-sm text-slate-500 font-bold min-w-[120px]">{label}</span>
      <span className="text-xs sm:text-sm text-[#0a192f] font-black">{value || '—'}</span>
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [healthProfile, setHealthProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const [profileRes, healthRes] = await Promise.allSettled([
        profileService.getProfile(),
        profileService.getHealthProfile(),
      ]);
      if (profileRes.status === 'fulfilled') {
        setProfile(profileRes.value);
        setForm({ full_name: profileRes.value.full_name || '', phone: profileRes.value.phone || '' });
      }
      if (healthRes.status === 'fulfilled') {
        setHealthProfile(healthRes.value);
      }
    } catch (err) {
      console.error('Profile load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileService.updateProfile(form);
      setAlert({ show: true, type: 'success', message: t('profile_update_success') });
      setEditing(false);
      loadProfile();
    } catch (err) {
      setAlert({ show: true, type: 'error', message: t('profile_update_error') });
    } finally {
      setSaving(false);
    }
  };

  const hp = healthProfile;

  return (
    <DashboardLayout title={t('profile_page_title')} subtitle={t('profile_page_subtitle')}>
      {alert.show && (
        <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />
      )}

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-[#0a192f]">
        {/* Account Info */}
        <motion.div variants={item} className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#0a192f] font-black text-lg flex items-center gap-2">
              <User size={20} className="text-[#0284c7]" /> {t('profile_account_info')}
            </h3>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="text-[#0284c7] hover:text-sky-800 transition-colors cursor-pointer p-1">
                <Edit3 size={18} />
              </button>
            ) : (
              <button onClick={() => setEditing(false)} className="text-rose-600 hover:text-rose-800 transition-colors cursor-pointer p-1">
                <X size={18} />
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-4">
              <Input
                label={t('profile_name_label')}
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
              <Input
                label={t('profile_phone_label')}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <Button onClick={handleSave} loading={saving} className="w-full flex items-center justify-center gap-2 bg-[#0a192f] hover:bg-[#0284c7] text-white font-bold shadow-md">
                <Save size={16} /> {t('profile_save_btn')}
              </Button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-[#0a192f] flex items-center justify-center text-white text-2xl font-black shadow-md">
                  {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xl text-[#0a192f] font-black">{profile?.full_name || t('profile_default_name')}</h4>
                  <p className="text-xs text-slate-500 font-semibold">{profile?.email || user?.email}</p>
                </div>
              </div>
              <InfoRow icon={Mail} label={t('profile_email_label')} value={profile?.email || user?.email} />
              <InfoRow icon={Phone} label={t('profile_phone_label')} value={profile?.phone} />
              <InfoRow icon={Shield} label={t('profile_role_label')} value={profile?.role || t('profile_role_user')} color="text-emerald-600" />
              <InfoRow icon={Calendar} label={t('profile_joined_label')} value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'} />
            </div>
          )}
        </motion.div>

        {/* Health Profile Summary */}
        <motion.div variants={item} className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-xs">
          <h3 className="text-[#0a192f] font-black text-lg flex items-center gap-2 mb-4">
            <Heart size={20} className="text-rose-600" /> {t('profile_health_summary')}
          </h3>

          {hp ? (
            <div>
              <InfoRow icon={Calendar} label={t('profile_age_label')} value={hp.age ? `${hp.age} ${t('profile_years')}` : null} />
              <InfoRow icon={User} label={t('profile_gender_label')} value={hp.gender} />
              <InfoRow icon={Ruler} label={t('profile_height_label')} value={hp.height_cm ? `${hp.height_cm} cm` : null} color="text-purple-600" />
              <InfoRow icon={Weight} label={t('profile_weight_label')} value={hp.weight_kg ? `${hp.weight_kg} kg` : null} color="text-amber-600" />
              <InfoRow icon={Dumbbell} label={t('profile_activity_label')} value={hp.activity_level} color="text-[#0284c7]" />
              <InfoRow icon={Leaf} label={t('profile_diet_label')} value={hp.dietary_preference} color="text-emerald-600" />
            </div>
          ) : (
            <p className="text-xs text-slate-500 font-semibold">{t('profile_no_health_data')}</p>
          )}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
