// src/app/localStorage.js

const KEY = "splitmate_state_v1";

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return undefined; // si no existe, Redux usa el initialState normal
    return JSON.parse(raw);
  } catch (e) {
    console.warn("loadState error", e);
    return undefined;
  }
}

export function saveState(state) {
  try {
    // Guardamos SOLO lo necesario (para no meter basura)
    const toPersist = {
      groups: state.groups,
    };
    localStorage.setItem(KEY, JSON.stringify(toPersist));
  } catch (e) {
    console.warn("saveState error", e);
  }
}
