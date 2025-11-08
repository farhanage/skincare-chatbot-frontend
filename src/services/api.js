const API_BASE = 'http://localhost:8000';

/**
 * Predict disease dari uploaded image
 * @param {File} file - Image file
 * @returns {Promise} Prediction result
 */
export const predictDisease = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to predict disease');
  }
  
  return response.json();
};

/**
 * Send chat message untuk rekomendasi produk
 * @param {string} message - User message
 * @param {string|null} disease - Detected disease (optional)
 * @returns {Promise} Chat response
 */
export const sendChatMessage = async (message, disease = null) => {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, disease }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to send message');
  }
  
  return response.json();
};