import { REACT_APP_API_BASE_URL } from '../utils/constants';

const API_URL = `${REACT_APP_API_BASE_URL}/orders`;

/**
 * Create new order
 * @param {object} orderData - Order details
 * @param {string} token - Auth token
 * @returns {Promise} Order response
 */
export const createOrder = async (orderData, token) => {
  const response = await fetch(`${API_URL}/get_all_orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    throw new Error('Failed to create order');
  }

  return await response.json();
};

/**
 * Get user orders
 * @param {string} userId - User ID
 * @param {string} token - Auth token
 * @returns {Promise} List of orders
 */
export const getUserOrders = async (userId, token) => {
  const response = await fetch(`${REACT_APP_API_BASE_URL}/user/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to load orders');
  }

  return await response.json();
};

/**
 * Get order by ID
 * @param {string} orderId - Order ID
 * @param {string} token - Auth token
 * @returns {Promise} Order details
 */
export const getOrderById = async (orderId, token) => {
  const response = await fetch(`${API_URL}/${orderId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to load order');
  }

  return await response.json();
};
