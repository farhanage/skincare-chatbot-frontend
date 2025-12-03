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
