
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Trash2, Heart, AlertCircle, PhoneCall } from 'lucide-react';

const SafeCorner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'breathe' | 'trash' | 'sos'>('breathe');

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-2">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-indigo-900 mb-2">Góc An Toàn</h2>
        <p className="text-emerald-600 font-bold text-sm">Dành cho những lúc bạn cần sự bình yên.</p>
      </div>

      <div className="flex justify-center gap-1 p-1 glass rounded-2xl w-full sm:w-fit mx-auto overflow-x-auto">
        <button 
          onClick={() => setActiveTab('breathe')}
          className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition font-black text-[11px] sm:text-sm ${activeTab === 'breathe' ? 'bg-emerald-500 text-white shadow-md' : 'text-emerald-700 hover:bg-emerald-50'}`}
        >
          <Wind size={16} /> HÍT THỞ
        </button>
        <button 
          onClick={() => setActiveTab('trash')}
          className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition font-black text-[11px] sm:text-sm ${activeTab === 'trash' ? 'bg-indigo-500 text-white shadow-md' : 'text-indigo-700 hover:bg-indigo-50'}`}
        >
          <Trash2 size={16} /> THÙNG RÁC
        </button>
        <button 
          onClick={() => setActiveTab('sos')}
          className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition font-black text-[11px] sm:text-sm ${activeTab === 'sos' ? 'bg-rose-500 text-white shadow-md' : 'text-rose-700 hover:bg-rose-50'}`}
        >
          <Heart size={16} /> SOS
        </button>
      </div>

      <div className="glass min-h-[450px] rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col items-center justify-center border-white shadow-xl">
        <AnimatePresence mode="wait">
          {activeTab === 'breathe' && <BreathingTool key="breathe" />}
          {activeTab === 'trash' && <EmotionTrash key="trash" />}
          {activeTab === 'sos' && <SOSSection key="sos" />}
        </AnimatePresence>
      </div>
    </div>
  );
};

const BreathingTool = () => {
  const [stage, setStage] = useState<'hít vào' | 'giữ' | 'thở ra'>('hít vào');
  
  React.useEffect(() => {
    const sequence = async () => {
      while (true) {
        setStage('hít vào');
        await new Promise(r => setTimeout(r, 4000));
        setStage('giữ');
        await new Promise(r => setTimeout(r, 4000));
        setStage('thở ra');
        await new Promise(r => setTimeout(r, 4000));
      }
    };
    sequence();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="text-center w-full"
    >
      <div className="mb-10 text-emerald-900">
        <h3 className="text-xl font-black mb-4 uppercase tracking-wider">Bài tập hít thở 5-4-3-2-1</h3>
        <p className="text-sm font-medium">Hãy tập trung vào tâm trí để tìm lại sự cân bằng.</p>
      </div>
      
      <div className="relative flex items-center justify-center">
        <motion.div 
          animate={{
            scale: stage === 'hít vào' ? 1.4 : stage === 'giữ' ? 1.4 : 1,
            backgroundColor: stage === 'hít vào' ? '#dcfce7' : stage === 'giữ' ? '#bbf7d0' : '#f0fdf4'
          }}
          transition={{ duration: 4, ease: "easeInOut" }}
          className="w-40 h-40 sm:w-48 sm:h-48 rounded-full border-4 border-emerald-300 flex items-center justify-center shadow-inner"
        >
          <span className="text-emerald-800 font-black text-xl sm:text-2xl uppercase tracking-widest">{stage}</span>
        </motion.div>
        
        <motion.div 
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full border-2 border-emerald-200/50 -z-10"
        ></motion.div>
      </div>
    </motion.div>
  );
};

const EmotionTrash = () => {
  const [thought, setThought] = useState('');
  const [isDeleted, setIsDeleted] = useState(false);

  const handleDelete = () => {
    if (!thought.trim()) return;
    setIsDeleted(true);
    setTimeout(() => {
      setThought('');
      setIsDeleted(false);
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md text-center"
    >
      <h3 className="text-xl font-black text-indigo-950 mb-4 uppercase">Thùng rác cảm xúc</h3>
      <p className="text-sm text-indigo-600 font-medium mb-6">Viết ra những muộn phiền và để chúng tan biến mãi mãi.</p>
      
      <div className="relative">
        <textarea
          value={thought}
          onChange={(e) => setThought(e.target.value)}
          placeholder="Hôm nay mình cảm thấy tệ vì..."
          className={`w-full h-44 p-6 rounded-3xl bg-white border-2 border-indigo-100 shadow-inner focus:outline-none focus:border-indigo-500 transition-all resize-none text-indigo-950 font-bold placeholder:text-indigo-200 ${isDeleted ? 'scale-0 opacity-0 rotate-12' : 'scale-100 opacity-100'} duration-700`}
        />
        <AnimatePresence>
          {isDeleted && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center text-indigo-700 font-black text-lg bg-white/80 rounded-3xl backdrop-blur-sm"
            >
              Cảm xúc tiêu cực đã tan biến... ✨
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button 
        disabled={!thought || isDeleted}
        onClick={handleDelete}
        className="mt-6 flex items-center gap-2 mx-auto bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-indigo-700 disabled:opacity-50 shadow-xl active:scale-95 transition"
      >
        <Trash2 size={18} /> DỌN DẸP NGAY
      </button>
    </motion.div>
  );
};

const SOSSection = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center space-y-6 w-full max-w-md"
    >
      <div className="bg-rose-100 p-5 rounded-full w-24 h-24 flex items-center justify-center text-rose-600 mx-auto mb-4 shadow-inner">
        <AlertCircle size={44} />
      </div>
      <h3 className="text-2xl font-black text-rose-950 uppercase tracking-tight">Bạn cần trợ giúp?</h3>
      <p className="text-rose-800 font-bold text-sm leading-relaxed">Đừng lo lắng, chúng mình luôn ở đây để bảo vệ bạn. Hãy gọi ngay nhé.</p>
      
      <div className="grid grid-cols-1 gap-4">
        <a href="tel:18001567" className="flex items-center justify-between bg-rose-600 text-white p-6 rounded-3xl hover:bg-rose-700 transition shadow-2xl active:scale-95">
          <div className="text-left">
            <p className="font-black text-2xl tracking-tighter">1800 1567</p>
            <p className="text-[10px] font-black uppercase opacity-90 tracking-widest">TỔNG ĐÀI QUỐC GIA</p>
          </div>
          <PhoneCall size={32} />
        </a>

        <div className="bg-white p-6 rounded-3xl border-2 border-rose-50 text-left shadow-sm">
          <h4 className="font-black text-indigo-950 mb-3 text-xs uppercase tracking-wider border-b border-indigo-50 pb-2">Số điện thoại khẩn cấp</h4>
          <ul className="space-y-3 text-sm text-indigo-900 font-bold">
            <li className="flex justify-between items-center">
              <span>Cấp cứu y tế:</span> 
              <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-lg">115</span>
            </li>
            <li className="flex justify-between items-center">
              <span>Công an:</span> 
              <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-lg">113</span>
            </li>
            <li className="flex justify-between items-center">
              <span>Hỗ trợ trẻ em:</span> 
              <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-lg">111</span>
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default SafeCorner;
