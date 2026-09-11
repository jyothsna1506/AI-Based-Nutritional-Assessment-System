import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ShieldCheck, LogIn, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Alert from '../../../components/common/Alert';
import Logo from '../../../components/common/Logo';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
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
      setError(err.response?.data?.detail || err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-sky-100/80 via-slate-50 to-white overflow-hidden text-[#0a192f]">
      
      {/* Left side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-12 lg:px-24 xl:px-32 relative z-10">
        
        {/* Back Link */}
        <div className="absolute top-8 left-4 sm:left-12 lg:left-24">
          <Link to="/" className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#0284c7] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto"
        >
          {/* Logo */}
          <Logo size="lg" isAdmin={true} className="mb-10" />

          <h2 className="text-3xl font-black text-[#0a192f] mb-2 tracking-tight">Admin Portal</h2>
          <p className="text-slate-600 text-sm mb-8 font-semibold">Sign in with administrator credentials.</p>

          <Alert type="error" message={error} show={!!error} onClose={() => setError('')} />

          <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-4">
            <Input
              label="Admin Email"
              name="email"
              type="email"
              placeholder="admin@example.com"
              icon={Mail}
              value={form.email}
              onChange={handleChange}
            />
            <Input
              label="Password"
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
                className="w-full text-base rounded-xl"
                size="lg"
              >
                Secure Sign In
              </Button>
            </div>
          </form>
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
            <ShieldCheck className="w-10 h-10 text-sky-400" />
          </div>
          <h3 className="text-3xl font-black text-[#0a192f] mb-4">Secure Administration</h3>
          <p className="text-slate-600 leading-relaxed font-semibold">
            Access the NutriAI backend systems. Manage users, monitor predictive analytics, and update nutritional datasets securely.
          </p>
        </motion.div>
      </div>

    </div>
  );
}
