import React, { useState, useEffect } from 'react';
import { Home, MessageSquare, ShoppingBag, User, LogOut, ChevronLeft, ChevronRight, Plus, Trash2, LogIn, UserPlus, AlertCircle } from 'lucide-react';

export default function Sidebar({ currentPage, onNavigate, user, onLogout, isOpen, onToggle, onNewChat, onSelectChat, onDeleteChat, currentChatId }) {
  const [chatSessions, setChatSessions] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'ai-chat', label: 'AI Chat', icon: MessageSquare },
    { id: 'products', label: 'Produk', icon: ShoppingBag },
  ];

  // Load chat sessions when on AI Chat page
  useEffect(() => {
    if (currentPage === 'ai-chat' && user) {
      const loadChatSessions = () => {
        const userChatsKey = `user_${user.id}_chats`;
        const saved = localStorage.getItem(userChatsKey);
        
        if (saved) {
          try {
            const sessions = JSON.parse(saved);
            setChatSessions(sessions);
          } catch (e) {
            console.error('Failed to load chat sessions:', e);
          }
        }
      };

      loadChatSessions();
      
      // Refresh every 2 seconds when on AI Chat page
      const interval = setInterval(loadChatSessions, 2000);
      return () => clearInterval(interval);
    }
  }, [currentPage, user]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const handleDeleteChat = (chatId, e) => {
    e.stopPropagation();
    setChatToDelete(chatId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (chatToDelete && user) {
      const chatKey = `user_${user.id}_chat_${chatToDelete}`;
      localStorage.removeItem(chatKey);

      const userChatsKey = `user_${user.id}_chats`;
      const saved = localStorage.getItem(userChatsKey);
      if (saved) {
        const sessions = JSON.parse(saved);
        const updated = sessions.filter(s => s.id !== chatToDelete);
        localStorage.setItem(userChatsKey, JSON.stringify(updated));
        setChatSessions(updated);
      }

      if (onDeleteChat) {
        onDeleteChat(chatToDelete);
      }
    }
    
    setShowDeleteModal(false);
    setChatToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setChatToDelete(null);
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-white to-slate-50/50 backdrop-blur-sm shadow-2xl z-40 flex flex-col border-r border-slate-200/50 transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-16'
      }`}>
      {/* Logo/Brand with Toggle */}
      <div className="p-4 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 border-b border-slate-200/50 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-xl shadow-lg hover:shadow-xl transition-shadow flex-shrink-0">
            <MessageSquare size={24} className="text-white" />
          </div>
          <div className={`transition-all duration-300 ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
            <h1 className="text-xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent whitespace-nowrap">
              SkinCare AI
            </h1>
            <p className="text-xs text-slate-500 font-semibold tracking-wide whitespace-nowrap">Deteksi & Konsultasi</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className={`p-2 hover:bg-slate-200/50 rounded-lg transition-all text-slate-600 hover:text-slate-900 flex-shrink-0 ${isOpen ? '' : 'ml-auto'}`}
        >
          {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Main Content Area - Navigation + Chat History */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navigation Menu */}
        <nav className="p-3">
          <ul className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center ${isOpen ? 'gap-3 px-4' : 'justify-center px-0'} py-3.5 rounded-xl font-bold transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200 scale-[1.02]'
                        : 'text-slate-700 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 hover:shadow-md hover:scale-[1.01]'
                    }`}
                    title={!isOpen ? item.label : undefined}
                  >
                    <Icon size={20} className={isActive ? 'text-white' : 'text-emerald-600 group-hover:text-emerald-700'} />
                    {isOpen && <span className="tracking-wide">{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Chat History - Only show on AI Chat page */}
        {currentPage === 'ai-chat' && isOpen && (
          <div className="flex-1 flex flex-col overflow-hidden border-t border-slate-200/50 bg-slate-50/30">
            {/* New Chat Button */}
            <div className="p-3">
              <button
                onClick={onNewChat}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3.5 rounded-xl font-bold hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <Plus size={20} strokeWidth={2.5} />
                <span className="tracking-wide">Chat Baru</span>
              </button>
            </div>

            {/* Chat Sessions List */}
            <div className="flex-1 overflow-y-auto px-3 pb-4">
              {chatSessions.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageSquare size={20} className="text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Belum ada chat</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {chatSessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => onSelectChat && onSelectChat(session.id)}
                      className={`w-full text-left p-3 rounded-xl transition-all duration-200 group relative ${
                        currentChatId === session.id
                          ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 shadow-md'
                          : 'bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 hover:shadow-md'
                      }`}
                    >
                      <div className="pr-7">
                        <p className={`font-semibold text-sm line-clamp-1 mb-1 ${
                          currentChatId === session.id ? 'text-emerald-700' : 'text-slate-800'
                        }`}>
                          {session.title}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-medium text-slate-400">
                            {formatDate(session.lastUpdated)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteChat(session.id, e)}
                        className="absolute top-2.5 right-2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 rounded-lg transition-all text-red-500 hover:text-red-600"
                      >
                        <Trash2 size={13} />
                      </button>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Auth Section - Login/Register or User Info/Logout */}
      <div className="p-3 border-t border-slate-200/50 bg-gradient-to-br from-slate-50 to-transparent">
        {user ? (
          // Logged in - Show user info and logout
          isOpen ? (
            <>
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl mb-3 border border-slate-200 shadow-sm">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 rounded-full shadow-md flex-shrink-0">
                  <User size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate font-medium">{user.email}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl font-bold transition-all duration-200 hover:shadow-md border border-transparent hover:border-red-200"
              >
                <LogOut size={18} />
                <span className="tracking-wide">Logout</span>
              </button>
            </>
          ) : (
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          )
        ) : (
          // Not logged in - Show login and register buttons
          isOpen ? (
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('login')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg shadow-emerald-200 hover:shadow-xl"
              >
                <LogIn size={18} />
                <span className="tracking-wide">Login</span>
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-emerald-600 border-2 border-emerald-500 rounded-xl font-bold hover:bg-emerald-50 transition-all duration-200"
              >
                <UserPlus size={18} />
                <span className="tracking-wide">Daftar</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('login')}
                className="w-full flex items-center justify-center p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all duration-200"
                title="Login"
              >
                <LogIn size={20} />
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="w-full flex items-center justify-center p-3 border-2 border-emerald-500 text-emerald-600 rounded-xl hover:bg-emerald-50 transition-all duration-200"
                title="Daftar"
              >
                <UserPlus size={20} />
              </button>
            </div>
          )
        )}
      </div>
    </div>

    {/* Delete Confirmation Modal */}
    {showDeleteModal && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 transform animate-scale-in">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 rounded-full p-3">
              <AlertCircle className="text-red-600" size={32} />
            </div>
          </div>

          {/* Title & Message */}
          <h3 className="text-xl font-bold text-slate-800 text-center mb-2">
            Hapus Chat?
          </h3>
          <p className="text-slate-600 text-center mb-6">
            Chat ini akan dihapus permanen dan tidak bisa dikembalikan.
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={cancelDelete}
              className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all duration-200"
            >
              Batal
            </button>
            <button
              onClick={confirmDelete}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg shadow-red-200 hover:shadow-xl"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
