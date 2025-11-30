import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * Custom hook for authentication
 * @returns {object} Auth state and methods
 */
export const useAuth = () => {
  const [user, setUser] = useLocalStorage(STORAGE_KEYS.USER, null);
  const [token, setToken] = useLocalStorage(STORAGE_KEYS.TOKEN, null);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    // Clear upload session data
    sessionStorage.removeItem(STORAGE_KEYS.UPLOAD_PREVIEW);
    sessionStorage.removeItem(STORAGE_KEYS.UPLOAD_PREDICTION);
  };

  const isAuthenticated = () => {
    return !!(user && token);
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  return {
    user,
    token,
    login,
    logout,
    isAuthenticated,
    isAdmin,
  };
};
