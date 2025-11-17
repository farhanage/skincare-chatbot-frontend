import React, { useState, useEffect } from 'react';
import { MessageCircle, Plus, Trash2, X } from 'lucide-react';

export default function ChatSidebar({ 
  isOpen, 
  onClose, 
  currentChatId, 
  onSelectChat, 
  onNewChat,
  onDeleteChat 
}) {
  const [chatSessions, setChatSessions] = useState([]);

  // Load chat sessions from localStorage
  useEffect(() => {
    const loadChatSessions = () => {
      const sessions = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('chat_session_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key));
            sessions.push({
              id: key.replace('chat_session_', ''),
              ...data
            });
          } catch (e) {
            console.error('Failed to parse chat session:', e);
          }
        }
      }
      // Sort by last updated (newest first)
      sessions.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
      setChatSessions(sessions);
    };

    loadChatSessions();
    
    // Refresh every time sidebar opens
    if (isOpen) {
      loadChatSessions();
    }
  }, [isOpen]);

  const handleDeleteChat = (chatId, e) => {
    e.stopPropagation();
    if (window.confirm('Hapus chat ini?')) {
      localStorage.removeItem(`chat_session_${chatId}`);
      setChatSessions(prev => prev.filter(s => s.id !== chatId));
      onDeleteChat(chatId);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const getPreviewText = (messages) => {
    if (!messages || messages.length === 0) return 'Chat kosong';
    const lastMsg = messages[messages.length - 1];
    return lastMsg.text.substring(0, 50) + (lastMsg.text.length > 50 ? '...' : '');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col border-r border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-emerald-500 to-teal-600">
          <div className="flex items-center gap-2 text-white">
            <MessageCircle size={24} />
            <h2 className="font-bold text-lg">Chat History</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4 border-b border-slate-200">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-xl font-bold hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Chat Baru
          </button>
        </div>

        {/* Chat Sessions List */}
        <div className="flex-1 overflow-y-auto">
          {chatSessions.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <MessageCircle size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-sm">Belum ada riwayat chat</p>
              <p className="text-xs mt-2">Mulai chat baru untuk menyimpan percakapan</p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {chatSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => {
                    onSelectChat(session.id);
                    onClose();
                  }}
                  className={`w-full text-left p-4 rounded-xl transition-all group hover:bg-emerald-50 border-2 ${
                    currentChatId === session.id 
                      ? 'bg-emerald-50 border-emerald-300' 
                      : 'bg-white border-slate-200 hover:border-emerald-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageCircle size={16} className={currentChatId === session.id ? 'text-emerald-600' : 'text-slate-400'} />
                        <span className={`font-semibold text-sm truncate ${
                          currentChatId === session.id ? 'text-emerald-600' : 'text-slate-700'
                        }`}>
                          {session.title || 'Chat Tanpa Judul'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {getPreviewText(session.messages)}
                      </p>
                      <p className="text-xs text-slate-400 mt-2">
                        {formatDate(session.lastUpdated)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteChat(session.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-100 rounded-lg transition-all text-red-500"
                      title="Hapus chat"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <p className="text-xs text-slate-500 text-center">
            {chatSessions.length} chat tersimpan
          </p>
        </div>
      </div>
    </>
  );
}
