import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { POI } from '../../types/poi';
import { insertPOI, deletePOI } from '../../services/dbServiceConfig';

export const addPOIAsync = createAsyncThunk('poi/add', async (poi: POI) => {
  console.log('poiSlice: addPOIAsync llamado con:', poi);
  console.log('poiSlice: Iniciando inserción en base de datos...');
  
  try {
    // Insertar en la base de datos
    await insertPOI(poi);
    console.log('poiSlice: POI agregado exitosamente en la base de datos');
    return poi;
  } catch (error) {
    console.error('poiSlice: Error al agregar POI a la base de datos:', error);
    throw error;
  }
});

export const removePOIAsync = createAsyncThunk('poi/remove', async (poiId: number) => {
  console.log('poiSlice: removePOIAsync llamado con:', poiId);
  console.log('poiSlice: Iniciando eliminación de base de datos...');
  
  try {
    // Eliminar de la base de datos
    await deletePOI(poiId);
    console.log('poiSlice: POI eliminado exitosamente de la base de datos');
    return poiId;
  } catch (error) {
    console.error('poiSlice: Error al eliminar POI de la base de datos:', error);
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
      console.log('poiSlice: setPOIs llamado con:', action.payload);
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
        console.log('poiSlice: addPOIAsync.pending - Estado antes:', state.pois.length, 'POIs');
        state.loading = true;
        state.error = null;
        console.log('poiSlice: addPOIAsync.pending - Loading establecido en true');
      })
      .addCase(addPOIAsync.fulfilled, (state, action) => {
        console.log('poiSlice: addPOIAsync.fulfilled con:', action.payload);
        console.log('poiSlice: Estado antes de agregar:', state.pois.length, 'POIs');
        state.loading = false;
        state.pois.push(action.payload);
        state.error = null;
        console.log('poiSlice: Estado después de agregar:', state.pois.length, 'POIs');
        console.log('poiSlice: Estado actual de POIs:', state.pois);
      })
      .addCase(addPOIAsync.rejected, (state, action) => {
        console.log('poiSlice: addPOIAsync.rejected con error:', action.error);
        state.loading = false;
        state.error = action.error.message || 'Error al agregar el punto de interés';
        console.log('poiSlice: Error establecido:', state.error);
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
