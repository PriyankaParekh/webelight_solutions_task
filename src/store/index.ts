import { configureStore } from '@reduxjs/toolkit';
import repoReducer from './slice/reposlice';

export const store = configureStore({
  reducer: {
    repositories: repoReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;