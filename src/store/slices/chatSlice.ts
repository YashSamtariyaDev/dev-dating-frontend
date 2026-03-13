import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Chat, Message } from '@/types';
import { apiClient, API_ENDPOINTS } from '@/config/api';

interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  isLoading: boolean;
  error: string | null;
  isTyping: boolean;
}

const initialState: ChatState = {
  chats: [],
  currentChat: null,
  isLoading: false,
  error: null,
  isTyping: false,
};

// Async thunks
export const fetchChats = createAsyncThunk(
  'chat/fetchChats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CHATS.LIST);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch chats');
    }
  }
);

export const fetchChatMessages = createAsyncThunk(
  'chat/fetchChatMessages',
  async (chatId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CHATS.MESSAGES.replace(':id', chatId));
      return { chatId, messages: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ chatId, content }: { chatId: string; content: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CHATS.SEND.replace(':id', chatId), { content });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

export const createChat = createAsyncThunk(
  'chat/createChat',
  async (participantId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CHATS.CREATE, { participantId });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create chat');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentChat: (state, action: PayloadAction<Chat | null>) => {
      state.currentChat = action.payload;
    },
    addMessage: (state, action: PayloadAction<{ chatId: string; message: Message }>) => {
      const { chatId, message } = action.payload;
      
      // Update current chat if it matches
      if (state.currentChat?.id === chatId) {
        state.currentChat.messages.push(message);
      }
      
      // Update chat in the list
      const chatIndex = state.chats.findIndex(c => c.id === chatId);
      if (chatIndex !== -1) {
        state.chats[chatIndex].messages.push(message);
      }
    },
    setTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch chats
    builder
      .addCase(fetchChats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.chats = action.payload;
        state.error = null;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch chat messages
    builder
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        const { chatId, messages } = action.payload;
        
        // Update current chat if it matches
        if (state.currentChat?.id === chatId) {
          state.currentChat.messages = messages;
        }
        
        // Update chat in the list
        const chatIndex = state.chats.findIndex(c => c.id === chatId);
        if (chatIndex !== -1) {
          state.chats[chatIndex].messages = messages;
        }
      });

    // Send message
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isTyping = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isTyping = false;
        const message = action.payload;
        
        // Add to current chat
        if (state.currentChat) {
          state.currentChat.messages.push(message);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isTyping = false;
        state.error = action.payload as string;
      });

    // Create chat
    builder
      .addCase(createChat.fulfilled, (state, action) => {
        state.chats.push(action.payload);
        state.currentChat = action.payload;
      });
  },
});

export const {
  setCurrentChat,
  addMessage,
  setTyping,
  clearError,
} = chatSlice.actions;

export default chatSlice.reducer;
