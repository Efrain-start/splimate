// src/features/auth/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,       // { uid, name, email, photoURL }
  ready: false,     // para saber que ya checamos authState
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setReady: (state, action) => {
      state.ready = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
  },
});

export const { setUser, setReady, clearUser } = authSlice.actions;
export default authSlice.reducer;
