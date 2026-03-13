import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Match } from '@/types';
import { apiClient, API_ENDPOINTS } from '@/config/api';

interface MatchState {
  matches: Match[];
  potentialMatches: any[];
  isLoading: boolean;
  error: string | null;
  isCreatingMatch: boolean;
}

const initialState: MatchState = {
  matches: [],
  potentialMatches: [],
  isLoading: false,
  error: null,
  isCreatingMatch: false,
};

// Async thunks
export const fetchMatches = createAsyncThunk(
  'match/fetchMatches',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MATCHES.LIST);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch matches');
    }
  }
);

export const createMatch = createAsyncThunk(
  'match/createMatch',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.MATCHES.CREATE, { userId });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create match');
    }
  }
);

export const updateMatchStatus = createAsyncThunk(
  'match/updateMatchStatus',
  async ({ matchId, status }: { matchId: string; status: 'accepted' | 'rejected' }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.MATCHES.UPDATE.replace(':id', matchId), { status });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update match');
    }
  }
);

export const deleteMatch = createAsyncThunk(
  'match/deleteMatch',
  async (matchId: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(API_ENDPOINTS.MATCHES.DELETE.replace(':id', matchId));
      return matchId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete match');
    }
  }
);

const matchSlice = createSlice({
  name: 'match',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addPotentialMatch: (state, action: PayloadAction<any>) => {
      state.potentialMatches.push(action.payload);
    },
    removePotentialMatch: (state, action: PayloadAction<string>) => {
      state.potentialMatches = state.potentialMatches.filter(m => m.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    // Fetch matches
    builder
      .addCase(fetchMatches.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMatches.fulfilled, (state, action) => {
        state.isLoading = false;
        state.matches = action.payload;
        state.error = null;
      })
      .addCase(fetchMatches.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create match
    builder
      .addCase(createMatch.pending, (state) => {
        state.isCreatingMatch = true;
        state.error = null;
      })
      .addCase(createMatch.fulfilled, (state, action) => {
        state.isCreatingMatch = false;
        state.matches.push(action.payload);
        state.error = null;
      })
      .addCase(createMatch.rejected, (state, action) => {
        state.isCreatingMatch = false;
        state.error = action.payload as string;
      });

    // Update match status
    builder
      .addCase(updateMatchStatus.fulfilled, (state, action) => {
        const updatedMatch = action.payload;
        const index = state.matches.findIndex(m => m.id === updatedMatch.id);
        if (index !== -1) {
          state.matches[index] = updatedMatch;
        }
      });

    // Delete match
    builder
      .addCase(deleteMatch.fulfilled, (state, action) => {
        const matchId = action.payload;
        state.matches = state.matches.filter(m => m.id !== matchId);
      });
  },
});

export const {
  clearError,
  addPotentialMatch,
  removePotentialMatch,
} = matchSlice.actions;

export default matchSlice.reducer;
