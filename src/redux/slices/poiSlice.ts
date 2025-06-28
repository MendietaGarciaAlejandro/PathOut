import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { insertPOI, deletePOI } from '../../services/dbService';
import { POI } from '../../types/poi';

export const addPOIAsync = createAsyncThunk('poi/add', async (poi: POI) => {
  await insertPOI(poi);
  return poi;
});

export const removePOIAsync = createAsyncThunk('poi/remove', async (poiId: number) => {
  await deletePOI(poiId);
  return poiId;
});

const poiSlice = createSlice({
  name: 'poi',
  initialState: {
    pois: [] as POI[],
    loading: false,
    error: null,
  },
  reducers: {
    setPOIs(state, action) {
      state.pois = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(addPOIAsync.fulfilled, (state, action) => {
        state.pois.push(action.payload);
      })
      .addCase(removePOIAsync.fulfilled, (state, action) => {
        state.pois = state.pois.filter(poi => poi.id !== action.payload);
      });
  },
});

export const { setPOIs } = poiSlice.actions;
export default poiSlice.reducer;
