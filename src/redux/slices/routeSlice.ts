import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Route } from '../../types/route';
import { saveRoute, getRoutes, deleteRoute } from '../../services/dbService.web';

export const createRouteAsync = createAsyncThunk('route/create', async (route: Route) => {
  console.log('routeSlice: createRouteAsync iniciado con ruta:', route);
  try {
    console.log('routeSlice: Guardando ruta en DB...');
    await saveRoute(route);
    console.log('routeSlice: Ruta guardada exitosamente en DB');
    return route;
  } catch (error) {
    console.error('routeSlice: Error al crear ruta:', error);
    throw error;
  }
});

export const fetchRoutesAsync = createAsyncThunk('route/fetch', async () => {
  try {
    return await getRoutes();
  } catch (error) {
    console.error('Error al cargar rutas:', error);
    throw error;
  }
});

export const deleteRouteAsync = createAsyncThunk('route/delete', async (routeId: number) => {
  try {
    await deleteRoute(routeId);
    return routeId;
  } catch (error) {
    console.error('Error al eliminar ruta:', error);
    throw error;
  }
});

const routeSlice = createSlice({
  name: 'route',
  initialState: {
    routes: [] as Route[],
    loading: false,
    error: null as string | null,
    selectedRoute: null as Route | null,
  },
  reducers: {
    setSelectedRoute(state, action) {
      state.selectedRoute = action.payload;
    },
    clearSelectedRoute(state) {
      state.selectedRoute = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // createRouteAsync
      .addCase(createRouteAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRouteAsync.fulfilled, (state, action) => {
        console.log('routeSlice: createRouteAsync.fulfilled ejecutado');
        console.log('routeSlice: Ruta recibida:', action.payload);
        console.log('routeSlice: Rutas antes de agregar:', state.routes.length);
        state.loading = false;
        state.routes.push(action.payload);
        console.log('routeSlice: Rutas después de agregar:', state.routes.length);
        state.error = null;
      })
      .addCase(createRouteAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al crear la ruta';
      })
      // fetchRoutesAsync
      .addCase(fetchRoutesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoutesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.routes = action.payload;
        state.error = null;
      })
      .addCase(fetchRoutesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar las rutas';
      })
      // deleteRouteAsync
      .addCase(deleteRouteAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRouteAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.routes = state.routes.filter(route => route.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteRouteAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al eliminar la ruta';
      });
  },
});

export const { setSelectedRoute, clearSelectedRoute, clearError } = routeSlice.actions;
export default routeSlice.reducer; 