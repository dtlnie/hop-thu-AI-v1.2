
import React, { useState } from 'react';
import { User } from '../types';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, ShieldCheck } from 'lucide-react';

interface AuthPageProps {
  onAuth: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const usersStr = localStorage.getItem('spss_all_users') || '[]';
    const users = JSON.parse(usersStr);

    if (isLogin) {
      const foundUser = users.find((u: any) => u.username === username && u.password === password);
      if (foundUser) {
        const userData: User = {
          id: foundUser.id,
          username: foundUser.username,
          role: foundUser.role,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${foundUser.username}`
        };
        localStorage.setItem('spss_user', JSON.stringify(userData));
        onAuth(userData);
      } else {
        setError('Tài khoản hoặc mật khẩu không chính xác');
      }
    } else {
      if (users.some((u: any) => u.username === username)) {
        setError('Tên đăng nhập đã tồn tại');
        return;
      }
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        username,
        password,
        role
      };
      users.push(newUser);
      localStorage.setItem('spss_all_users', JSON.stringify(users));
      
      const userData: User = {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newUser.username}`
      };
      localStorage.setItem('spss_user', JSON.stringify(userData));
      onAuth(userData);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="bg-indigo-600 p-3 rounded-2xl text-white mb-3 shadow-lg">
            <ShieldCheck size={28} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-indigo-900 text-center">
            {isLogin ? 'Chào mừng trở lại!' : 'Tham gia cùng chúng mình'}
          </h2>
          <p className="text-indigo-500 text-xs mt-1">Hệ thống hỗ trợ tâm lý học đường</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-indigo-700 uppercase mb-1 ml-1 tracking-wider">Tên đăng nhập</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white border-2 border-indigo-50 focus:border-indigo-500 focus:ring-0 transition outline-none text-indigo-950 font-bold shadow-sm placeholder:text-indigo-200"
              placeholder="Nhập tên của bạn..."
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-indigo-700 uppercase mb-1 ml-1 tracking-wider">Mật khẩu</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white border-2 border-indigo-50 focus:border-indigo-500 focus:ring-0 transition outline-none text-indigo-950 font-bold shadow-sm placeholder:text-indigo-200"
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-[10px] font-black text-indigo-700 uppercase mb-1 ml-1 tracking-wider">Bạn là...</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`py-2.5 rounded-xl text-xs font-black transition ${role === 'student' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-indigo-600 border border-indigo-100'}`}
                >
                  Học sinh
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`py-2.5 rounded-xl text-xs font-black transition ${role === 'teacher' ? 'bg-amber-500 text-white shadow-md' : 'bg-white text-amber-600 border border-amber-100'}`}
                >
                  Giáo viên
                </button>
              </div>
            </div>
          )}

          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-rose-600 text-[11px] text-center font-black bg-rose-50 py-2 rounded-lg border border-rose-100"
            >
              {error}
            </motion.p>
          )}

          <button 
            type="submit"
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black shadow-lg shadow-indigo-100 transition active:scale-95"
          >
            {isLogin ? 'ĐĂNG NHẬP NGAY' : 'TẠO TÀI KHOẢN'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-indigo-600 text-xs font-black hover:underline underline-offset-4"
          >
            {isLogin ? 'CHƯA CÓ TÀI KHOẢN? ĐĂNG KÝ' : 'ĐÃ CÓ TÀI KHOẢN? ĐĂNG NHẬP'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
