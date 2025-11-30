import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const API_URL = `${API_BASE_URL}/api/v1/orders`;

/**
 * Create new order
 * @param {object} orderData - Order details
 * @param {string} token - Auth token
 * @returns {Promise} Order response
 */
export const createOrder = async (orderData, token) => {
  const response = await axios.post(API_URL, orderData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Get user orders
 * @param {string} token - Auth token
 * @returns {Promise} List of orders
 */
export const getUserOrders = async (token) => {
  const response = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Get order by ID
 * @param {string} orderId - Order ID
 * @param {string} token - Auth token
 * @returns {Promise} Order details
 */
export const getOrderById = async (orderId, token) => {
  const response = await axios.get(`${API_URL}/${orderId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
