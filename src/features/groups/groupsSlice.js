// features/groups/groupsSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { listenGroups, createGroup } from "../../app/groupsApi";

const initialState = {
  list: [],
};

const groupsSlice = createSlice({
  name: "groups",
  initialState,
  reducers: {
    setGroups: (state, action) => {
      state.list = action.payload || [];
    },
    clearGroups: (state) => {
      state.list = [];
    },
  },
});

export const { setGroups, clearGroups } = groupsSlice.actions;
export default groupsSlice.reducer;

// 👇 FIRESTORE LISTENER → REDUX
let unsubscribeGroups = null;

export const startGroupsListener = () => (dispatch) => {
  if (unsubscribeGroups) return;

  unsubscribeGroups = listenGroups((groups) => {
    dispatch(setGroups(groups));
  });
};

// (opcional) para detener el listener
export const stopGroupsListener = () => (dispatch) => {
  if (unsubscribeGroups) {
    unsubscribeGroups();
    unsubscribeGroups = null;
  }
  dispatch(clearGroups());
};

// Crear grupo (Firestore)
export const addGroup = ({ name, type = "other" }) => async () => {
  const cleanName = (name ?? "").trim();
  if (!cleanName) return;

  await createGroup({ name: cleanName, type });
};
