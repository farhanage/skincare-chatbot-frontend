import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function AIChatPage({ user, currentChatId, onChatIdChange }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Create initial chat if none exists
  useEffect(() => {
    if (!user) return;
    
    if (!currentChatId) {
      // Check if any chats exist
      const userChatsKey = `user_${user.id}_chats`;
      const saved = localStorage.getItem(userChatsKey);
      
      if (saved) {
        try {
          const sessions = JSON.parse(saved);
          if (sessions.length > 0) {
            onChatIdChange(sessions[0].id);
          } else {
            // Create first chat
            const newChatId = `chat_${Date.now()}`;
            const newSession = {
              id: newChatId,
              title: 'Chat Baru',
              createdAt: new Date().toISOString(),
              lastUpdated: new Date().toISOString(),
              messageCount: 0
            };
            localStorage.setItem(userChatsKey, JSON.stringify([newSession]));
            onChatIdChange(newChatId);
          }
        } catch (e) {
          console.error('Failed to load chat sessions:', e);
        }
      }
    }
  }, [user, currentChatId, onChatIdChange]);

  // Load current chat messages
  useEffect(() => {
    if (!currentChatId || !user) return;
    
    const chatKey = `user_${user.id}_chat_${currentChatId}`;
    const saved = localStorage.getItem(chatKey);
    
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setMessages(data.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      } catch (e) {
        console.error('Failed to load chat:', e);
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, [currentChatId, user]);

  // Save messages when they change
  useEffect(() => {
    if (!currentChatId || !user || messages.length === 0) return;
    
    const chatKey = `user_${user.id}_chat_${currentChatId}`;
    localStorage.setItem(chatKey, JSON.stringify({
      messages,
      lastUpdated: new Date().toISOString()
    }));

    // Update session list
    updateChatSession(currentChatId, messages);
  }, [messages, currentChatId, user]);

  const updateChatSession = (chatId, msgs) => {
    if (!user) return;
    
    const userChatsKey = `user_${user.id}_chats`;
    const saved = localStorage.getItem(userChatsKey);
    
    if (saved) {
      try {
        const sessions = JSON.parse(saved);
        const updated = sessions.map(session => {
          if (session.id === chatId) {
            return {
              ...session,
              title: generateTitle(msgs),
              lastUpdated: new Date().toISOString(),
              messageCount: msgs.length
            };
          }
          return session;
        });
        localStorage.setItem(userChatsKey, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to update chat session:', e);
      }
    }
  };

  const generateTitle = (msgs) => {
    if (!msgs || msgs.length === 0) return 'Chat Baru';
    const firstUserMsg = msgs.find(m => !m.isBot);
    if (firstUserMsg) {
      return firstUserMsg.text.substring(0, 40) + (firstUserMsg.text.length > 40 ? '...' : '');
    }
    return 'Chat Baru';
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputMessage,
          disease_info: null
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      
      const botMessage = {
        id: Date.now() + 1,
        text: data.response || 'Maaf, terjadi kesalahan.',
        isBot: true,
        timestamp: new Date(),
        products: data.products || []
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Maaf, terjadi kesalahan saat menghubungi server. Silakan coba lagi.',
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 p-5 flex items-center gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-xl shadow-lg">
              <Bot size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-black text-xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">AI Assistant</h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-600 font-semibold">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-3xl mb-6 shadow-2xl shadow-emerald-200 animate-pulse">
                <Bot className="text-white" size={56} />
              </div>
              <h2 className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3">Halo! 👋</h2>
              <p className="text-slate-600 max-w-md text-base font-medium leading-relaxed">
                Saya adalah AI Assistant untuk membantu Anda dengan pertanyaan seputar skincare dan perawatan kulit.
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`mb-6 flex ${msg.isBot ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`flex gap-3 max-w-[75%] ${msg.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className={`${msg.isBot ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200' : 'bg-gradient-to-br from-slate-600 to-slate-700 shadow-lg shadow-slate-300'} p-2.5 rounded-xl h-fit`}>
                  {msg.isBot ? <Bot className="text-white" size={20} /> : <User className="text-white" size={20} />}
                </div>
                <div className={`${msg.isBot ? 'bg-white border border-slate-200 shadow-lg hover:shadow-xl' : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200 hover:shadow-xl'} p-4 rounded-2xl transition-all duration-200`}>
                  <p className={`text-sm ${msg.isBot ? 'text-slate-900' : 'text-white'} whitespace-pre-wrap leading-relaxed`}>
                    {msg.text.split('**').map((part, i) => 
                      i % 2 === 0 ? part : <strong key={i} className="font-black">{part}</strong>
                    )}
                  </p>
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-black text-slate-800 mb-2">💚 Produk yang direkomendasikan:</p>
                      {msg.products.map((product, idx) => (
                        <div key={idx} className="bg-gradient-to-br from-slate-50 to-emerald-50/30 p-3 rounded-xl border border-emerald-200 hover:shadow-md transition-all duration-200">
                          <p className="font-bold text-sm text-slate-900">{product.name}</p>
                          <p className="text-sm text-emerald-600 font-black mt-1">Rp {product.price?.toLocaleString('id-ID')}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start mb-6 animate-in fade-in slide-in-from-left duration-300">
              <div className="flex gap-3 max-w-[70%]">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 rounded-xl h-fit shadow-lg shadow-emerald-200 animate-pulse">
                  <Bot className="text-white" size={20} />
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-lg">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full animate-bounce"></div>
                    <div className="w-2.5 h-2.5 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                    <div className="w-2.5 h-2.5 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white/80 backdrop-blur-sm border-t border-slate-200/50 p-5 shadow-lg">
          <div className="flex gap-3 max-w-5xl mx-auto">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder="Ketik pesan Anda..."
              className="flex-1 px-5 py-3.5 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 focus:outline-none text-slate-900 font-medium transition-all duration-200 placeholder:text-slate-400"
              disabled={loading}
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !inputMessage.trim()}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-7 py-3.5 rounded-xl font-bold hover:from-emerald-600 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 hover:scale-105 disabled:hover:scale-100"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
