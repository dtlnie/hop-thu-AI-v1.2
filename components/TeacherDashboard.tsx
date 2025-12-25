
import React, { useState, useEffect } from 'react';
import { RiskLevel, StudentAlert } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie, Legend 
} from 'recharts';
import { AlertTriangle, Clock, User, Filter, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const TeacherDashboard: React.FC = () => {
  const [alerts, setAlerts] = useState<StudentAlert[]>([]);
  
  useEffect(() => {
    const savedAlerts = JSON.parse(localStorage.getItem('spss_alerts') || '[]');
    setAlerts(savedAlerts.reverse());
  }, []);

  const statsData = [
    { name: 'Bình thường', value: alerts.filter(a => a.riskLevel === RiskLevel.GREEN).length + 25, color: '#059669' },
    { name: 'Căng thẳng', value: alerts.filter(a => a.riskLevel === RiskLevel.YELLOW).length + 12, color: '#d97706' },
    { name: 'Rủi ro cao', value: alerts.filter(a => a.riskLevel === RiskLevel.ORANGE).length + 5, color: '#ea580c' },
    { name: 'Nguy cấp', value: alerts.filter(a => a.riskLevel === RiskLevel.RED).length, color: '#dc2626' },
  ];

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.GREEN: return 'bg-emerald-600 text-white border-emerald-700';
      case RiskLevel.YELLOW: return 'bg-amber-500 text-white border-amber-600';
      case RiskLevel.ORANGE: return 'bg-orange-600 text-white border-orange-700';
      case RiskLevel.RED: return 'bg-rose-600 text-white border-rose-700';
      default: return 'bg-slate-500 text-white';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-indigo-950">Bảng Quản Lý Tâm Lý</h2>
          <p className="text-indigo-700 font-medium">Giám sát và hỗ trợ sức khỏe tinh thần học sinh toàn trường</p>
        </div>
        <div className="flex gap-2">
          <div className="glass px-4 py-2 rounded-xl border-indigo-200 flex items-center gap-2 text-indigo-900 font-bold shadow-sm">
            <User size={18} /> 42 Học sinh
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-lg transition">
            <Filter size={18} /> Lọc báo cáo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass p-6 rounded-3xl shadow-md border-white">
          <h3 className="font-bold text-indigo-950 mb-6 flex items-center gap-2 text-lg">
            <ShieldCheck size={22} className="text-emerald-600" /> Biểu Đồ Phân Phối Tâm Lý
          </h3>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
                <XAxis dataKey="name" stroke="#475569" fontSize={12} fontWeight="bold" tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={12} fontWeight="bold" tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {statsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass p-6 rounded-3xl shadow-md border-white">
          <h3 className="font-bold text-indigo-950 mb-6 flex items-center gap-2 text-lg">
            <AlertTriangle size={22} className="text-amber-600" /> Tỉ Lệ Cảnh Báo
          </h3>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {statsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl overflow-hidden shadow-lg border-white">
        <div className="p-6 border-b border-indigo-100 bg-white/50 flex justify-between items-center">
          <h3 className="font-bold text-indigo-950 text-lg">Danh Sách Cảnh Báo Gần Đây</h3>
          <span className="bg-rose-600 text-white px-4 py-1.5 rounded-full text-xs font-black shadow-sm">
            {alerts.length} yêu cầu mới
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-indigo-600 text-[11px] uppercase font-black text-white tracking-widest">
                <th className="px-6 py-4">Học sinh</th>
                <th className="px-6 py-4">Mức độ rủi ro</th>
                <th className="px-6 py-4">Nội dung cuối</th>
                <th className="px-6 py-4 text-center">Thời gian</th>
                <th className="px-6 py-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-100 bg-white/20">
              {alerts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-indigo-400 font-bold">
                    Hiện chưa có cảnh báo nguy cấp nào. Hệ thống đang hoạt động tốt.
                  </td>
                </tr>
              ) : (
                alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-indigo-50/40 transition group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-200 border-2 border-white flex items-center justify-center text-indigo-700 shadow-sm">
                          <User size={18} />
                        </div>
                        <span className="font-bold text-indigo-950 text-sm">{alert.studentName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black shadow-sm ${getRiskColor(alert.riskLevel)}`}>
                        {alert.riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs text-indigo-900 font-medium truncate max-w-[250px] italic">"{alert.lastMessage}"</p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-[11px] text-indigo-600 font-bold">
                        <Clock size={14} /> {new Date(alert.timestamp).toLocaleTimeString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition shadow-md hover:scale-105 active:scale-95">
                        Xử lý ngay
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default TeacherDashboard;
