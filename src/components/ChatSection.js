import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, MessageCircle, ShoppingCart, ExternalLink } from 'lucide-react';

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
        timestamp: new Date(),
        products: data.products || []  // Store recommended products
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
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-5 rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300"
        >
          <MessageCircle size={32} />
          
          {/* Notification Badge */}
          {messages.length === 0 && (
            <div className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              1
            </div>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col border border-slate-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 rounded-t-2xl flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Bot size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Konsultasi Skincare</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm">Online</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-4 rounded-full mb-4">
                  <Bot className="text-white" size={32} />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Halo! Ada yang bisa saya bantu?</h4>
                <p className="text-sm text-slate-600 font-medium">Tanyakan tentang perawatan kulit Anda</p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`mb-4 flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`flex gap-2 max-w-[80%] ${msg.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                  {/* Avatar */}
                  <div className={`${msg.isBot ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-slate-600 to-slate-700'} p-2 rounded-full h-fit shadow-md`}>
                    {msg.isBot ? <Bot className="text-white" size={20} /> : <User className="text-white" size={20} />}
                  </div>
                  
                  {/* Message Bubble */}
                  <div className={`${msg.isBot ? 'bg-white border border-slate-200' : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'} p-3 rounded-2xl shadow-md`}>
                    <p className={`text-sm ${msg.isBot ? 'text-slate-900' : 'text-white'} font-medium whitespace-pre-wrap`}>
                      {msg.text.split('**').map((part, i) => 
                        i % 2 === 0 ? part : <strong key={i} className="font-black">{part}</strong>
                      )}
                    </p>
                    
                    {/* Product Recommendations */}
                    {msg.isBot && msg.products && msg.products.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <p className="text-xs font-bold text-emerald-600 mb-2 flex items-center gap-1">
                          <ShoppingCart size={14} />
                          Produk yang Direkomendasikan:
                        </p>
                        <div className="space-y-2">
                          {msg.products.map((product, idx) => (
                            <div 
                              key={product.id || idx} 
                              className="bg-gradient-to-br from-emerald-50 to-teal-50 p-3 rounded-xl border border-emerald-200 hover:shadow-md transition-all cursor-pointer"
                              onClick={() => {
                                // Scroll to products section or add to cart
                                window.location.href = '/products';
                              }}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <p className="font-bold text-slate-900 text-sm mb-1">{product.name}</p>
                                  <p className="text-emerald-600 font-black text-sm mb-1">
                                    Rp {(product.price || 0).toLocaleString('id-ID')}
                                  </p>
                                  <p className="text-xs text-slate-600 line-clamp-2">
                                    {product.description?.substring(0, 80)}...
                                  </p>
                                  {product.for_conditions && product.for_conditions.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {product.for_conditions.slice(0, 2).map((condition, i) => (
                                        <span 
                                          key={i} 
                                          className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium"
                                        >
                                          {condition}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <ExternalLink size={16} className="text-emerald-600 flex-shrink-0 mt-1" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <p className={`text-xs ${msg.isBot ? 'text-slate-500' : 'text-white/80'} mt-1`}>
                      {msg.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start mb-4">
                <div className="flex gap-2 max-w-[80%]">
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-full h-fit shadow-md">
                    <Bot className="text-white" size={20} />
                  </div>
                  <div className="bg-white border border-slate-200 p-3 rounded-2xl shadow-md">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-200 rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ketik pesan..."
                className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-slate-900 font-medium"
                disabled={loading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || loading}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
