import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, UtensilsCrossed, BarChart3, Activity,
  ChevronLeft, ChevronRight, Settings, LogOut, Music
} from 'lucide-react';
import Navbar from './Navbar';

const menuSections = [
  {
    title: 'Admin Console',
    items: [
      { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/admin/users', label: 'Users', icon: Users },
      { path: '/admin/foods', label: 'Food Database', icon: UtensilsCrossed },
    ],
  },
  {
    title: 'Insights',
    items: [
      { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
      { path: '/admin/prediction-reports', label: 'Predictions', icon: Activity },
    ],
  },
  {
    title: 'System',
    items: [
      { path: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
];

function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="hidden lg:flex flex-col h-full flex-shrink-0 bg-white/95 backdrop-blur-md border-r border-slate-200/80 shadow-xs relative z-10"
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 flex items-center justify-center text-white shadow-md shadow-purple-500/30 z-20 cursor-pointer hover:scale-110 transition-transform"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      <div className="flex-1 py-6 px-3 space-y-6 overflow-y-auto custom-scrollbar">
        {menuSections.map((section) => (
          <div key={section.title}>
            <AnimatePresence>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 mb-2 text-[10px] font-black uppercase tracking-widest text-sky-700"
                >
                  {section.title}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={collapsed ? item.label : ''}
                    className={`
                      flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm
                      transition-all duration-200 group relative overflow-hidden
                      ${isActive
                        ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 text-white shadow-md shadow-purple-500/25 font-bold'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-sky-50 font-semibold'
                      }
                    `}
                  >
                    <item.icon className={`w-5 h-5 flex-shrink-0 relative z-10 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-sky-600'}`} />
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="whitespace-nowrap overflow-hidden relative z-10"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-slate-200/80 space-y-1 bg-slate-50/50">
        <Link
          to="/dashboard"
          title={collapsed ? 'User View' : ''}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 transition-all"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Exit Admin</span>}
        </Link>
      </div>
    </motion.aside>
  );
}

export default function AdminLayout({ children }) {
  return (
    <div className="flex h-screen bg-gradient-to-br from-sky-100/70 via-indigo-50/40 to-slate-50 text-[#0a192f] overflow-hidden font-sans">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-sky-300/20 rounded-full blur-[140px] pointer-events-none z-0" />
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-indigo-300/15 rounded-full blur-[130px] pointer-events-none z-0" />
        
        <Navbar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative custom-scrollbar">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}
