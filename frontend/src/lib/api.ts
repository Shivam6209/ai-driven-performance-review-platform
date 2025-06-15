import axios from 'axios';
import { auth } from './firebase';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    if (config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access - but don't redirect here
      // Let the AuthContext handle the redirect to avoid conflicts
      console.log('401 Unauthorized - token may be expired');
    }
    return Promise.reject(error);
  }
);

export default api;

// API endpoints
export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    profile: '/auth/profile',
  },
  employees: {
    list: '/employees',
    create: '/employees',
    get: (id: string) => `/employees/${id}`,
    update: (id: string) => `/employees/${id}`,
    delete: (id: string) => `/employees/${id}`,
  },
  departments: {
    list: '/departments',
    create: '/departments',
    get: (id: string) => `/departments/${id}`,
    update: (id: string) => `/departments/${id}`,
    delete: (id: string) => `/departments/${id}`,
  },
  okrs: {
    list: '/okrs',
    create: '/okrs',
    get: (id: string) => `/okrs/${id}`,
    update: (id: string) => `/okrs/${id}`,
    delete: (id: string) => `/okrs/${id}`,
    categories: '/okrs/categories',
    tags: '/okrs/tags',
  },
  feedback: {
    list: '/feedback',
    create: '/feedback',
    get: (id: string) => `/feedback/${id}`,
    update: (id: string) => `/feedback/${id}`,
    delete: (id: string) => `/feedback/${id}`,
  },
  reviews: {
    list: '/reviews',
    create: '/reviews',
    get: (id: string) => `/reviews/${id}`,
    update: (id: string) => `/reviews/${id}`,
    delete: (id: string) => `/reviews/${id}`,
    cycles: '/reviews/cycles',
    templates: '/reviews/templates',
  },
  analytics: {
    performance: '/analytics/performance',
    sentiment: '/analytics/sentiment',
    goals: '/analytics/goals',
    feedback: '/analytics/feedback',
  },
}; 