import { useCallback } from 'react';
import { trackInteraction } from '../services/interactionService';

/**
 * Custom hook for tracking user interactions
 * @param {object} user - Current user object
 * @returns {object} Tracking functions
 */
export const useInteractionTracking = (user) => {
  const trackClick = useCallback((productId) => {
    if (user) {
      trackInteraction(productId, 'click', 1.0);
    }
  }, [user]);

  const trackAddToCart = useCallback((productId) => {
    if (user) {
      trackInteraction(productId, 'add_to_cart', 2.0);
    }
  }, [user]);

  const trackCustom = useCallback((productId, action, reward) => {
    if (user) {
      trackInteraction(productId, action, reward);
    }
  }, [user]);

  return {
    trackClick,
    trackAddToCart,
    trackCustom,
    isTracking: !!user
  };
};
