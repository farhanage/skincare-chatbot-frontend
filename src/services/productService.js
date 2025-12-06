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
 * @param {object} options - Recommendation options
 * @param {number} options.n_recommendations - Number of recommendations (default: 5)
 * @param {string} options.category - Product category filter (optional)
 * @param {Array<number>} options.exclude_product_ids - Product IDs to exclude (optional)
 * @returns {Promise} List of recommended products
 */
export const getBanditRecommendations = async (options = {}) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Return empty recommendations for non-logged users
    return { success: true, recommendations: [] };
  }
  
  // Build query parameters
  const params = new URLSearchParams();
  
  if (options.n_recommendations) {
    params.append('n_recommendations', options.n_recommendations);
  }
  
  if (options.category) {
    params.append('category', options.category);
  }
  
  if (options.exclude_product_ids && Array.isArray(options.exclude_product_ids)) {
    options.exclude_product_ids.forEach(id => {
      params.append('exclude_product_ids', id);
    });
  }
  
  const queryString = params.toString();
  const url = `${REACT_APP_API_BASE_URL}/bandit/recommend${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    console.error('Bandit API error:', data);
    throw new Error('Failed to fetch bandit recommendations');
  }
  
  return data;
};
