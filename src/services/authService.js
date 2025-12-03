import axios from 'axios';
import { REACT_APP_API_BASE_URL } from '../utils/constants';

const API_URL = `${REACT_APP_API_BASE_URL}/auth`;

/**
 * Login user
 * @param {string} username - Username or email
 * @param {string} password - Password
 * @returns {Promise} Login response with user data and token
 */
export const login = async (username, password) => {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Login gagal');
  }

  return data;
};

/**
 * Register new user
 * @param {object} userData - User registration data
 * @returns {Promise} Registration response
 */
export const register = async (userData) => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Registrasi gagal');
  }

  return data;
};

/**
 * Save user session
 * @param {object} user - User data
 * @param {string} token - Auth token
 */
export const saveSession = (user, token) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

/**
 * Clear user session
 */
export const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
