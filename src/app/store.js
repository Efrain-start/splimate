// src/app/store.js
import { configureStore } from "@reduxjs/toolkit";
import groupsReducer from "../features/groups/groupsSlice";
import { loadState, saveState } from "./localStorage";
import authReducer from "../features/auth/authSlice";

const preloadedState = loadState();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    groups: groupsReducer,
  },
  preloadedState,
});

// Guardar en localStorage cuando cambie el estado
store.subscribe(() => {
  saveState(store.getState());
});
