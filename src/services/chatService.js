import { REACT_APP_API_BASE_URL } from '../utils/constants';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Network error' }));
    throw new Error(error.detail || 'Request failed');
  }
  return response.json();
};

/**
 * Get user's chat sessions
 */
export const getUserChats = async (userId) => {
  const response = await fetch(`${REACT_APP_API_BASE_URL}/users/${userId}/chats`, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

/**
 * Create new chat session
 */
export const createChat = async (userId, title = 'Chat Baru') => {
  const response = await fetch(`${REACT_APP_API_BASE_URL}/users/${userId}/chats`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ title })
  });
  return handleResponse(response);
};

/**
 * Get chat details
 */
export const getChatDetails = async (chatId) => {
  const response = await fetch(`${REACT_APP_API_BASE_URL}/chats/${chatId}`, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

/**
 * Update chat title
 */
export const updateChatTitle = async (chatId, title) => {
  const response = await fetch(`${REACT_APP_API_BASE_URL}/chats/${chatId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ title })
  });
  return handleResponse(response);
};

/**
 * Delete chat
 */
export const deleteChat = async (chatId) => {
  const response = await fetch(`${REACT_APP_API_BASE_URL}/chats/${chatId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!response.ok && response.status !== 204) {
    const error = await response.json().catch(() => ({ detail: 'Network error' }));
    throw new Error(error.detail || 'Delete failed');
  }
};

/**
 * Get chat messages
 */
export const getChatMessages = async (chatId, params = {}) => {
  const { limit = 100, offset = 0, order = 'asc' } = params;
  const queryParams = new URLSearchParams({ limit, offset, order });
  
  const response = await fetch(`${REACT_APP_API_BASE_URL}/chats/${chatId}/messages?${queryParams}`, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

/**
 * Send message and get AI response
 */
export const sendMessage = async (chatId, text, diseaseContext = null) => {
  const response = await fetch(`${REACT_APP_API_BASE_URL}/chats/${chatId}/messages`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      text,
      disease_context: diseaseContext
    })
  });
  return handleResponse(response);
};

/**
 * Get single message
 */
export const getMessage = async (messageId) => {
  const response = await fetch(`${REACT_APP_API_BASE_URL}/messages/${messageId}`, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

/**
 * Delete message
 */
export const deleteMessage = async (messageId) => {
  const response = await fetch(`${REACT_APP_API_BASE_URL}/messages/${messageId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!response.ok && response.status !== 204) {
    const error = await response.json().catch(() => ({ detail: 'Network error' }));
    throw new Error(error.detail || 'Delete failed');
  }
};

// Legacy support - keeping old function name for backward compatibility
export const sendChatMessage = async (message, disease = null) => {
  // This is a temporary wrapper - will be removed once all components migrate
  console.warn('sendChatMessage is deprecated, use sendMessage instead');
  throw new Error('This function requires chatId. Please use sendMessage instead.');
};
