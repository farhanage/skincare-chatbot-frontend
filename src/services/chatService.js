import axios from 'axios';
import { REACT_APP_LLM_INFERENCE_URL } from '../utils/constants';

/**
 * Send chat message for product recommendations
 * @param {string} message - User message
 * @param {string|null} disease - Detected disease (optional)
 * @returns {Promise} Chat response
 */
export const sendChatMessage = async (message, disease = null) => {
  const response = await axios.post(`${REACT_APP_LLM_INFERENCE_URL}/chat`, {
    message,
    disease,
  });
  return response.data;
};
