import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import employeeReducer from './slices/employeeSlice';
import departmentReducer from './slices/departmentSlice';
import okrReducer from './slices/okrSlice';
import feedbackReducer from './slices/feedbackSlice';
import reviewReducer from './slices/reviewSlice';
import uiReducer from './slices/uiSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    employee: employeeReducer,
    department: departmentReducer,
    okr: okrReducer,
    feedback: feedbackReducer,
    review: reviewReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/setUser'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.timestamp', 'payload.user'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.user'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store; 