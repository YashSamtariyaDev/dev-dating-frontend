import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});

// Query keys
export const QUERY_KEYS = {
  AUTH: {
    USER: ['auth', 'user'],
    SESSION: ['auth', 'session'],
  },
  USERS: {
    PROFILE: (id: string) => ['users', 'profile', id],
    SEARCH: (query: string) => ['users', 'search', query],
    LIST: ['users', 'list'],
  },
  MATCHES: {
    LIST: ['matches'],
    POTENTIAL: ['matches', 'potential'],
    DETAIL: (id: string) => ['matches', id],
  },
  CHATS: {
    LIST: ['chats'],
    MESSAGES: (chatId: string) => ['chats', chatId, 'messages'],
    DETAIL: (id: string) => ['chats', id],
  },
} as const;
