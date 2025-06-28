import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getFavorites, addFavorite, removeFavorite } from '../../services/dbService';

export const fetchFavorites = createAsyncThunk('favorites/fetch', async () => {
  return await getFavorites();
});

export const addFavoriteAsync = createAsyncThunk('favorites/add', async (poiId: number) => {
  await addFavorite(poiId);
  return poiId;
});

export const removeFavoriteAsync = createAsyncThunk('favorites/remove', async (poiId: number) => {
  await removeFavorite(poiId);
  return poiId;
});

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: {
    favorites: [] as number[],
    loading: false,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.favorites = action.payload;
      })
      .addCase(addFavoriteAsync.fulfilled, (state, action) => {
        if (!state.favorites.includes(action.payload)) {
          state.favorites.push(action.payload);
        }
      })
      .addCase(removeFavoriteAsync.fulfilled, (state, action) => {
        state.favorites = state.favorites.filter(id => id !== action.payload);
      });
  },
});

export default favoritesSlice.reducer;
