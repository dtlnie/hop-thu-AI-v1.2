
import React, { useState, useEffect, useRef } from 'react';
import { User, PersonaType, Message, RiskLevel } from '../types';
import { PERSONAS } from '../constants';
import { getGeminiResponse } from '../services/geminiService';
import { Send, Phone, UserX, AlertTriangle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatbotProps {
  user: User;
}

const Chatbot: React.FC<ChatbotProps> = ({ user }) => {
  const [selectedPersona, setSelectedPersona] = useState<PersonaType | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentRisk, setCurrentRisk] = useState<RiskLevel>(RiskLevel.GREEN);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedPersona || currentRisk === RiskLevel.RED) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
    const response = await getGeminiResponse(input, selectedPersona, history);

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.reply,
      timestamp: Date.now(),
      riskLevel: response.riskLevel as RiskLevel
    };

    setMessages(prev => [...prev, aiMessage]);
    setCurrentRisk(response.riskLevel as RiskLevel);
    setIsTyping(false);

    if (response.riskLevel === RiskLevel.ORANGE || response.riskLevel === RiskLevel.RED) {
      const alerts = JSON.parse(localStorage.getItem('spss_alerts') || '[]');
      alerts.push({
        id: Date.now().toString(),
        studentName: user.username,
        riskLevel: response.riskLevel,
        lastMessage: input,
        timestamp: Date.now()
      });
      localStorage.setItem('spss_alerts', JSON.stringify(alerts.slice(-50)));
    }
  };

  if (!selectedPersona) {
    return (
      <div className="flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl font-bold text-indigo-900 mb-2">Hôm nay bạn thấy thế nào?</h2>
          <p className="text-indigo-600 font-medium">Hãy chọn một người bạn để bắt đầu trò chuyện nhé</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {PERSONAS.map((p) => (
            <motion.button
              key={p.id}
              whileHover={{ scale: 1.05, translateY: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedPersona(p.id)}
              className="glass p-6 rounded-3xl flex flex-col items-center text-center group transition shadow-lg hover:shadow-xl border-white"
            >
              <div className={`${p.color} p-4 rounded-2xl mb-4 group-hover:scale-110 transition shadow-md`}>
                {p.icon}
              </div>
              <h3 className="font-bold text-indigo-900 text-lg">{p.name}</h3>
              <p className="text-xs font-bold text-indigo-500 mb-3 tracking-wide">{p.role}</p>
              <p className="text-sm text-indigo-800 leading-relaxed font-medium">{p.description}</p>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  const activePersona = PERSONAS.find(p => p.id === selectedPersona);

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto glass rounded-3xl overflow-hidden shadow-2xl border-white/50">
      <div className="p-4 border-b border-indigo-100 flex justify-between items-center bg-white/60">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSelectedPersona(null)}
            className="p-2 hover:bg-white rounded-full transition text-indigo-500 hover:text-indigo-700"
          >
            <UserX size={20} />
          </button>
          <div className={`${activePersona?.color} p-2.5 rounded-xl shadow-sm`}>
            {activePersona?.icon}
          </div>
          <div>
            <h3 className="font-bold text-indigo-900 leading-none">{activePersona?.name}</h3>
            <p className="text-[10px] font-black text-emerald-600 uppercase mt-1 tracking-tighter">● Đang trực tuyến</p>
          </div>
        </div>

        {currentRisk === RiskLevel.ORANGE && (
          <motion.button 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg hover:bg-amber-600 transition"
            onClick={() => alert("Cô Tâm An đã nhận được tín hiệu cần hỗ trợ của bạn. Cô sẽ liên hệ sớm nhất nhé!")}
          >
            <AlertTriangle size={14} /> Liên hệ Giáo viên
          </motion.button>
        )}
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-white/30">
        {messages.length === 0 && (
          <div className="text-center py-12 opacity-60">
            <p className="text-indigo-900 font-bold text-lg">Chào bạn!</p>
            <p className="text-indigo-700 font-medium">Bạn có chuyện gì muốn kể cho {activePersona?.name} nghe không?</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] px-5 py-3.5 rounded-2xl text-sm font-medium shadow-md ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none' 
                  : 'bg-white text-indigo-900 rounded-bl-none border border-indigo-100'
              }`}
            >
              {msg.content}
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none border border-indigo-50 shadow-sm flex gap-1">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}

        {currentRisk === RiskLevel.RED && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-rose-50 border-2 border-rose-200 p-6 rounded-3xl text-center space-y-4 shadow-xl"
          >
            <div className="flex justify-center text-rose-600 mb-2">
              <AlertCircle size={48} />
            </div>
            <h4 className="text-rose-800 font-bold text-xl">Bạn ơi, hãy dừng lại một chút nhé!</h4>
            <p className="text-rose-700 text-sm font-medium leading-relaxed">
              Chúng mình nhận thấy bạn đang trải qua những cảm xúc rất khó khăn. 
              Mọi chuyện đều có cách giải quyết, và bạn không hề cô đơn.
            </p>
            <div className="flex flex-col gap-3">
              <a 
                href="tel:18001567" 
                className="flex items-center justify-center gap-2 bg-rose-600 text-white py-4 rounded-xl font-black shadow-lg hover:bg-rose-700 transition transform hover:scale-[1.02]"
              >
                <Phone size={20} /> GỌI NGAY: 1800 1567
              </a>
              <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest">Tổng đài quốc gia bảo vệ trẻ em (24/7)</p>
            </div>
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 bg-white/70 border-t border-indigo-100">
        <div className="relative flex items-center gap-2">
          <input
            disabled={currentRisk === RiskLevel.RED}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={currentRisk === RiskLevel.RED ? "Chế độ khẩn cấp được kích hoạt..." : "Nhập tin nhắn tâm sự..."}
            className="w-full bg-white border-2 border-indigo-50 rounded-2xl px-5 py-4 pr-14 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition text-indigo-900 font-medium placeholder:text-indigo-300 disabled:opacity-50 shadow-inner"
          />
          <button
            disabled={!input.trim() || isTyping || currentRisk === RiskLevel.RED}
            onClick={handleSendMessage}
            className="absolute right-2 p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition shadow-md active:scale-95"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
