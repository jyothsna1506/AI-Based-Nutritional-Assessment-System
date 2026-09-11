import { Link } from 'react-router-dom';
import { Utensils, Sparkles } from 'lucide-react';

export default function Logo({
  size = 'md',
  showText = true,
  darkText = false,
  isAdmin = false,
  to,
  className = '',
}) {
  const iconBoxSizes = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-10 h-10 rounded-2xl',
    lg: 'w-12 h-12 rounded-2xl',
    xl: 'w-16 h-16 rounded-3xl',
  };

  const mainIconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  const sparkleSizes = {
    sm: 'w-2.5 h-2.5 -top-1 -right-1',
    md: 'w-3.5 h-3.5 -top-1.5 -right-1.5',
    lg: 'w-4 h-4 -top-2 -right-2',
    xl: 'w-5 h-5 -top-2 -right-2',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl',
  };

  const targetPath = to !== undefined ? to : (isAdmin ? '/admin/dashboard' : '/');

  return (
    <Link to={targetPath} className={`inline-flex items-center gap-3 group shrink-0 ${className}`}>
      {/* 🌟 Colorful Multi-Gradient Glowing Badge */}
      <div className={`relative ${iconBoxSizes[size]} bg-gradient-to-tr from-emerald-500 via-teal-500 via-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-teal-500/25 group-hover:shadow-lg group-hover:shadow-teal-500/40 group-hover:scale-105 transition-all duration-300 overflow-visible`}>
        {/* Gloss overlay reflection */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/25 via-transparent to-black/10 pointer-events-none" />
        
        {/* Utensils Icon */}
        <Utensils className={`${mainIconSizes[size]} text-white stroke-[2.2] drop-shadow-xs relative z-10`} />
        
        {/* Floating Pulsing Gold Sparkle */}
        <div className={`absolute ${sparkleSizes[size]} z-20 rounded-full bg-amber-400 text-white flex items-center justify-center p-0.5 shadow-sm shadow-amber-500/50 animate-pulse`}>
          <Sparkles className="w-full h-full text-amber-100" />
        </div>
      </div>

      {/* 🎨 Rich Colorful Typography ("NutriAI") */}
      {showText && (
        <div className="flex items-center gap-1.5">
          <span className={`${textSizes[size]} font-black tracking-tight ${darkText ? 'text-white' : 'text-[#0a192f]'}`}>
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 bg-clip-text text-transparent">Nutri</span>
            <span className="bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 bg-clip-text text-transparent ml-0.5">AI</span>
          </span>

          {/* Glowing Emerald Pulse Indicator */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>

          {/* Optional Admin Badge */}
          {isAdmin && (
            <span className="ml-1 px-2 py-0.5 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-[10px] font-black uppercase tracking-wider shadow-xs shadow-sky-500/20">
              Admin
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
