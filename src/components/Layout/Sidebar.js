import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, MessageSquare, ShoppingBag, User, LogOut, ChevronLeft, ChevronRight, Plus, Trash2, LogIn, UserPlus, AlertCircle, Edit2, Check, X } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatters';

export default function Sidebar({ user, onLogout, isOpen, onToggle, onNewChat, onSelectChat, onDeleteChat, onUpdateChatTitle, currentChatId, chatSessions = [] }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  // Determine current page from route
  const getCurrentPage = () => {
    if (location.pathname === '/chat') return 'ai-chat';
    if (location.pathname === '/products') return 'products';
    return 'home';
  };

  const currentPage = getCurrentPage();

  const menuItems = [
    { id: '/', label: 'Home', icon: Home },
    { id: '/chat', label: 'AI Chat', icon: MessageSquare },
    { id: '/products', label: 'Produk', icon: ShoppingBag },
  ];

  const handleDeleteChat = (chatId, e) => {
    e.stopPropagation();
    e.preventDefault();
    setChatToDelete(chatId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (chatToDelete && onDeleteChat) {
      onDeleteChat(chatToDelete);
    }
    
    setShowDeleteModal(false);
    setChatToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setChatToDelete(null);
  };

  const handleEditClick = (chatId, currentTitle, e) => {
    e.stopPropagation();
    e.preventDefault();
    setEditingChatId(chatId);
    setEditTitle(currentTitle);
  };

  const handleSaveTitle = async (chatId, e) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (editTitle.trim() && onUpdateChatTitle) {
      await onUpdateChatTitle(chatId, editTitle.trim());
    }
    
    setEditingChatId(null);
    setEditTitle('');
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setEditingChatId(null);
    setEditTitle('');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-white to-slate-50/50 backdrop-blur-sm shadow-2xl z-40 flex flex-col border-r border-slate-200/50 transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-20 -translate-x-full lg:translate-x-0'
      }`}>
      {/* Logo/Brand with Toggle */}
      <div className="p-4 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 border-b border-slate-200/50 flex items-center justify-between">
        {isOpen ? (
          <>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-xl shadow-lg hover:shadow-xl transition-shadow flex-shrink-0">
                <MessageSquare size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent whitespace-nowrap">
                  SkinCare AI
                </h1>
                <p className="text-xs text-slate-500 font-semibold tracking-wide whitespace-nowrap">Deteksi & Konsultasi</p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="p-2 hover:bg-slate-200/50 rounded-lg transition-all text-slate-600 hover:text-slate-900 flex-shrink-0"
            >
              <ChevronLeft size={18} />
            </button>
          </>
        ) : (
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center p-2 hover:bg-slate-200/50 rounded-lg transition-all text-slate-600 hover:text-slate-900"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>

      {/* Main Content Area - Navigation + Chat History */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navigation Menu */}
        <nav className="p-3">
          <ul className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => navigate(item.id)}
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
            {/* Guest Mode Notice */}
            {!user && (
              <div className="p-3 mx-3 mt-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-amber-800">
                    <p className="font-semibold mb-1">Mode Guest</p>
                    <p className="text-amber-700 leading-relaxed">
                      Chat tidak disimpan. Login untuk menyimpan riwayat chat.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* New Chat Button - Only for logged-in users */}
            {user && (
              <div className="p-3">
                <button
                  onClick={onNewChat}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3.5 rounded-xl font-bold hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <Plus size={20} strokeWidth={2.5} />
                  <span className="tracking-wide">Chat Baru</span>
                </button>
              </div>
            )}

            {/* Chat Sessions List */}
            <div className="flex-1 overflow-y-auto px-3 pb-4">
              {!chatSessions || !Array.isArray(chatSessions) || chatSessions.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageSquare size={20} className="text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Belum ada chat</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {chatSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`relative rounded-xl transition-all duration-200 group ${
                        currentChatId === session.id
                          ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 shadow-md'
                          : 'bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 hover:shadow-md'
                      }`}
                    >
                      <div
                        onClick={() => onSelectChat && onSelectChat(session.id)}
                        className="w-full text-left p-3 rounded-xl cursor-pointer"
                      >
                        <div className={editingChatId === session.id ? "pr-3" : "pr-16"}>
                          {editingChatId === session.id ? (
                            <div className="mb-2" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') handleSaveTitle(session.id, e);
                                  if (e.key === 'Escape') handleCancelEdit(e);
                                }}
                                className="w-full px-2 py-1.5 text-sm border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 mb-2"
                                autoFocus
                              />
                              <div className="flex gap-1.5 justify-end">
                                <button
                                  onClick={(e) => handleSaveTitle(session.id, e)}
                                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                                >
                                  <Check size={12} />
                                  Simpan
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                                >
                                  <X size={12} />
                                  Batal
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className={`font-semibold text-sm line-clamp-1 mb-1 ${
                                currentChatId === session.id ? 'text-emerald-700' : 'text-slate-800'
                              }`}>
                                {session.title}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-medium text-slate-400">
                                  {formatRelativeTime(session.updated_at || session.lastUpdated, true)}
                                </span>
                                {(session.message_count || session.messageCount || 0) > 0 && (
                                  <>
                                    <span className="text-slate-300">•</span>
                                    <span className={`text-[11px] font-bold ${
                                      currentChatId === session.id ? 'text-emerald-600' : 'text-slate-500'
                                    }`}>
                                      {session.message_count || session.messageCount} pesan
                                    </span>
                                  </>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      {editingChatId !== session.id && !session.isGuest && (
                        <div className="absolute top-2.5 right-2 flex gap-1 opacity-0 group-hover:opacity-100 z-10">
                          <button
                            type="button"
                            onClick={(e) => handleEditClick(session.id, session.title, e)}
                            className="p-1.5 hover:bg-blue-100 rounded-lg transition-all text-blue-600 hover:text-blue-700"
                            title="Edit title"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteChat(session.id, e)}
                            className="p-1.5 hover:bg-red-100 rounded-lg transition-all text-red-500 hover:text-red-600"
                            title="Delete chat"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
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
                onClick={() => navigate('/login')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg shadow-emerald-200 hover:shadow-xl"
              >
                <LogIn size={18} />
                <span className="tracking-wide">Login</span>
              </button>
              <button
                onClick={() => navigate('/register')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-emerald-600 border-2 border-emerald-500 rounded-xl font-bold hover:bg-emerald-50 transition-all duration-200"
              >
                <UserPlus size={18} />
                <span className="tracking-wide">Daftar</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => navigate('/login')}
                className="w-full flex items-center justify-center p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all duration-200"
                title="Login"
              >
                <LogIn size={20} />
              </button>
              <button
                onClick={() => navigate('/register')}
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
