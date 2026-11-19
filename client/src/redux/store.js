import { configureStore } from '@reduxjs/toolkit'
import { api } from './services/api';
import { adminApi } from './services/adminApi';
import carCompare, { setCompareStorageUnavailable } from './carCompareSlice.js';
import { COMPARE_STORAGE_KEY } from '../utils/carCompare.js';

const persistComparison = (storeApi) => (next) => (action) => {
    const previous = storeApi.getState().carCompare.ids;
    const result = next(action);
    const { ids, storageUnavailable } = storeApi.getState().carCompare;
    if (ids !== previous && !storageUnavailable && typeof window !== 'undefined') {
        try {
            window.localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(ids));
        } catch {
            storeApi.dispatch(setCompareStorageUnavailable());
        }
    }
    return result;
};

export const store = configureStore({
    reducer: {
        [api.reducerPath]: api.reducer,
        [adminApi.reducerPath]: adminApi.reducer,
        carCompare,
    },
    middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware().concat(api.middleware, adminApi.middleware, persistComparison);
    }
});

