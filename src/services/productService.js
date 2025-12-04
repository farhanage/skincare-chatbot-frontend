import { REACT_APP_API_BASE_URL } from '../utils/constants';

const API_URL = `${REACT_APP_API_BASE_URL}/products`;

/**
 * Get all products with optional filters
 * @param {object} filters - Filter parameters
 * @returns {Promise} List of products
 */
export const getProducts = async (filters = {}) => {
  const response = await fetch(API_URL);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  
  return data;
};

/**
 * Get product by ID
 * @param {string} productId - Product ID
 * @returns {Promise} Product details
 */
export const getProductById = async (productId) => {
  const response = await fetch(`${API_URL}/${productId}`);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error('Failed to fetch product');
  }
  
  return data;
};

/**
 * Get product recommendations based on similar products
 * @param {string} productId - Product ID
 * @param {number} topK - Number of recommendations (default: 5)
 * @returns {Promise} List of recommended products
 */
export const getProductRecommendations = async (productId, topK = 5) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}/recommend/${productId}?top_k=${topK}`, {
    headers
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error('Failed to fetch product recommendations');
  }
  
  return data;
};

/**
 * Get personalized bandit recommendations for user
 * @returns {Promise} List of recommended products
 */
export const getBanditRecommendations = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Return empty recommendations for non-logged users
    return { success: true, recommendations: [] };
  }
  
  const response = await fetch(`${REACT_APP_API_BASE_URL}/bandit/recommend`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    console.error('Bandit API error:', data);
    throw new Error('Failed to fetch bandit recommendations');
  }
  
  return data;
};
