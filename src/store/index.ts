import { configureStore } from '@reduxjs/toolkit';
import inventoryReducer from './slices/inventorySlice';
import shipmentsReducer from './slices/shipmentsSlice';
import activitiesReducer from './slices/activitiesSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    inventory: inventoryReducer,
    shipments: shipmentsReducer,
    activities: activitiesReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;