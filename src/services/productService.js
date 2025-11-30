import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const API_URL = `${API_BASE_URL}/api/v1/products`;

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
