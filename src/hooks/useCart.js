import { useState, useEffect } from 'react';
import { CART_STORAGE } from '../utils/constants';

/**
 * Custom hook for shopping cart
 * @param {object} user - Current user
 * @returns {object} Cart state and methods
 */
export const useCart = (user) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage
  useEffect(() => {
    if (user) {
      const cartKey = CART_STORAGE.getCartKey(user.id);
      const saved = localStorage.getItem(cartKey);
      if (saved) {
        try {
          setCartItems(JSON.parse(saved));
        } catch (e) {
          console.error('Error loading cart:', e);
          setCartItems([]);
        }
      }
    } else {
      setCartItems([]);
    }
  }, [user]);

  // Save cart to localStorage
  const saveCart = (items) => {
    if (user) {
      const cartKey = CART_STORAGE.getCartKey(user.id);
      localStorage.setItem(cartKey, JSON.stringify(items));
      setCartItems(items);
    }
  };

  const addToCart = (product, quantity = 1) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      const updated = cartItems.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
      saveCart(updated);
    } else {
      const newItem = { ...product, quantity };
      saveCart([...cartItems, newItem]);
    }
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    const updated = cartItems.map(item =>
      item.id === productId ? { ...item, quantity } : item
    );
    saveCart(updated);
  };

  const removeFromCart = (productId) => {
    const updated = cartItems.filter(item => item.id !== productId);
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const getTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getItemCount = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  return {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotal,
    getItemCount,
  };
};
