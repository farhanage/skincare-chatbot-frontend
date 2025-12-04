import { REACT_APP_API_BASE_URL } from '../utils/constants';

const API_URL = `${REACT_APP_API_BASE_URL}/interactions`;

// Track recent interactions to prevent duplicates
const recentInteractions = new Map();
const DEBOUNCE_TIME = 1000; // 1 second

/**
 * Track user interaction with a product
 * @param {number} productId - Product ID
 * @param {string} action - Action type: 'click' or 'add_to_cart'
 * @param {number} reward - Reward value (1.0 for click, 2.0 for add_to_cart)
 * @returns {Promise} Tracking response
 */
export const trackInteraction = async (productId, action, reward = null) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Don't track for non-logged users
    return null;
  }

  // Create a unique key for this interaction
  const interactionKey = `${productId}-${action}`;
  const now = Date.now();
  const lastTracked = recentInteractions.get(interactionKey);

  // Skip if this exact interaction was tracked recently (within debounce time)
  if (lastTracked && (now - lastTracked) < DEBOUNCE_TIME) {
    console.log('Skipping duplicate interaction:', interactionKey);
    return null;
  }

  // Record this interaction timestamp
  recentInteractions.set(interactionKey, now);

  // Clean up old entries (older than debounce time)
  for (const [key, timestamp] of recentInteractions.entries()) {
    if (now - timestamp > DEBOUNCE_TIME) {
      recentInteractions.delete(key);
    }
  }

  // Default rewards based on action
  const rewardValue = reward !== null ? reward : (action === 'add_to_cart' ? 2.0 : 1.0);

  try {
    const response = await fetch(`${API_URL}/track`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        product_id: productId,
        action: action,
        reward: rewardValue
      })
    });

    if (!response.ok) {
      throw new Error('Failed to track interaction');
    }

    return await response.json();
  } catch (error) {
    console.error('Error tracking interaction:', error);
    return null;
  }
};

/**
 * Get user interaction history
 * @param {number} limit - Number of records to retrieve
 * @param {number} offset - Offset for pagination
 * @returns {Promise} List of user interactions
 */
export const getUserInteractions = async (limit = 50, offset = 0) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_URL}/user?limit=${limit}&offset=${offset}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user interactions');
  }

  return await response.json();
};

/**
 * Update bandit state for a product
 * @param {number} productId - Product ID
 * @param {number} reward - Reward value
 * @param {number} impressionCount - Number of impressions
 * @returns {Promise} Update response
 */
export const updateBanditState = async (productId, reward, impressionCount = 1) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${REACT_APP_API_BASE_URL}/bandit/update`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      product_id: productId,
      reward: reward,
      impression_count: impressionCount
    })
  });

  if (!response.ok) {
    throw new Error('Failed to update bandit state');
  }

  return await response.json();
};
