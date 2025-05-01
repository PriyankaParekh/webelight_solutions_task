import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RepositoryState, SortOption, SortOrder } from '../../types';
import { getPopularRepositories } from '../../services/api';
import { toast } from 'react-toastify';

const initialState: RepositoryState = {
  repositories: [],
  loading: false,
  error: null,
  sortBy: 'stars',
  sortOrder: 'desc'
};

export const fetchRepositories = createAsyncThunk(
  'repositories/fetchRepositories',
  async (_, { rejectWithValue }) => {
    try {
      const repositories = await getPopularRepositories();
      return repositories;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch repositories';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const repoSlice = createSlice({
  name: 'repositories',
  initialState,
  reducers: {
    setSortOption(state, action: { payload: SortOption }) {
      state.sortBy = action.payload;
    },
    setSortOrder(state, action: { payload: SortOrder }) {
      state.sortOrder = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRepositories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRepositories.fulfilled, (state, action) => {
        state.repositories = action.payload;
        state.loading = false;
      })
      .addCase(fetchRepositories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSortOption, setSortOrder } = repoSlice.actions;
export default repoSlice.reducer;