import { createSlice } from '@reduxjs/toolkit';

const downloadSlice = createSlice({
  name: 'download',
  initialState: {
    progress: 0,
    status: 'idle',
  },
  reducers: {
    // Acciones a implementar
  },
});

export default downloadSlice.reducer;
