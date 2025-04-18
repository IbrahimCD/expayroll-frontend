// src/services/api.js
import axios from 'axios';

// Fallback if REACT_APP_API_URL is not set:
const baseURL = process.env.REACT_APP_API_URL ||     'http://localhost:4000';

const api = axios.create({
  baseURL,
  withCredentials: true,   // if you need cookies or credentialed requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept outgoing requests and attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
