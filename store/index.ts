import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer from './auth/authSlice';
import onboardingReducer from './onboarding/onboardingSlice';

const authPersistConfig = { key: 'auth', storage: AsyncStorage };
const onboardingPersistConfig = { key: 'onboarding', storage: AsyncStorage };

const reducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  onboarding: persistReducer(onboardingPersistConfig, onboardingReducer),
});

export const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
