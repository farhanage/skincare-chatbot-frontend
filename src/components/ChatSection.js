import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Activity, X, MessageCircle } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function ChatSection({ diseaseInfo }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (diseaseInfo && diseaseInfo.disease) {
      setMessages([{
        id: 1,
        text: `Halo! Saya mendeteksi kondisi kulit **${diseaseInfo.disease}** dengan confidence ${(diseaseInfo.confidence * 100).toFixed(1)}%. Ada yang bisa saya bantu?`,
        isBot: true,
        timestamp: new Date()
      }]);
      setIsOpen(true);
    }
  }, [diseaseInfo]);

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
          disease_info: diseaseInfo
        }),
      });

      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        if (response.status === 404) {
          errorMsg = 'Endpoint chat tidak ditemukan. Pastikan backend API berjalan.';
        } else if (response.status === 500) {
          errorMsg = 'Terjadi kesalahan di server. Silakan coba lagi.';
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      const botMessage = {
        id: Date.now() + 1,
        text: data.response || data.message || 'Maaf, tidak ada respons dari AI.',
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: `Maaf, terjadi error: ${error.message}`,
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white p-5 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 group"
          style={{
            boxShadow: '0 0 30px rgba(16, 185, 129, 0.5), 0 0 60px rgba(20, 184, 166, 0.3)'
          }}
        >
          <MessageCircle size={28} className="group-hover:rotate-12 transition-transform" />
          {diseaseInfo && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-500"></span>
            </span>
          )}
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 w-full md:w-[480px] z-50 flex flex-col bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 backdrop-blur-xl shadow-2xl border-l border-emerald-500/20 animate-slide-in">
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 -left-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          {/* Header */}
          <div className="relative p-6 bg-gradient-to-r from-emerald-600/20 via-teal-600/20 to-emerald-600/20 backdrop-blur-md border-b border-emerald-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-md opacity-75 animate-pulse"></div>
                  <div className="relative bg-gradient-to-r from-emerald-500 to-teal-500 p-3 rounded-full">
                    <Bot className="text-white" size={24} />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    AI Health Assistant
                    <Sparkles size={16} className="text-emerald-400 animate-pulse" />
                  </h2>
                  <p className="text-xs text-emerald-300 flex items-center gap-1">
                    <Activity size={12} className="animate-pulse" />
                    Powered by Web3 Health Tech
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="text-white" size={24} />
              </button>
            </div>

            {/* Disease Info Card */}
            {diseaseInfo && (
              <div className="mt-4 p-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="text-emerald-400" size={16} />
                  <span className="text-sm font-semibold text-white">Kondisi Terdeteksi</span>
                </div>
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                  {diseaseInfo.disease}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000"
                      style={{ width: `${(diseaseInfo.confidence * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-emerald-400 font-bold text-sm">
                    {(diseaseInfo.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Messages Area */}
          <div className="relative flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-emerald-500/50 scrollbar-track-transparent">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                  <Bot className="relative text-emerald-400" size={64} />
                </div>
                <p className="text-gray-300 text-lg mb-2">Mulai Konsultasi Kesehatan</p>
                <p className="text-gray-500 text-sm">Tanyakan apa saja tentang kondisi kulit Anda</p>
                {!diseaseInfo && (
                  <div className="mt-4 p-3 bg-orange-500/20 border border-orange-500/30 rounded-lg backdrop-blur-sm inline-block">
                    <p className="text-orange-300 text-sm">
                      📷 Deteksi gambar terlebih dahulu
                    </p>
                  </div>
                )}
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} animate-fade-in`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 ${
                      message.isBot
                        ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 backdrop-blur-md'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg shadow-emerald-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {message.isBot ? (
                        <Bot size={16} className="text-emerald-400" />
                      ) : (
                        <User size={16} className="text-white" />
                      )}
                      <span className={`text-xs font-semibold ${message.isBot ? 'text-emerald-300' : 'text-white'}`}>
                        {message.isBot ? 'AI Assistant' : 'You'}
                      </span>
                    </div>
                    <p className={`whitespace-pre-wrap ${message.isBot ? 'text-gray-200' : 'text-white'}`}>
                      {message.text}
                    </p>
                    <div className={`text-xs mt-2 ${message.isBot ? 'text-emerald-400/70' : 'text-white/70'}`}>
                      {message.timestamp.toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-2xl p-4 backdrop-blur-md">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot size={16} className="text-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-300">AI Assistant</span>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="relative p-6 bg-gradient-to-r from-slate-800/80 via-emerald-900/80 to-slate-800/80 backdrop-blur-md border-t border-emerald-500/30">
            <div className="flex gap-3">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ketik pertanyaan Anda..."
                className="flex-1 bg-slate-800/50 border border-emerald-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none backdrop-blur-sm transition-all"
                rows="2"
                disabled={loading || !diseaseInfo}
              />
              <button
                onClick={handleSendMessage}
                disabled={loading || !inputMessage.trim() || !diseaseInfo}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all self-end shadow-lg hover:shadow-emerald-500/50 hover:scale-105"
              >
                <Send size={20} />
              </button>
            </div>
            {!diseaseInfo && (
              <p className="text-sm text-gray-400 mt-2 text-center">
                📷 Deteksi gambar terlebih dahulu untuk memulai
              </p>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.5);
          border-radius: 3px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.7);
        }
      `}</style>
    </>
  );
}