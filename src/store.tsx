import { configureStore } from '@reduxjs/toolkit';
import { adminApi } from './services/admin';
import { iNaturalistApi } from './services/inaturalist';

export const store = configureStore({
  reducer: {
    [adminApi.reducerPath]: adminApi.reducer,
    [iNaturalistApi.reducerPath]: iNaturalistApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      adminApi.middleware,
      iNaturalistApi.middleware,
    ]),
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
