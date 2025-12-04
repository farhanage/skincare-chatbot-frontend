import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, X, Trash2 } from 'lucide-react';
import { getChatMessages, sendMessage } from '../../services/chatService';

export default function AIChatPage({ user, currentChatId }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const [hasCheckedContext, setHasCheckedContext] = useState(false);
  const [diseaseContext, setDiseaseContext] = useState(null);

  // Guest mode: Load/save messages from localStorage
  const isGuestMode = !user || currentChatId === 'guest-chat';
  const GUEST_MESSAGES_KEY = 'guest_chat_messages';

  // Load chat messages from backend or localStorage (guest)
  useEffect(() => {
    if (!currentChatId) return;
    
    const loadMessages = async () => {
      setLoadingMessages(true);
      setError(null);
      
      try {
        if (isGuestMode) {
          // Guest mode: load from localStorage
          const savedMessages = localStorage.getItem(GUEST_MESSAGES_KEY);
          if (savedMessages) {
            const parsed = JSON.parse(savedMessages);
            setMessages(parsed.map(msg => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            })));
          } else {
            setMessages([]);
          }
        } else {
          // Logged-in user: load from backend
          const data = await getChatMessages(currentChatId, { limit: 100, order: 'asc' });
          
          // Transform backend messages to UI format
          const transformedMessages = data.messages.map(msg => ({
            id: msg.id,
            text: msg.text,
            isBot: msg.is_bot,
            timestamp: new Date(msg.timestamp),
            products: msg.products || []
          }));
          
          setMessages(transformedMessages);
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
        setError(err.message);
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };
    
    loadMessages();
    // Reset hasCheckedContext when loading a new chat
    setHasCheckedContext(false);
  }, [currentChatId, isGuestMode]);

  const handleAutoSendWithDiseaseContext = useCallback(async (disease, confidence) => {
    const contextMessage = `Saya baru saja melakukan deteksi kulit dan hasilnya adalah ${disease} dengan tingkat kepercayaan ${(confidence * 100).toFixed(1)}%. Bisakah Anda memberikan informasi lebih lanjut tentang kondisi ini dan rekomendasi perawatan yang tepat?`;
    
    setLoading(true);
    setError(null);

    try {
      if (isGuestMode) {
        // Guest mode: Use guest chat endpoint
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/chats/guest`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: contextMessage,
            disease_context: { disease, confidence }
          })
        });

        if (!response.ok) throw new Error('Failed to get response');
        const data = await response.json();

        // Extract response text - handle both string and object formats
        const responseText = typeof data.response === 'string' 
          ? data.response 
          : (data.response?.text || data.text || JSON.stringify(data.response || data));

        const newMessages = [
          {
            id: `user_${Date.now()}`,
            text: contextMessage,
            isBot: false,
            timestamp: new Date(),
            products: []
          },
          {
            id: `bot_${Date.now()}`,
            text: responseText,
            isBot: true,
            timestamp: new Date(),
            products: data.products || data.response?.products || []
          }
        ];

        setMessages(newMessages);
        localStorage.setItem(GUEST_MESSAGES_KEY, JSON.stringify(newMessages));

      } else {
        // Logged-in user: Save to backend
        const result = await sendMessage(currentChatId, contextMessage, { disease, confidence });
        
        // Add both user and bot messages
        const newMessages = [
          {
            id: result.user_message.id,
            text: result.user_message.text,
            isBot: false,
            timestamp: new Date(result.user_message.timestamp),
            products: []
          },
          {
            id: result.bot_message.id,
            text: result.bot_message.text,
            isBot: true,
            timestamp: new Date(result.bot_message.timestamp),
            products: result.bot_message.products || []
          }
        ];
        
        setMessages(newMessages);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isGuestMode, currentChatId, diseaseContext, GUEST_MESSAGES_KEY]);

  // Check for disease context from upload page
  useEffect(() => {
    if (!currentChatId || hasCheckedContext) return;
    
    const contextData = sessionStorage.getItem('chatContext');
    if (contextData) {
      try {
        const { disease, confidence } = JSON.parse(contextData);
        setDiseaseContext({ disease, confidence });
        sessionStorage.removeItem('chatContext');
        setHasCheckedContext(true);
        
        // Only auto-send if this is a new chat (no messages)
        if (messages.length === 0) {
          handleAutoSendWithDiseaseContext(disease, confidence);
        }
      } catch (e) {
        console.error('Failed to parse chat context:', e);
      }
    }
  }, [currentChatId, hasCheckedContext, messages, handleAutoSendWithDiseaseContext]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading || !currentChatId) return;

    const messageText = inputMessage;
    setInputMessage('');
    setLoading(true);
    setError(null);

    // Optimistic update - show user message immediately
    const tempUserMessage = {
      id: `temp_${Date.now()}`,
      text: messageText,
      isBot: false,
      timestamp: new Date(),
      products: []
    };
    
    setMessages(prev => [...prev, tempUserMessage]);

    try {
      if (isGuestMode) {
        // Guest mode: Use guest chat endpoint
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/chats/guest`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: messageText,
            disease_context: diseaseContext ? {
              disease: diseaseContext.disease,
              confidence: diseaseContext.confidence
            } : null
          })
        });

        if (!response.ok) throw new Error('Failed to get response');
        const data = await response.json();

        // Extract response text - handle both string and object formats
        const responseText = typeof data.response === 'string' 
          ? data.response 
          : (data.response?.text || data.text || JSON.stringify(data.response || data));

        // Create messages for guest mode
        const userMsg = {
          id: `user_${Date.now()}`,
          text: messageText,
          isBot: false,
          timestamp: new Date(),
          products: []
        };

        const botMsg = {
          id: `bot_${Date.now()}`,
          text: responseText,
          isBot: true,
          timestamp: new Date(),
          products: data.products || data.response?.products || []
        };

        // Update messages and save to localStorage
        const updatedMessages = [
          ...messages.filter(m => m.id !== tempUserMessage.id),
          userMsg,
          botMsg
        ];
        setMessages(updatedMessages);
        localStorage.setItem(GUEST_MESSAGES_KEY, JSON.stringify(updatedMessages));

      } else {
        // Logged-in user: Send to backend with persistence
        const diseaseInfo = diseaseContext ? {
          disease: diseaseContext.disease,
          confidence: diseaseContext.confidence
        } : null;
        
        const result = await sendMessage(currentChatId, messageText, diseaseInfo);
        
        // Handle different response formats from backend
        if (!result) {
          throw new Error('No response from server');
        }
        
        // Check if response has the expected structure
        if (!result.user_message || !result.bot_message) {
          throw new Error('Invalid response format from server');
        }
        
        // Replace temp message with actual messages from backend
        setMessages(prev => {
          const withoutTemp = prev.filter(m => m.id !== tempUserMessage.id);
          return [
            ...withoutTemp,
            {
              id: result.user_message.id,
              text: result.user_message.text,
              isBot: false,
              timestamp: new Date(result.user_message.timestamp),
              products: []
            },
            {
              id: result.bot_message.id,
              text: result.bot_message.text,
              isBot: true,
              timestamp: new Date(result.bot_message.timestamp),
              products: result.bot_message.products || []
            }
          ];
        });
      }
    } catch (err) {
      console.error('Chat error:', err);
      setError(err.message);
      
      // Remove temp message on error
      setMessages(prev => prev.filter(m => m.id !== tempUserMessage.id));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDiseaseContext = () => {
    setDiseaseContext(null);
  };

  const handleClearChat = () => {
    if (isGuestMode) {
      setMessages([]);
      localStorage.removeItem(GUEST_MESSAGES_KEY);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 p-3 sm:p-5 flex items-center justify-between gap-3 sm:gap-4 shadow-sm pl-14 sm:pl-16 lg:pl-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 sm:p-3 rounded-xl shadow-lg">
              <Bot size={20} className="text-white sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="font-black text-base sm:text-xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">AI Assistant</h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm text-slate-600 font-semibold">Online</span>
              </div>
            </div>
          </div>
          {/* Clear Chat Button for Guests */}
          {isGuestMode && messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-red-200"
            >
              <Trash2 size={14} />
              <span className="hidden sm:inline">Hapus Chat</span>
            </button>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Loading Messages */}
          {loadingMessages && (
            <div className="flex items-center justify-center h-32">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full animate-bounce"></div>
                <div className="w-2.5 h-2.5 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                <div className="w-2.5 h-2.5 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
              </div>
            </div>
          )}

          {!loadingMessages && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 sm:p-8 rounded-3xl mb-4 sm:mb-6 shadow-2xl shadow-emerald-200 animate-pulse">
                <Bot className="text-white" size={40} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2 sm:mb-3">Halo! 👋</h2>
              <p className="text-slate-600 max-w-md text-sm sm:text-base font-medium leading-relaxed">
                Saya adalah AI Assistant untuk membantu Anda dengan pertanyaan seputar skincare dan perawatan kulit.
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`mb-4 sm:mb-6 flex ${msg.isBot ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`flex gap-2 sm:gap-3 max-w-[85%] sm:max-w-[75%] ${msg.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className={`${msg.isBot ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200' : 'bg-gradient-to-br from-slate-600 to-slate-700 shadow-lg shadow-slate-300'} p-2 sm:p-2.5 rounded-xl h-fit flex-shrink-0`}>
                  {msg.isBot ? <Bot className="text-white" size={16} /> : <User className="text-white" size={16} />}
                </div>
                <div className={`${msg.isBot ? 'bg-white border border-slate-200 shadow-lg hover:shadow-xl' : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200 hover:shadow-xl'} p-3 sm:p-4 rounded-2xl transition-all duration-200`}>
                  <p className={`text-xs sm:text-sm ${msg.isBot ? 'text-slate-900' : 'text-white'} whitespace-pre-wrap leading-relaxed`}>
                    {(typeof msg.text === 'string' ? msg.text : String(msg.text || '')).split('**').map((part, i) => 
                      i % 2 === 0 ? part : <strong key={i} className="font-black">{part}</strong>
                    )}
                  </p>
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-3 sm:mt-4 space-y-2">
                      <p className="text-xs sm:text-sm font-black text-slate-800 mb-2">💚 Produk yang direkomendasikan:</p>
                      {msg.products.map((product, idx) => (
                        <div key={idx} className="bg-gradient-to-br from-slate-50 to-emerald-50/30 p-2 sm:p-3 rounded-xl border border-emerald-200 hover:shadow-md transition-all duration-200">
                          <p className="font-bold text-xs sm:text-sm text-slate-900">{product.name}</p>
                          <p className="text-xs sm:text-sm text-emerald-600 font-black mt-1">Rp {product.price?.toLocaleString('id-ID')}</p>
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
        <div className="bg-white/80 backdrop-blur-sm border-t border-slate-200/50 p-3 sm:p-4 lg:p-5 shadow-lg">
          {/* Disease Info Banner */}
          {diseaseContext && diseaseContext.disease && (
            <div className="mb-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl max-w-5xl mx-auto">
              <div className="flex items-start gap-2">
                <Bot size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-emerald-800 mb-1">
                    Informasi Deteksi Terkirim ke AI:
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-black text-slate-900 truncate">
                      {diseaseContext.disease}
                    </p>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                      {(diseaseContext.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleRemoveDiseaseContext}
                  className="flex-shrink-0 p-1 hover:bg-emerald-200 rounded-lg transition-colors text-emerald-700 hover:text-emerald-900"
                  title="Hapus konteks disease"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}
          
          <div className="flex gap-2 sm:gap-3 max-w-5xl mx-auto">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder="Ketik pesan Anda..."
              className="flex-1 px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 lg:py-3.5 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 focus:outline-none text-sm sm:text-base text-slate-900 font-medium transition-all duration-200 placeholder:text-slate-400"
              disabled={loading}
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !inputMessage.trim()}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 sm:px-6 lg:px-7 py-2.5 sm:py-3 lg:py-3.5 rounded-xl font-bold hover:from-emerald-600 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 hover:scale-105 disabled:hover:scale-100"
            >
              <Send size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
