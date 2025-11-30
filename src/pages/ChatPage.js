import React, { useState } from 'react';
import { Sidebar } from '../components/Layout';
import { AIChatPage } from '../components/Chat';

export default function ChatPage({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentChatId, setCurrentChatId] = useState(null);

  const handleNewChat = () => {
    const newChatId = `chat_${Date.now()}`;
    const newSession = {
      id: newChatId,
      title: 'Chat Baru',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      messageCount: 0
    };

    if (user) {
      const userChatsKey = `user_${user.id}_chats`;
      const saved = localStorage.getItem(userChatsKey);
      const sessions = saved ? JSON.parse(saved) : [];
      const updated = [newSession, ...sessions];
      localStorage.setItem(userChatsKey, JSON.stringify(updated));
    }

    setCurrentChatId(newChatId);
  };

  const handleSelectChat = (chatId) => {
    setCurrentChatId(chatId);
  };

  const handleDeleteChat = (chatId) => {
    if (!window.confirm('Hapus chat ini?')) return;
    
    if (user) {
      // Remove chat messages
      const chatKey = `user_${user.id}_chat_${chatId}`;
      localStorage.removeItem(chatKey);
      
      // Update sessions list
      const userChatsKey = `user_${user.id}_chats`;
      const saved = localStorage.getItem(userChatsKey);
      if (saved) {
        const sessions = JSON.parse(saved);
        const updated = sessions.filter(s => s.id !== chatId);
        localStorage.setItem(userChatsKey, JSON.stringify(updated));
      }
    }

    // If deleting current chat, create new one
    if (chatId === currentChatId) {
      handleNewChat();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        currentPage="ai-chat"
        user={user}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        currentChatId={currentChatId}
      />
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <AIChatPage 
          user={user} 
          currentChatId={currentChatId}
          onChatIdChange={setCurrentChatId}
        />
      </div>
    </div>
  );
}
