import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';

interface UserState {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  currentUser: {
    id: 'USER001',
    name: 'Estudiante Demo',
    email: 'demo@tallerlogistica.com',
    role: 'student',
    progress: {
      activitiesCompleted: 2,
      totalActivities: 4,
      averageScore: 88.5,
    },
  },
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
    },
    updateUserProgress: (state, action: PayloadAction<{activitiesCompleted: number, averageScore: number}>) => {
      if (state.currentUser) {
        state.currentUser.progress.activitiesCompleted = action.payload.activitiesCompleted;
        state.currentUser.progress.averageScore = action.payload.averageScore;
      }
    },
    logout: (state) => {
      state.currentUser = null;
    },
  },
});

export const { 
  setLoading, 
  setError, 
  setUser, 
  updateUserProgress, 
  logout 
} = userSlice.actions;

export default userSlice.reducer;