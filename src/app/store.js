// src/app/store.js
import { configureStore } from "@reduxjs/toolkit";
import groupsReducer from "../features/groups/groupsSlice";
import { loadState, saveState } from "./localStorage";

const preloadedState = loadState();

export const store = configureStore({
  reducer: {
    groups: groupsReducer,
  },
  preloadedState,
});

// Guardar en localStorage cuando cambie el estado
store.subscribe(() => {
  saveState(store.getState());
});
