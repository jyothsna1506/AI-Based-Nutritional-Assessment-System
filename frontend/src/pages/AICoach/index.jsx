import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bot, Send, Sparkles, User, AlertCircle,
  Lightbulb, Utensils, Trash2, Zap
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

const CHAT_STORAGE_KEY = 'nutriai_coach_chat_history';

export default function AICoach() {
  const { t } = useLanguage();

  const suggestedCategories = [
    { label: t('ai_coach_prompt_deficiencies_label'), prompt: t('ai_coach_prompt_deficiencies'), icon: AlertCircle, color: 'text-amber-600' },
    { label: t('ai_coach_prompt_protein_label'), prompt: t('ai_coach_prompt_protein'), icon: Utensils, color: 'text-emerald-600' },
    { label: t('ai_coach_prompt_iron_label'), prompt: t('ai_coach_prompt_iron'), icon: Zap, color: 'text-[#0284c7]' },
    { label: t('ai_coach_prompt_tea_label'), prompt: t('ai_coach_prompt_tea'), icon: Lightbulb, color: 'text-purple-600' },
  ];

  // Load chat messages from localStorage or initialize with welcome message
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
    return [
      {
        role: 'assistant',
        content: t('ai_coach_initial_message'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);

  // Persist messages to localStorage whenever they update
  useEffect(() => {
    if (messages && messages.length > 0) {
      try {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
      } catch (err) {
        console.error('Failed to save chat history:', err);
      }
    }
  }, [messages]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { role: 'user', content: query, timestamp: timeStr };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/ai/chat', {
        messages: updatedMessages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        })),
        include_health_context: true
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply || t('ai_coach_error_reply'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: err.response?.data?.detail || t('ai_coach_connection_error'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    try {
      localStorage.removeItem(CHAT_STORAGE_KEY);
    } catch (err) {
      console.error('Failed to clear storage:', err);
    }
    setMessages([
      {
        role: 'assistant',
        content: t('ai_coach_reset_message'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <DashboardLayout title={t('ai_coach_title')} subtitle={t('ai_coach_subtitle')}>
      <div className="flex flex-col h-[calc(100vh-220px)] sm:h-[calc(100vh-240px)] max-w-5xl mx-auto w-full overflow-x-hidden pb-2 text-[#0a192f]">

        {/* 🌟 Header Status & Telemetry Bar */}
        <div className="glass-card px-4 py-3 mb-3.5 flex flex-wrap items-center justify-between gap-3 border border-sky-200 bg-white/95 rounded-2xl text-xs shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-black text-[#0a192f]">{t('ai_coach_header_status')}</span>
            <span className="text-[#0284c7] font-bold hidden sm:inline">{t('ai_coach_context_linked')}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearChat}
              className="text-[11px] font-bold text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-1 transition-all cursor-pointer shadow-xs"
              title={t('ai_coach_clear_title')}
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>{t('ai_coach_clear_btn')}</span>
            </button>
          </div>
        </div>

        {/* 💬 Messages Container */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 glass-card mb-3.5 rounded-3xl custom-scrollbar border border-slate-200 bg-white/95 shadow-sm">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#0a192f] flex items-center justify-center text-white shrink-0 mt-1 shadow-md">
                  <Bot className="w-5 h-5 text-[#0284c7]" />
                </div>
              )}
              
              <div className="flex flex-col max-w-[92%] sm:max-w-[85%]">
                <div
                  className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                    msg.role === 'user'
                      ? 'bg-[#0a192f] text-white rounded-br-none font-bold'
                      : 'bg-slate-50 border border-slate-200 text-[#0a192f] rounded-bl-none font-semibold'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-2.5 last:mb-0 leading-relaxed">{children}</p>,
                        strong: ({ children }) => <strong className="font-black text-[#0a192f]">{children}</strong>,
                        em: ({ children }) => <em className="italic text-slate-700">{children}</em>,
                        h1: ({ children }) => <h1 className="text-base sm:text-lg font-black text-[#0a192f] mt-3 mb-2 border-b border-slate-200 pb-1">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-sm sm:text-base font-black text-[#0a192f] mt-3 mb-2">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-xs sm:text-sm font-black text-[#0a192f] mt-3 mb-1.5">{children}</h3>,
                        ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-2.5 ml-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-2.5 ml-1">{children}</ol>,
                        li: ({ children }) => <li className="text-xs sm:text-sm text-slate-800 font-medium">{children}</li>,
                        hr: () => <hr className="my-3 border-slate-200" />,
                        code: ({ children }) => <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-[#0284c7] font-bold">{children}</code>,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                  )}
                </div>
                <span className={`text-[10px] text-slate-400 mt-1 font-semibold px-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp}
                </span>
              </div>

              {msg.role === 'user' && (
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-[#0284c7] shrink-0 mt-1">
                  <User className="w-5 h-5" />
                </div>
              )}
            </motion.div>
          ))}

          {/* ⚡ Thinking Neural Spinner */}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 items-center text-slate-500 text-xs p-1">
              <div className="w-9 h-9 rounded-2xl bg-[#0a192f] flex items-center justify-center text-white shrink-0 shadow-md">
                <Bot className="w-5 h-5 text-[#0284c7] animate-pulse" />
              </div>
              <div className="flex items-center gap-2.5 bg-sky-50 px-4 py-2.5 rounded-2xl border border-sky-200">
                <Sparkles className="w-4 h-4 text-[#0284c7] animate-spin" />
                <span className="font-bold text-[#0284c7]">{t('ai_coach_synthesizing')}</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* 💡 Categorized Suggested Prompts */}
        {messages.length < 4 && (
          <div className="flex flex-nowrap sm:flex-wrap gap-2 mb-3 overflow-x-auto custom-scrollbar pb-1">
            {suggestedCategories.map((cat, i) => (
              <button
                key={i}
                onClick={() => handleSend(cat.prompt)}
                className="text-[11px] sm:text-xs bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3.5 py-2 rounded-2xl transition-all flex items-center gap-2 shrink-0 cursor-pointer whitespace-nowrap shadow-xs font-bold"
              >
                <cat.icon className={`w-3.5 h-3.5 ${cat.color} shrink-0`} />
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* ⌨️ Chat Input Bar */}
        <div className="glass-card p-2 flex items-center gap-2 shrink-0 rounded-2xl border border-slate-200 bg-white shadow-md">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('ai_coach_input_placeholder')}
            className="flex-1 bg-transparent px-4 py-3 text-xs sm:text-sm text-[#0a192f] font-bold placeholder-slate-400 focus:outline-none min-w-0"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="px-4 py-3 rounded-xl bg-[#0a192f] hover:bg-[#0284c7] text-white font-bold disabled:opacity-40 shadow-md transition-all shrink-0 cursor-pointer flex items-center gap-2 text-xs sm:text-sm"
          >
            <span className="hidden sm:inline text-xs">{t('ai_coach_send_btn')}</span>
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
}
