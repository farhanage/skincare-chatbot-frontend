import axios from 'axios';
import { REACT_APP_API_BASE_URL } from '../utils/constants';

const API_URL = `${REACT_APP_API_BASE_URL}/products`;

/**
 * Get all products with optional filters
 * @param {object} filters - Filter parameters
 * @returns {Promise} List of products
 */
export const getProducts = async (filters = {}) => {
  const response = await axios.get(API_URL, { params: filters });
  return response.data;
};

/**
 * Get product by ID
 * @param {string} productId - Product ID
 * @returns {Promise} Product details
 */
export const getProductById = async (productId) => {
  const response = await axios.get(`${API_URL}/${productId}`);
  return response.data;
};
