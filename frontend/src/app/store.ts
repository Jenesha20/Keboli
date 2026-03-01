import { configureStore } from '@reduxjs/toolkit';
import assessmentReducer from '../features/assessment/slices/assessmentSlice';

import candidateReducer from '../features/candidate/slices/candidateSlice';

export const store = configureStore({
  reducer: {
    assessment: assessmentReducer,
    candidate: candidateReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
