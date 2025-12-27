
import React, { useState } from 'react';
import { User } from '../types';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertCircle, Key } from 'lucide-react';

interface AuthPageProps {
  onAuth: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [accessKey, setAccessKey] = useState(''); // State cho mã truy cập
  const [school, setSchool] = useState('');
  const [className, setClassName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [error, setError] = useState('');

  const getUsers = (): any[] => {
    try {
      const data = localStorage.getItem('spss_all_users');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const normalizedUsername = username.trim().toLowerCase();
    
    // Kiểm tra các trường cơ bản
    if (!normalizedUsername || !password || !accessKey || (!isLogin && (!school || !className))) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    // Kiểm tra Mã truy cập (Key mặc định là 36)
    if (accessKey !== '36') {
      setError('Mã truy cập không chính xác. Liên hệ admin để có key.');
      return;
    }

    const users = getUsers();

    if (isLogin) {
      const foundUser = users.find((u: any) => u.username.toLowerCase() === normalizedUsername && u.password === password);
      if (foundUser) {
        const userData: User = {
          id: foundUser.id,
          username: foundUser.username,
          role: foundUser.role,
          avatar: foundUser.avatar,
          school: foundUser.school,
          className: foundUser.className
        };
        localStorage.setItem('spss_user', JSON.stringify(userData));
        onAuth(userData);
      } else {
        setError('Tài khoản hoặc mật khẩu không chính xác');
      }
    } else {
      if (users.some((u: any) => u.username.toLowerCase() === normalizedUsername)) {
        setError('Tên đăng nhập này đã có người sử dụng');
        return;
      }
      
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        username: username.trim(),
        password,
        role,
        school: school.trim(),
        className: className.trim().toUpperCase(),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username.trim()}`
      };
      
      const updatedUsers = [...users, newUser];
      localStorage.setItem('spss_all_users', JSON.stringify(updatedUsers));
      
      const userData: User = {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        school: newUser.school,
        className: newUser.className,
        avatar: newUser.avatar
      };
      localStorage.setItem('spss_user', JSON.stringify(userData));
      onAuth(userData);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-10">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass w-full max-w-md p-6 sm:p-8 rounded-[32px] shadow-2xl border-white/50"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-4 rounded-2xl text-white mb-4 shadow-xl">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-black text-indigo-950 text-center tracking-tight">
            {isLogin ? 'Chào mừng bạn!' : 'Tạo tài khoản mới'}
          </h2>
          <p className="text-indigo-500 text-[10px] font-bold mt-2 uppercase tracking-widest text-center">Hệ thống hỗ trợ tâm lý thông minh</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-indigo-400 uppercase ml-1 tracking-widest">Tên đăng nhập</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-white/50 border-2 border-indigo-50 focus:border-indigo-500 focus:bg-white transition-all outline-none text-indigo-950 font-bold text-base"
              placeholder="Ví dụ: hocsinh_a"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-indigo-400 uppercase ml-1 tracking-widest">Mật khẩu</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-white/50 border-2 border-indigo-50 focus:border-indigo-500 focus:bg-white transition-all outline-none text-indigo-950 font-bold text-base"
              placeholder="••••••••"
            />
          </div>

          {/* Trường Mã truy cập - Bắt buộc cho cả Đăng nhập và Đăng ký */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest">Mã truy cập hệ thống</label>
              <span className="text-[9px] font-bold text-rose-400 italic">Liên hệ admin để có key</span>
            </div>
            <div className="relative">
              <input 
                type="text" 
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                className="w-full px-5 py-4 pl-12 rounded-2xl bg-amber-50/30 border-2 border-amber-100 focus:border-amber-400 focus:bg-white transition-all outline-none text-indigo-950 font-black text-base"
                placeholder="Nhập mã (Test: 36)"
              />
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400" size={18} />
            </div>
          </div>

          {!isLogin && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-indigo-400 uppercase ml-1 tracking-widest">Trường học</label>
                  <input 
                    type="text" 
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white/50 border-2 border-indigo-50 focus:border-indigo-500 outline-none text-indigo-950 font-bold text-sm"
                    placeholder="Tên trường..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-indigo-400 uppercase ml-1 tracking-widest">Lớp học</label>
                  <input 
                    type="text" 
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white/50 border-2 border-indigo-50 focus:border-indigo-500 outline-none text-indigo-950 font-bold text-sm"
                    placeholder="Ví dụ: 12A1"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-indigo-400 uppercase ml-1 tracking-widest">Vai trò của bạn</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`py-3 rounded-2xl text-xs font-black transition-all ${role === 'student' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-indigo-600 border border-indigo-100 hover:bg-indigo-50'}`}
                  >
                    HỌC SINH
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('teacher')}
                    className={`py-3 rounded-2xl text-xs font-black transition-all ${role === 'teacher' ? 'bg-amber-500 text-white shadow-lg' : 'bg-white text-amber-600 border border-amber-100 hover:bg-amber-50'}`}
                  >
                    GIÁO VIÊN
                  </button>
                </div>
              </div>
            </>
          )}

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-rose-600 text-[11px] font-black bg-rose-50 p-4 rounded-2xl border border-rose-100 shadow-sm">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </motion.div>
          )}

          <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl transition-all transform active:scale-[0.98]">
            {isLogin ? 'ĐĂNG NHẬP NGAY' : 'HOÀN TẤT ĐĂNG KÝ'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-indigo-50 pt-6">
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-indigo-600 text-xs font-black hover:text-indigo-800 transition-colors uppercase tracking-widest">
            {isLogin ? 'Bạn chưa có tài khoản? Đăng ký' : 'Bạn đã có tài khoản? Đăng nhập'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
