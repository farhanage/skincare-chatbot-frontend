export const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
export const REACT_APP_LLM_INFERENCE_URL = process.env.REACT_APP_LLM_INFERENCE_URL;
export const REACT_APP_VIT_INFERENCE_URL = process.env.REACT_APP_VIT_INFERENCE_URL;

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

export const STORAGE_KEYS = {
  USER: 'user',
  TOKEN: 'token',
  UPLOAD_PREVIEW: 'uploadPreview',
  UPLOAD_PREDICTION: 'uploadPrediction',
};

export const CHAT_STORAGE = {
  getUserChatsKey: (userId) => `user_${userId}_chats`,
  getChatMessagesKey: (userId, chatId) => `user_${userId}_chat_${chatId}`,
};

export const CART_STORAGE = {
  getCartKey: (userId) => `user_${userId}_cart`,
};
