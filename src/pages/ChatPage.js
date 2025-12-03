import React, { useEffect } from 'react';
import { Sidebar } from '../components/Layout';
import { AIChatPage } from '../features/chat';
import { useChat } from '../hooks/useChat';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Menu } from 'lucide-react';

export default function ChatPage({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useLocalStorage('sidebarOpen', true);
  const { 
    sessions,
    currentChatId, 
    loading,
    error,
    createNewChat, 
    selectChat, 
    deleteChat,
    updateChatTitle
  } = useChat(user);

  // Check for disease context and create new chat if needed
  useEffect(() => {
    const contextData = sessionStorage.getItem('chatContext');
    if (contextData) {
      try {
        const context = JSON.parse(contextData);
        if (context.createNewChat) {
          // Create new chat when coming from disease detection
          createNewChat();
        }
      } catch (e) {
        console.error('Failed to parse chat context:', e);
      }
    }
  }, []); // Run only once on mount

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Loading or Error State */}
      {loading && (!sessions || sessions.length === 0) && (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="flex gap-1.5 justify-center mb-4">
              <div className="w-3 h-3 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
              <div className="w-3 h-3 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
            </div>
            <p className="text-slate-600 font-medium">Loading chats...</p>
          </div>
        </div>
      )}

      <Sidebar 
        currentPage="ai-chat"
        user={user}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onNewChat={createNewChat}
        onSelectChat={selectChat}
        onDeleteChat={deleteChat}
        onUpdateChatTitle={updateChatTitle}
        currentChatId={currentChatId}
        chatSessions={sessions || []}
      />
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-3.5 left-3 z-20 bg-white p-2 sm:p-3 rounded-xl shadow-lg text-emerald-600 hover:bg-emerald-50 transition-all"
      >
        <Menu size={20} className="sm:w-6 sm:h-6" />
      </button>
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <AIChatPage 
          user={user} 
          currentChatId={currentChatId}
        />
      </div>
    </div>
  );
}
