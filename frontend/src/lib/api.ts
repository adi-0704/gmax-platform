import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  // Try to get token if not already in headers
  if (typeof window !== 'undefined') {
    const jsCookie = require('js-cookie');
    const userStr = jsCookie.get('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
  }
  return config;
});

export default api;
