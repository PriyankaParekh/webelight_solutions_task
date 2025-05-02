import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RepositoryState, SortOption, SortOrder } from "../../types";
import { getPopularRepositories } from "../../services/api";
import { toast } from "react-toastify";

const initialState: RepositoryState = {
  repositories: [],
  loading: false,
  error: null,
  sortBy: "stars",
  sortOrder: "desc",
  page: 1,
  hasMore: true,
  timePeriod: 30,
};

export const fetchRepositories = createAsyncThunk(
  "repositories/fetchRepositories",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { repositories: RepositoryState };
      const { page, timePeriod } = state?.repositories;
      const repositories = await getPopularRepositories(page, timePeriod);
      return repositories;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch repositories";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const loadMoreRepositories = createAsyncThunk(
  "repositories/loadMoreRepositories",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { repositories: RepositoryState };
      const { page, timePeriod } = state?.repositories;
      const repositories = await getPopularRepositories(page, timePeriod);
      return repositories;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error?.message
          : "Failed to load more repositories";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const repoSlice = createSlice({
  name: "repositories",
  initialState,
  reducers: {
    setSortOption(state, action: { payload: SortOption }) {
      state.sortBy = action?.payload;
    },
    setSortOrder(state, action: { payload: SortOrder }) {
      state.sortOrder = action?.payload;
    },
    setTimePeriod(state, action: { payload: number }) {
      state.timePeriod = action?.payload;
      state.page = 1;
      state.repositories = [];
      state.hasMore = true;
    },
    resetRepositories(state) {
      state.repositories = [];
      state.page = 1;
      state.hasMore = true;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchRepositories.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRepositories.fulfilled, (state, action) => {
        state.repositories = action?.payload;
        state.loading = false;
        state.hasMore = action?.payload?.length === 20;
        state.page = 2; // Set next page
      })
      .addCase(fetchRepositories?.rejected, (state, action) => {
        state.loading = false;
        state.error = action?.payload as string;
      })
      .addCase(loadMoreRepositories?.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadMoreRepositories?.fulfilled, (state, action) => {
        state.repositories = [...state?.repositories, ...action?.payload];
        state.loading = false;
        state.hasMore = action?.payload?.length === 20;
        state.page += 1; // Increment page for next load
      })
      .addCase(loadMoreRepositories.rejected, (state, action) => {
        state.loading = false;
        state.error = action?.payload as string;
      });
  },
});

export const { setSortOption, setSortOrder, setTimePeriod, resetRepositories } =
  repoSlice.actions;
export default repoSlice.reducer;
