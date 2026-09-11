import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Utensils, LogIn, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Logo from '../../components/common/Logo';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError(t('auth_login_fill_fields'));
      return;
    }
    setLoading(true);
    try {
      const data = await login(form);
      if (data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || t('auth_login_invalid'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-sky-100/70 via-slate-50 to-white overflow-x-hidden text-[#0a192f]">
      
      {/* Left side: Form */}
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

          <h2 className="text-2xl sm:text-3xl font-black text-[#0a192f] mb-2 tracking-tight">{t('auth_login_welcome')}</h2>
          <p className="text-slate-600 text-xs sm:text-sm font-semibold mb-6 sm:mb-8">{t('auth_login_subtitle')}</p>

          <Alert type="error" message={error} show={!!error} onClose={() => setError('')} floating={false} />

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5 mt-2">
            <Input
              label={t('auth_login_email_label')}
              name="email"
              type="email"
              placeholder={t('auth_login_email_placeholder')}
              icon={Mail}
              value={form.email}
              onChange={handleChange}
            />
            <Input
              label={t('auth_login_password_label')}
              name="password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={form.password}
              onChange={handleChange}
            />
            <div className="pt-2">
              <Button
                type="submit"
                loading={loading}
                icon={LogIn}
                className="w-full text-sm sm:text-base rounded-xl bg-[#0a192f] hover:bg-[#0284c7] text-white font-bold shadow-md py-3"
                size="lg"
              >
                {t('auth_login_submit')}
              </Button>
            </div>
          </form>

          <p className="text-center text-xs sm:text-sm text-slate-600 font-semibold mt-6 sm:mt-8">
            {t('auth_login_no_account')}{' '}
            <Link to="/register" className="text-[#0284c7] hover:text-sky-700 font-black transition-colors">
              {t('auth_login_create_account')}
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right side: Branding Graphic */}
      <div className="hidden lg:flex w-1/2 relative bg-gradient-to-br from-sky-200/50 via-sky-100/30 to-indigo-100/40 border-l border-slate-200/80 items-center justify-center p-12">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-sky-300/30 rounded-full blur-[120px]" />
          <div className="absolute bottom-[20%] right-[20%] w-[30rem] h-[30rem] bg-indigo-300/20 rounded-full blur-[150px]" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 glass-card p-12 max-w-lg text-center border border-sky-200/90 shadow-xl bg-white/95"
        >
          <div className="w-20 h-20 mx-auto rounded-3xl bg-[#0a192f] flex items-center justify-center mb-8 shadow-xl">
            <Utensils className="w-10 h-10 text-sky-400" />
          </div>
          <h3 className="text-3xl font-black text-[#0a192f] mb-4">{t('auth_login_branding_title')}</h3>
          <p className="text-slate-600 leading-relaxed font-semibold">
            {t('auth_login_branding_desc')}
          </p>
        </motion.div>
      </div>

    </div>
  );
}
