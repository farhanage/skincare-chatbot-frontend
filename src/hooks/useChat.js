import { useState, useEffect } from 'react';
import { CHAT_STORAGE } from '../utils/constants';

/**
 * Custom hook for chat management
 * @param {object} user - Current user
 * @returns {object} Chat state and methods
 */
export const useChat = (user) => {
  const [sessions, setSessions] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);

  // Load chat sessions
  useEffect(() => {
    if (user) {
      const userChatsKey = CHAT_STORAGE.getUserChatsKey(user.id);
      const saved = localStorage.getItem(userChatsKey);
      if (saved) {
        try {
          setSessions(JSON.parse(saved));
        } catch (e) {
          console.error('Error loading chat sessions:', e);
          setSessions([]);
        }
      }
    } else {
      setSessions([]);
      setCurrentChatId(null);
    }
  }, [user]);

  // Save sessions to localStorage
  const saveSessions = (newSessions) => {
    if (user) {
      const userChatsKey = CHAT_STORAGE.getUserChatsKey(user.id);
      localStorage.setItem(userChatsKey, JSON.stringify(newSessions));
      setSessions(newSessions);
    }
  };

  const createNewChat = () => {
    const newChatId = `chat_${Date.now()}`;
    const newSession = {
      id: newChatId,
      title: 'Chat Baru',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      messageCount: 0,
    };

    const updated = [newSession, ...sessions];
    saveSessions(updated);
    setCurrentChatId(newChatId);
    
    return newChatId;
  };

  const selectChat = (chatId) => {
    setCurrentChatId(chatId);
  };

  const deleteChat = (chatId) => {
    if (!user) return;

    // Remove chat messages
    const chatKey = CHAT_STORAGE.getChatMessagesKey(user.id, chatId);
    localStorage.removeItem(chatKey);

    // Update sessions list
    const updated = sessions.filter(s => s.id !== chatId);
    saveSessions(updated);

    // If deleting current chat, create new one
    if (chatId === currentChatId) {
      createNewChat();
    }
  };

  const updateChatTitle = (chatId, title) => {
    const updated = sessions.map(s =>
      s.id === chatId ? { ...s, title, lastUpdated: new Date().toISOString() } : s
    );
    saveSessions(updated);
  };

  const updateChatMessageCount = (chatId, count) => {
    const updated = sessions.map(s =>
      s.id === chatId ? { ...s, messageCount: count, lastUpdated: new Date().toISOString() } : s
    );
    saveSessions(updated);
  };

  return {
    sessions,
    currentChatId,
    createNewChat,
    selectChat,
    deleteChat,
    updateChatTitle,
    updateChatMessageCount,
  };
};
