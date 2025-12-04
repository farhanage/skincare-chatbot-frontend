import { REACT_APP_API_BASE_URL } from '../utils/constants';

/**
 * Predict disease from uploaded image
 * @param {File} file - Image file
 * @returns {Promise} Prediction result
 */
export const predictDisease = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${REACT_APP_API_BASE_URL}/predict`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to predict disease');
  }
  
  return response.json();
};
