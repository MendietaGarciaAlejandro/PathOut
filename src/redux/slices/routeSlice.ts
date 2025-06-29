import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Route } from '../../types/route';
import { saveRoute, getRoutes, deleteRoute } from '../../services/dbService.web';

export const createRouteAsync = createAsyncThunk('route/create', async (route: Route) => {
  try {
    await saveRoute(route);
    return route;
  } catch (error) {
    console.error('❌ createRouteAsync: Error al crear ruta:', error);
    throw error;
  }
});

export const fetchRoutesAsync = createAsyncThunk('route/fetch', async () => {
  try {
    const routes = await getRoutes();
    return routes;
  } catch (error) {
    console.error('❌ fetchRoutesAsync: Error al cargar rutas:', error);
    throw error;
  }
});

export const deleteRouteAsync = createAsyncThunk('route/delete', async (routeId: number) => {
  try {
    await deleteRoute(routeId);
    return routeId;
  } catch (error) {
    console.error('❌ deleteRouteAsync: Error al eliminar ruta:', error);
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
        state.loading = false;
        state.routes.push(action.payload);
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