import { createSlice } from '@reduxjs/toolkit';

const poiSlice = createSlice({
  name: 'poi',
  initialState: {
    pois: [],
    loading: false,
    error: null,
  },
  reducers: {
    // Acciones a implementar
  },
});

export default poiSlice.reducer;
