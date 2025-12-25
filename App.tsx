
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './components/AuthPage';
import Chatbot from './components/Chatbot';
import SafeCorner from './components/SafeCorner';
import TeacherDashboard from './components/TeacherDashboard';
import { User } from './types';
import { Home, MessageSquare, ShieldCheck, BarChart3, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('spss_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('spss_user');
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-sky-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <AnimatePresence mode="wait">
          {user && (
            <motion.nav 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="glass sticky top-0 z-50 px-4 py-3 flex justify-between items-center shadow-sm"
            >
              <div className="flex items-center gap-2">
                <div className="bg-indigo-600 p-2 rounded-lg text-white">
                  <ShieldCheck size={20} />
                </div>
                <h1 className="font-bold text-indigo-900 hidden sm:block">SmartStudent</h1>
              </div>

              <div className="flex items-center gap-1 sm:gap-4">
                <a href="#/" className="flex items-center gap-1 p-2 rounded-full hover:bg-white/50 text-indigo-700 transition">
                  <MessageSquare size={18} />
                  <span className="hidden md:inline text-sm font-medium">Hỗ trợ AI</span>
                </a>
                <a href="#/safe-corner" className="flex items-center gap-1 p-2 rounded-full hover:bg-white/50 text-emerald-700 transition">
                  <ShieldCheck size={18} />
                  <span className="hidden md:inline text-sm font-medium">Góc An Toàn</span>
                </a>
                {user.role === 'teacher' && (
                  <a href="#/dashboard" className="flex items-center gap-1 p-2 rounded-full hover:bg-white/50 text-amber-700 transition">
                    <BarChart3 size={18} />
                    <span className="hidden md:inline text-sm font-medium">Dashboard</span>
                  </a>
                )}
                <button 
                  onClick={handleLogout}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-full transition"
                >
                  <LogOut size={18} />
                </button>
                <div className="flex items-center gap-2 ml-2 pl-2 border-l border-indigo-100">
                  <img src={user.avatar} className="w-8 h-8 rounded-full border-2 border-indigo-200" alt="avatar" />
                  <span className="hidden sm:inline text-xs font-semibold text-indigo-900">{user.username}</span>
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>

        <main className="flex-grow p-4 md:p-6 max-w-7xl mx-auto w-full">
          <Routes>
            <Route path="/auth" element={!user ? <AuthPage onAuth={setUser} /> : <Navigate to="/" />} />
            <Route path="/" element={user ? <Chatbot user={user} /> : <Navigate to="/auth" />} />
            <Route path="/safe-corner" element={user ? <SafeCorner /> : <Navigate to="/auth" />} />
            <Route path="/dashboard" element={user?.role === 'teacher' ? <TeacherDashboard /> : <Navigate to="/" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <footer className="py-6 text-center text-indigo-400 text-xs border-t border-indigo-50/50">
          <p>© 2024 Hệ Thống Tâm Lý Học Đường v1.0 • Bảo mật & Tin cậy</p>
        </footer>
      </div>
    </Router>
  );
};

export default App;
