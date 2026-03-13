import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { apiClient, API_ENDPOINTS } from '@/config/api';
import { User, Match, Chat, ApiResponse, PaginatedResponse } from '@/types';

// Generic API hooks
export function useApiQuery<T>(
  queryKey: string[],
  fetcher: () => Promise<T>,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey,
    queryFn: fetcher,
    ...options,
  });
}

export function useApiMutation<T, V>(
  mutationFn: (variables: V) => Promise<T>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: any) => void;
  }
) {
  return useMutation({
    mutationFn,
    ...options,
  });
}

// Auth hooks
export function useLogin() {
  return useApiMutation(
    async (credentials: { email: string; password: string }) => {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      return response.data;
    }
  );
}

export function useRegister() {
  return useApiMutation(
    async (userData: { email: string; password: string; name: string }) => {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      return response.data;
    }
  );
}

export function useCurrentUser() {
  return useApiQuery(
    ['auth', 'user'],
    async () => {
      const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
      return response.data;
    },
    {
      retry: false,
    }
  );
}

export function useProfile() {
  return useApiQuery(
    ['profile', 'me'],
    async () => {
      const response = await apiClient.get(API_ENDPOINTS.USERS.PROFILE);
      return response.data;
    }
  );
}

export function useCompletionStatus() {
  return useApiQuery(
    ['profile', 'completion-status'],
    async () => {
      const response = await apiClient.get(API_ENDPOINTS.USERS.COMPLETION_STATUS);
      return response.data;
    }
  );
}

export function useUploadPhoto() {
  return useApiMutation(
    async (file: File) => {
      const formData = new FormData();
      formData.append('photo', file);
      const response = await apiClient.post(API_ENDPOINTS.USERS.UPLOAD_PHOTO, formData);
      return response.data;
    }
  );
}

// User hooks
export function useUpdateProfile() {
  return useApiMutation(
    async (profileData: Partial<User>) => {
      const response = await apiClient.patch(API_ENDPOINTS.USERS.UPDATE, profileData);
      return response.data;
    }
  );
}

export function useSearchUsers() {
  return useApiMutation(
    async (query: string) => {
      const response = await apiClient.get(`${API_ENDPOINTS.USERS.SEARCH}?q=${query}`);
      return response.data;
    }
  );
}

export type FeedUser = {
  id: number;
  name: string;
  bio: string;
  age: number;
  gender?: string;
  techStack: string[];
  experienceLevel: string;
  location: string;
  distance?: number;
  matchScore: number;
};

export function useExploreFeed() {
  const { data: session } = useSession();

  return useApiQuery(
    ['users', 'feed'],
    async () => {
      const response = await apiClient.get(API_ENDPOINTS.USERS.FEED);
      return response.data?.data ?? response.data;
    },
    {
      enabled: !!session,
    }
  );
}

// Match hooks
export function useMatches() {
  const { data: session } = useSession();
  return useApiQuery(
    ['matches'],
    async () => {
      const response = await apiClient.get(API_ENDPOINTS.MATCHES.LIST);
      return response.data;
    },
    {
      enabled: !!session, // Only fetch when authenticated
    }
  );
}

export function useCreateMatch() {
  return useApiMutation(
    async (userId: string) => {
      const response = await apiClient.post(API_ENDPOINTS.MATCHES.CREATE, { userId });
      return response.data;
    }
  );
}

export function useUpdateMatchStatus() {
  return useApiMutation(
    async ({ matchId, status }: { matchId: string; status: 'accepted' | 'rejected' }) => {
      const response = await apiClient.put(API_ENDPOINTS.MATCHES.UPDATE.replace(':id', matchId), { status });
      return response.data;
    }
  );
}

// Chat hooks
export function useChats() {
  const { data: session } = useSession();
  return useApiQuery(
    ['chats'],
    async () => {
      const response = await apiClient.get(API_ENDPOINTS.CHATS.LIST);
      return response.data;
    },
    {
      enabled: !!session, // Only fetch when authenticated
    }
  );
}

export function useChatMessages(chatId: string) {
  return useApiQuery(
    ['chats', chatId, 'messages'],
    async () => {
      const response = await apiClient.get(
        API_ENDPOINTS.CHATS.MESSAGES.replace(':chatRoomId', chatId)
      );
      return response.data;
    },
    {
      enabled: !!chatId,
    }
  );
}

export function useSendMessage() {
  return useApiMutation(
    async ({ chatId, content }: { chatId: string; content: string }) => {
      const response = await apiClient.post(API_ENDPOINTS.CHATS.SEND, {
        chatRoomId: Number(chatId),
        content,
      });
      return response.data;
    }
  );
}

export function useSwipe() {
  return useApiMutation(
    async ({ targetId, type }: { targetId: number; type: 'LIKE' | 'PASS' | 'SUPER_LIKE' }) => {
      const response = await apiClient.post(API_ENDPOINTS.MATCHES.SWIPE, { targetId, type });
      return response.data;
    }
  );
}

export function useCreateChat() {
  return useApiMutation(
    async (participantId: string) => {
      const response = await apiClient.post(API_ENDPOINTS.CHATS.CREATE, { participantId });
      return response.data;
    }
  );
}
