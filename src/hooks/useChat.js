import { useState, useEffect } from 'react';
import { getUserChats, createChat, deleteChat as apiDeleteChat, updateChatTitle as apiUpdateChatTitle } from '../services/chatService';

/**
 * Custom hook for chat management with backend API
 * For guest users, creates a single temporary chat session
 * @param {object} user - Current user (null for guests)
 * @returns {object} Chat state and methods
 */
export const useChat = (user) => {
  const [sessions, setSessions] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load chat sessions from backend or create guest session
  const loadChatSessions = async () => {
    if (!user) {
      // Guest mode: single temporary chat session
      const guestSession = {
        id: 'guest-chat',
        title: 'Guest Chat',
        message_count: 0,
        created_at: new Date().toISOString(),
        isGuest: true
      };
      setSessions([guestSession]);
      setCurrentChatId('guest-chat');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const chats = await getUserChats(user.id);
      
      // Backend returns {chats: [...]} not direct array
      const chatArray = Array.isArray(chats) ? chats : (chats.chats || []);
      setSessions(chatArray);
      
      // Auto-select first chat if none selected
      if (!currentChatId && chatArray.length > 0) {
        setCurrentChatId(chatArray[0].id);
      }
    } catch (err) {
      console.error('Error loading chat sessions:', err);
      setError(err.message);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChatSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Re-run when user ID changes (including null for guests)

  const createNewChat = async () => {
    if (!user) {
      // Guest can't create multiple chats, just use existing guest chat
      return 'guest-chat';
    }
    
    setError(null);
    try {
      const newChat = await createChat(user.id);
      setSessions(prev => [newChat, ...(Array.isArray(prev) ? prev : [])]);
      setCurrentChatId(newChat.id);
      return newChat.id;
    } catch (err) {
      console.error('Error creating chat:', err);
      setError(err.message);
      return null;
    }
  };

  const selectChat = (chatId) => {
    setCurrentChatId(chatId);
  };

  const deleteChatSession = async (chatId) => {
    if (!user) {
      // Guests can't delete chats
      return;
    }

    setError(null);
    try {
      await apiDeleteChat(chatId);
      
      // Update local state
      const updated = (Array.isArray(sessions) ? sessions : []).filter(s => s.id !== chatId);
      setSessions(updated);

      // If deleting current chat
      if (chatId === currentChatId) {
        if (updated.length > 0) {
          setCurrentChatId(updated[0].id);
        } else {
          // No chats left, create a new one
          await createNewChat();
        }
      }
    } catch (err) {
      console.error('Error deleting chat:', err);
      setError(err.message);
    }
  };

  const updateChatTitle = async (chatId, title) => {
    if (!user) return;
    
    setError(null);
    try {
      const updatedChat = await apiUpdateChatTitle(chatId, title);
      setSessions(prev => (Array.isArray(prev) ? prev : []).map(s => s.id === chatId ? updatedChat : s));
    } catch (err) {
      console.error('Error updating chat title:', err);
      setError(err.message);
    }
  };

  const updateChatMessageCount = (chatId, count) => {
    // Optimistic update - backend will update on message send
    setSessions(prev => (Array.isArray(prev) ? prev : []).map(s =>
      s.id === chatId ? { ...s, message_count: count, updated_at: new Date().toISOString() } : s
    ));
  };

  const refreshChats = () => {
    loadChatSessions();
  };

  return {
    sessions,
    currentChatId,
    loading,
    error,
    createNewChat,
    selectChat,
    deleteChat: deleteChatSession,
    updateChatTitle,
    updateChatMessageCount,
    refreshChats,
  };
};
