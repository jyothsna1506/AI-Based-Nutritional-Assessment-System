import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Utensils, UserPlus, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Logo from '../../components/common/Logo';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', password2: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password || !form.password2) {
      setError(t('auth_register_fill_fields'));
      return;
    }
    if (form.password !== form.password2) {
      setError(t('auth_register_password_mismatch'));
      return;
    }
    if (form.password.length < 6) {
      setError(t('auth_register_password_length'));
      return;
    }
    setLoading(true);
    try {
      await register({ full_name: form.name.trim(), email: form.email.trim(), password: form.password });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Registration error:', err);
      const rawErr = err.response?.data?.detail || err.response?.data?.message || t('auth_register_failed');
      setError(typeof rawErr === 'string' ? rawErr : JSON.stringify(rawErr));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row-reverse bg-gradient-to-br from-sky-100/70 via-slate-50 to-white overflow-x-hidden text-[#0a192f]">
      
      {/* Right side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24 py-8 sm:py-12 relative z-10">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto"
        >
          {/* Header: Logo + Back to Home */}
          <div className="flex items-center justify-between gap-4 mb-8 sm:mb-10 w-full">
            <Logo size="lg" />

            <Link to="/" className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-[#0284c7] transition-colors shrink-0">
              <ArrowLeft className="w-4 h-4" />
              <span>{t('common_back_to_home')}</span>
            </Link>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-[#0a192f] mb-2 tracking-tight">{t('auth_register_title')}</h2>
          <p className="text-slate-600 text-xs sm:text-sm font-semibold mb-6 sm:mb-8">{t('auth_register_subtitle')}</p>

          <Alert type="error" message={error} show={!!error} onClose={() => setError('')} floating={false} />

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5 mt-2">
            <Input
              label={t('auth_register_name_label')}
              name="name"
              type="text"
              placeholder={t('auth_register_name_placeholder')}
              icon={User}
              value={form.name}
              onChange={handleChange}
            />
            <Input
              label={t('auth_register_email_label')}
              name="email"
              type="email"
              placeholder={t('auth_register_email_placeholder')}
              icon={Mail}
              value={form.email}
              onChange={handleChange}
            />
            <Input
              label={t('auth_register_password_label')}
              name="password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={form.password}
              onChange={handleChange}
            />
            <Input
              label={t('auth_register_confirm_label')}
              name="password2"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={form.password2}
              onChange={handleChange}
            />
            <div className="pt-2">
              <Button
                type="submit"
                loading={loading}
                icon={UserPlus}
                className="w-full text-sm sm:text-base rounded-xl bg-[#0a192f] hover:bg-[#0284c7] text-white font-bold shadow-md py-3"
                size="lg"
              >
                {t('auth_register_submit')}
              </Button>
            </div>
          </form>

          <p className="text-center text-xs sm:text-sm text-slate-600 font-semibold mt-6 sm:mt-8">
            {t('auth_register_already_account')}{' '}
            <Link to="/login" className="text-[#0284c7] hover:text-sky-700 font-black transition-colors">
              {t('auth_register_sign_in')}
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Left side: Branding Graphic */}
      <div className="hidden lg:flex w-1/2 relative bg-gradient-to-bl from-sky-200/50 via-sky-100/30 to-indigo-100/40 border-r border-slate-200/80 items-center justify-center p-12">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] right-[20%] w-96 h-96 bg-sky-300/30 rounded-full blur-[120px]" />
          <div className="absolute bottom-[20%] left-[20%] w-[30rem] h-[30rem] bg-indigo-300/20 rounded-full blur-[150px]" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 glass-card p-12 max-w-lg text-center border border-sky-200/90 shadow-xl bg-white/95"
        >
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-6 rounded-2xl bg-sky-50 border border-sky-200 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-[#0284c7]">95%</span>
              <span className="text-xs text-slate-600 font-bold mt-1 uppercase tracking-wider">{t('auth_register_stat_accuracy')}</span>
            </div>
            <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-indigo-600">50+</span>
              <span className="text-xs text-slate-600 font-bold mt-1 uppercase tracking-wider">{t('auth_register_stat_nutrients')}</span>
            </div>
          </div>
          <h3 className="text-3xl font-black text-[#0a192f] mb-4">{t('auth_register_branding_title')}</h3>
          <p className="text-slate-600 leading-relaxed font-semibold">
            {t('auth_register_branding_desc')}
          </p>
        </motion.div>
      </div>

    </div>
  );
}
