
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
      const response = await getGeminiStreamResponse(
        text, 
        selectedPersona, 
        (chatHistory[selectedPersona] || []).slice(-4).map(m => ({ role: m.role, content: m.content })), 
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
          insights: (prev.insights + " | " + response.new_insights).slice(-400),
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
        localStorage.setItem('spss_alerts', JSON.stringify(alerts.slice(-30)));
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        setChatHistory(prev => ({
          ...prev, 
          [selectedPersona]: [...(prev[selectedPersona] || []), { 
            id: `err-${Date.now()}`, 
            role: 'assistant', 
            content: "Có chút trục trặc nhỏ, mình vẫn ở đây lắng nghe bạn nè.", 
            timestamp: Date.now() 
          }]
        }));
      }
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  };

  if (!selectedPersona) {
    return (
      <div className="flex flex-col items-center px-4 max-w-6xl mx-auto pb-10 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10 mt-6">
          <h2 className="text-2xl sm:text-4xl font-black text-indigo-950 mb-3 leading-tight">Chào {user.username},<br/>hôm nay bạn thế nào?</h2>
          <p className="text-indigo-600 font-bold bg-white/60 px-5 py-2 rounded-full inline-block shadow-sm text-xs uppercase tracking-wider">Chọn người đồng hành của bạn</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-8">
          {PERSONAS.map((p) => (
            <motion.button
              key={p.id}
              whileHover={{ y: -5, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedPersona(p.id)}
              className="glass p-6 rounded-[32px] flex flex-col items-center text-center border-white shadow-lg transition-all"
            >
              <div className={`${p.color} p-4 rounded-2xl mb-4 shadow-md`}>
                {p.icon}
              </div>
              <h3 className="font-black text-indigo-950 text-lg mb-1">{p.name}</h3>
              <p className="text-[9px] font-black text-indigo-400 mb-3 uppercase tracking-widest">{p.role}</p>
              <p className="text-xs text-indigo-800 font-medium leading-relaxed opacity-70">{p.description}</p>
            </motion.button>
          ))}
        </div>

        <a 
          href="https://discordapp.com/users/1006810420037828678" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-2xl text-[10px] font-black hover:bg-indigo-50 transition-all shadow-sm tracking-widest uppercase border border-indigo-100"
        >
          <ExternalLink size={14} /> LIÊN HỆ ĐỘI NGŨ KỸ THUẬT
        </a>
      </div>
    );
  }

  const activePersona = PERSONAS.find(p => p.id === selectedPersona);

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-5xl mx-auto glass rounded-[32px] overflow-hidden shadow-2xl border-white relative">
      <div className="p-4 border-b border-indigo-50 flex justify-between items-center bg-white/80 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { handleStopRequest(); setSelectedPersona(null); }}
            className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest"
          >
            QUAY LẠI
          </button>
          <div className="hidden xs:flex items-center gap-3">
            <div className={`${activePersona?.color} p-2 rounded-xl shadow-sm`}>
              {activePersona?.icon}
            </div>
            <div>
              <h3 className="font-black text-indigo-950 text-sm leading-tight">{activePersona?.name}</h3>
              <p className="text-[8px] font-black text-emerald-600 uppercase">AI đang trực tuyến</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-4 bg-white/30">
        {currentMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-30 text-center px-4">
            <MessageCircle size={32} className="text-indigo-300 mb-4" />
            <p className="text-indigo-950 font-black text-lg">Mọi tâm tư của bạn đều được lắng nghe và bảo mật.</p>
          </div>
        ) : (
          currentMessages.map((msg) => (
            <motion.div key={msg.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] px-5 py-3.5 rounded-2xl shadow-sm text-sm font-bold leading-relaxed ${
                msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-indigo-950 rounded-bl-none border border-indigo-50'
              }`}>
                {msg.content}
              </div>
            </motion.div>
          ))
        )}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/90 px-4 py-2 rounded-xl rounded-bl-none shadow-sm flex gap-1 items-center border border-indigo-50">
              <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce"></span>
              <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.1s]"></span>
              <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 sm:p-5 bg-white/90 border-t border-indigo-50">
        <div className="relative flex items-center gap-2 max-w-4xl mx-auto">
          <input
            disabled={isTyping}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={isTyping ? "AI đang phản hồi..." : "Trút bỏ gánh nặng tại đây..."}
            className="w-full bg-indigo-50/50 border-2 border-transparent focus:border-indigo-400 focus:bg-white rounded-2xl px-5 py-4 pr-14 outline-none transition-all text-indigo-950 font-bold placeholder:text-indigo-300 text-base shadow-inner"
          />
          {isTyping ? (
            <button onClick={handleStopRequest} className="absolute right-2 p-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-all shadow-md">
              <Square size={18} fill="currentColor" />
            </button>
          ) : (
            <button
              disabled={!input.trim()}
              onClick={handleSendMessage}
              className="absolute right-2 p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-indigo-100 transition-all shadow-md"
            >
              <Send size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
