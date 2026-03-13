import axios from 'axios';

// API configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://localhost:3000',
  PROXY_BASE_URL: '/api/proxy', // Use Next.js proxy for browser calls (relative path allows IP access)
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_CONFIG.PROXY_BASE_URL, // Use generic proxy for all calls
  timeout: API_CONFIG.TIMEOUT,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp
    (config as any).metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const endTime = new Date();
    const duration = endTime.getTime() - (response.config as any).metadata.startTime.getTime();
    
    console.log(`API Request to ${response.config.url} took ${duration}ms`);
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Refresh token logic here
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          
          const { token } = response.data;
          localStorage.setItem('auth_token', token);
          
          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/auth/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  USERS: {
    PROFILE: '/profile/me',
    SEARCH: '/users/search',
    UPDATE: '/profile/me',
    DISCOVER: '/users/discover',
    FEED: '/users/feed',
    COMPLETION_STATUS: '/profile/completion-status',
    UPLOAD_PHOTO: '/profile/upload-photo',
  },
  MATCHES: {
    LIST: 'matching/matches',
    CREATE: 'matching/matches',
    UPDATE: 'matching/matches/:id',
    DELETE: 'matching/matches/:id',
    SWIPE: 'matching/swipe',
  },
  CHATS: {
    LIST: 'chat-rooms/my',
    CREATE: 'chat-rooms/message',
    MESSAGES: 'chat-rooms/:chatRoomId/messages',
    SEND: 'chat-rooms/message',
  },
} as const;
