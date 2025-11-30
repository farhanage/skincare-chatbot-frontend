import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

/**
 * Send chat message for product recommendations
 * @param {string} message - User message
 * @param {string|null} disease - Detected disease (optional)
 * @returns {Promise} Chat response
 */
export const sendChatMessage = async (message, disease = null) => {
  const response = await axios.post(`${API_BASE_URL}/api/v1/chat`, {
    message,
    disease,
  });
  return response.data;
};
