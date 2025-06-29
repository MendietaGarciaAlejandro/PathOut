import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { POI } from '../../types/poi';
import { insertPOI, deletePOI } from '../../services/dbService.web';

export const addPOIAsync = createAsyncThunk('poi/add', async (poi: POI) => {
  try {
    await insertPOI(poi);
    return poi;
  } catch (error) {
    console.error('Error al agregar POI a la base de datos:', error);
    throw error;
  }
});

export const removePOIAsync = createAsyncThunk('poi/remove', async (poiId: number) => {
  try {
    await deletePOI(poiId);
    return poiId;
  } catch (error) {
    console.error('Error al eliminar POI de la base de datos:', error);
    throw error;
  }
});

const poiSlice = createSlice({
  name: 'poi',
  initialState: {
    pois: [] as POI[],
    loading: false,
    error: null as string | null,
  },
  reducers: {
    setPOIs(state, action) {
      state.pois = action.payload;
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // addPOIAsync
      .addCase(addPOIAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPOIAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.pois.push(action.payload);
        state.error = null;
      })
      .addCase(addPOIAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al agregar el punto de interés';
      })
      // removePOIAsync
      .addCase(removePOIAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removePOIAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.pois = state.pois.filter(poi => poi.id !== action.payload);
        state.error = null;
      })
      .addCase(removePOIAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al eliminar el punto de interés';
      });
  },
});

export const { setPOIs, clearError } = poiSlice.actions;
export default poiSlice.reducer;
