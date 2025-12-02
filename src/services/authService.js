import axios from 'axios';
import { REACT_APP_API_BASE_URL } from '../utils/constants';

const API_URL = `${REACT_APP_API_BASE_URL}/auth`;

/**
 * Login user
 * @param {string} identifier - Email or username
 * @param {string} password - Password
 * @returns {Promise} Login response with user data and token
 */
export const login = async (identifier, password) => {
  const response = await axios.post(`${API_URL}/login`, {
    identifier,
    password,
  });
  return response.data;
};

/**
 * Register new user
 * @param {object} userData - User registration data
 * @returns {Promise} Registration response
 */
export const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};
