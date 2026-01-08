import { configureStore } from '@reduxjs/toolkit'
import { api } from './services/api';
import { adminApi } from './services/adminApi';

export const store = configureStore({
    reducer: {
        [api.reducerPath]: api.reducer,
        [adminApi.reducerPath]: adminApi.reducer
    },
    middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware().concat(api.middleware, adminApi.middleware);
    }
});

