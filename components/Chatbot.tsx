
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, PersonaType, Message, RiskLevel, ChatState, UserMemory } from '../types';
import { PERSONAS } from '../constants';
import { getGeminiStreamResponse } from '../services/geminiService';
import { Send, MessageCircle, Square, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatbotProps {
  user: User;
}

const Chatbot: React.FC<ChatbotProps> = ({ user }) => {
  const [selectedPersona, setSelectedPersona] = useState<PersonaType | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatState>(() => {
    try {
      const saved = localStorage.getItem(`spss_chats_${user.id}`);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [userMemory, setUserMemory] = useState<UserMemory>(() => {
    try {
      const saved = localStorage.getItem(`spss_memory_${user.id}`);
      return saved ? JSON.parse(saved) : { insights: "", lastUpdated: Date.now() };
    } catch (e) {
      return { insights: "", lastUpdated: Date.now() };
    }
  });

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const currentMessages = selectedPersona ? (chatHistory[selectedPersona] || []) : [];

  const scrollToBottom = useCallback(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(`spss_chats_${user.id}`, JSON.stringify(chatHistory));
    scrollToBottom();
  }, [chatHistory, scrollToBottom]);

  useEffect(() => {
    localStorage.setItem(`spss_memory_${user.id}`, JSON.stringify(userMemory));
  }, [userMemory, user.id]);

  const handleStopRequest = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsTyping(false);
  };

  const handleSendMessage = async () => {
    const text = input.trim();
    if (!text || !selectedPersona || isTyping) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: text, timestamp: Date.now() };
    setChatHistory(prev => ({ ...prev, [selectedPersona]: [...(prev[selectedPersona] || []), userMsg] }));
    setInput('');
    setIsTyping(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const historyForAI = currentMessages.slice(-8).map(m => ({ role: m.role, content: m.content }));
      
      const response = await getGeminiStreamResponse(
        text, 
        selectedPersona, 
        historyForAI, 
        userMemory.insights,
        () => {},
        controller.signal
      );

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: Date.now(),
        riskLevel: (response.riskLevel as RiskLevel) || RiskLevel.GREEN
      };

      setChatHistory(prev => ({ ...prev, [selectedPersona]: [...(prev[selectedPersona] || []), aiMsg] }));

      if (response.new_insights) {
        setUserMemory(prev => ({
          insights: prev.insights + " | " + response.new_insights,
          lastUpdated: Date.now()
        }));
      }

      if (response.riskLevel === RiskLevel.ORANGE || response.riskLevel === RiskLevel.RED) {
        const alerts = JSON.parse(localStorage.getItem('spss_alerts') || '[]');
        alerts.push({
          id: Date.now().toString(),
          studentName: user.username,
          riskLevel: response.riskLevel,
          lastMessage: text,
          timestamp: Date.now(),
          personaUsed: selectedPersona
        });
        localStorage.setItem('spss_alerts', JSON.stringify(alerts.slice(-50)));
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        const errId = `err-${Date.now()}`;
        setChatHistory(prev => ({
          ...prev, 
          [selectedPersona]: [...(prev[selectedPersona] || []), { id: errId, role: 'assistant', content: "Có chút trục trặc kết nối, bạn thử lại nhé!", timestamp: Date.now() }]
        }));
      }
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  };

  if (!selectedPersona) {
    return (
      <div className="flex flex-col items-center px-4 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12 mt-8">
          <h2 className="text-3xl sm:text-4xl font-black text-indigo-950 mb-3">Chào {user.username}, hôm nay bạn thế nào?</h2>
          <div className="flex flex-col items-center gap-2">
            <p className="text-indigo-600 font-bold bg-white/50 px-6 py-2 rounded-full inline-block shadow-sm">Chọn một người bạn để trút bầu tâm sự</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-10">
          {PERSONAS.map((p) => (
            <motion.button
              key={p.id}
              whileHover={{ y: -10, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedPersona(p.id)}
              className="glass p-8 rounded-[40px] flex flex-col items-center text-center group border-white shadow-xl transition-all duration-300"
            >
              <div className={`${p.color} p-5 rounded-3xl mb-6 shadow-lg`}>
                {p.icon}
              </div>
              <h3 className="font-black text-indigo-950 text-xl mb-1">{p.name}</h3>
              <p className="text-[10px] font-black text-indigo-400 mb-4 uppercase tracking-[0.2em]">{p.role}</p>
              <p className="text-sm text-indigo-800 font-medium leading-relaxed opacity-80">{p.description}</p>
            </motion.button>
          ))}
        </div>

        <a 
          href="https://discordapp.com/users/1006810420037828678" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl text-xs font-black hover:bg-indigo-100 transition-all shadow-sm mb-10"
        >
          <ExternalLink size={14} /> LIÊN HỆ CHÚNG TÔI QUA DISCORD
        </a>
      </div>
    );
  }

  const activePersona = PERSONAS.find(p => p.id === selectedPersona);

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] max-w-5xl mx-auto glass rounded-[40px] overflow-hidden shadow-2xl border-white/60 relative">
      <div className="p-5 border-b border-indigo-100 flex justify-between items-center bg-white/60 backdrop-blur-xl z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { handleStopRequest(); setSelectedPersona(null); }}
            className="p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest"
          >
            QUAY LẠI
          </button>
          <div className={`${activePersona?.color} p-2.5 rounded-xl shadow-md`}>
            {activePersona?.icon}
          </div>
          <div>
            <h3 className="font-black text-indigo-950 text-base leading-tight">{activePersona?.name}</h3>
            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">Phản hồi siêu tốc với Flash AI</p>
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-white/20 to-indigo-50/10">
        {currentMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-40 text-center">
            <MessageCircle size={40} className="text-indigo-200 mb-4" />
            <p className="text-indigo-950 font-black text-xl mb-1">Hãy bắt đầu câu chuyện của bạn...</p>
          </div>
        ) : (
          currentMessages.map((msg) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-6 py-4 rounded-3xl shadow-sm text-sm font-bold leading-relaxed ${
                msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-indigo-950 rounded-bl-none border border-indigo-50'
              }`}>
                {msg.content}
              </div>
            </motion.div>
          ))
        )}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/80 backdrop-blur-sm px-5 py-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1.5 items-center border border-indigo-50">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-duration:0.6s]"></div>
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.1s]"></div>
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.2s]"></div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-6 bg-white/90 backdrop-blur-xl border-t border-indigo-50">
        <div className="relative flex items-center gap-3 max-w-4xl mx-auto">
          {/* text-base (16px) là cực kỳ quan trọng để chống auto-zoom trên iOS */}
          <input
            disabled={isTyping}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={isTyping ? "AI đang trả lời..." : "Nhập lời muốn nói..."}
            className="w-full bg-indigo-50/30 border-2 border-indigo-50/50 rounded-3xl px-6 py-5 pr-16 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-indigo-950 font-bold placeholder:text-indigo-300 text-base"
          />
          {isTyping ? (
            <button onClick={handleStopRequest} className="absolute right-2 p-4 bg-rose-500 text-white rounded-2xl hover:bg-rose-600 transition-all">
              <Square size={20} fill="currentColor" />
            </button>
          ) : (
            <button
              disabled={!input.trim()}
              onClick={handleSendMessage}
              className="absolute right-2 p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:bg-indigo-200 transition-all"
            >
              <Send size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
