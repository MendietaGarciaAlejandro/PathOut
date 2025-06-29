import { configureStore } from '@reduxjs/toolkit';
import poiReducer from './slices/poiSlice';
import favoritesReducer from './slices/favoritesSlice';
import downloadReducer from './slices/downloadSlice';
import routeReducer from './slices/routeSlice';

export const store = configureStore({
  reducer: {
    poi: poiReducer,
    favorites: favoritesReducer,
    download: downloadReducer,
    route: routeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
