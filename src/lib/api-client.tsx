'use client';

import { useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/config/api';

export function ApiClientProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();

  useEffect(() => {
    // Update axios interceptor to use NextAuth session token
    const requestInterceptor = apiClient.interceptors.request.use(
      (config) => {
        const token = (session as any)?.accessToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add request timestamp
        (config as any).metadata = { startTime: new Date() };
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      apiClient.interceptors.request.eject(requestInterceptor);
    };
  }, [session]);

  useEffect(() => {
    // Response interceptor for logging and error handling
    const responseInterceptor = apiClient.interceptors.response.use(
      (response) => {
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
          
          // For now, redirect to login on 401
          // TODO: Implement refresh token flow if needed
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      apiClient.interceptors.response.eject(responseInterceptor);
    };
  }, [session]);

  return <>{children}</>;
}
