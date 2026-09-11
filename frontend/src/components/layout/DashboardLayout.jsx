import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children, title, subtitle }) {
  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-sky-100/70 via-indigo-50/40 via-80% to-slate-50 overflow-hidden selection:bg-sky-500/20 selection:text-sky-700 relative text-[#0a192f]">
      
      {/* 🌟 Atmospheric Sky-Cloud Background Accents */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-sky-300/20 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-indigo-300/15 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="absolute top-1/3 left-1/2 w-[450px] h-[450px] bg-emerald-300/15 rounded-full blur-[150px] pointer-events-none z-0" />

      <Navbar />
      
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full scroll-smooth custom-scrollbar">
          {(title || subtitle) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 sm:mb-8"
            >
              {title && (
                <h1 className="text-2xl sm:text-3xl font-black text-[#0a192f] tracking-tight flex items-center gap-3">
                  <span>{title}</span>
                </h1>
              )}
              {subtitle && <p className="text-sm sm:text-base text-slate-600 font-medium mt-1">{subtitle}</p>}
            </motion.div>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="pb-16"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
