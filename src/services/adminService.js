import { REACT_APP_API_BASE_URL } from '../utils/constants';

const API_URL = `${REACT_APP_API_BASE_URL}/debug`;

/**
 * Get debug info by endpoint
 * @param {string} endpoint - Debug endpoint (info, users, products, carts, tables)
 * @param {string} token - Auth token
 * @returns {Promise} Debug data
 */
export const getDebugInfo = async (endpoint, token) => {
  const response = await fetch(`${API_URL}/${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || 'Failed to fetch data');
  }

  return result;
};

/**
 * Get system info
 * @param {string} token - Auth token
 * @returns {Promise} System information
 */
export const getSystemInfo = async (token) => {
  return getDebugInfo('info', token);
};

/**
 * Get all users
 * @param {string} token - Auth token
 * @returns {Promise} Users data
 */
export const getAllUsers = async (token) => {
  return getDebugInfo('users', token);
};

/**
 * Get all products
 * @param {string} token - Auth token
 * @returns {Promise} Products data
 */
export const getAllProductsDebug = async (token) => {
  return getDebugInfo('products', token);
};

/**
 * Get all carts
 * @param {string} token - Auth token
 * @returns {Promise} Carts data
 */
export const getAllCarts = async (token) => {
  return getDebugInfo('carts', token);
};

/**
 * Get database tables info
 * @param {string} token - Auth token
 * @returns {Promise} Tables data
 */
export const getTablesInfo = async (token) => {
  return getDebugInfo('tables', token);
};
