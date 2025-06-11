// src/api/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

// Get Clerk user ID from localStorage on each request
api.interceptors.request.use((config) => {
  const userId = localStorage.getItem('clerkUserId');
  const userData = localStorage.getItem('clerkUserData');
  if (userId) {
    config.headers['X-User-ID'] = userId;
  }
  if (userData) {
    config.headers['X-User-Data'] = userData;
    const encodedUserData = btoa(userData);
    config.headers['Authorization'] = `Bearer ${encodedUserData}`;
  }

  return config;
});

export default api;
