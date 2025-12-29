import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [],
};

const groupsSlice = createSlice({
  name: "groups",
  initialState,
  reducers: {
    addGroup: (state, action) => {
      const name = (action.payload?.name ?? "").trim();
      const type = action.payload?.type ?? "other"; // ✅

      if (!name) return;

      state.list.push({
        id: Date.now().toString(), // mejor string para rutas
        name,
        type, // ✅ GUARDA EL TIPO
        members: [],
        expenses: [],
        isSettled: false,
      });
    },

    addMemberToGroup: (state, action) => {
      // action.payload: { groupId, memberName }
      const { groupId, memberName } = action.payload;

      const group = state.list.find((g) => String(g.id) === String(groupId));
      if (!group) return;

      const clean = memberName.trim();
      if (!clean) return;

      // evitar duplicados
      const exists = group.members.some(
        (m) => m.toLowerCase() === clean.toLowerCase()
      );
      if (exists) return;

      group.members.push(clean);
    },

    removeMemberFromGroup: (state, action) => {
      // action.payload: { groupId, memberName }
      const { groupId, memberName } = action.payload;

      const group = state.list.find((g) => String(g.id) === String(groupId));
      if (!group) return;

      group.members = group.members.filter((m) => m !== memberName);
    },

    addExpenseToGroup: (state, action) => {
      // payload: { groupId, description, amount, paidBy, splitBetween }
      const { groupId, description, amount, paidBy, splitBetween } =
        action.payload;

      const group = state.list.find((g) => String(g.id) === String(groupId));
      if (!group) return;

      // 🚫 Si ya está liquidado, no permitimos agregar gastos
      if (group.isSettled) return;

      const cleanDesc = (description ?? "").trim();
      const cleanPaidBy = (paidBy ?? "").trim();
      const cleanSplit = Array.isArray(splitBetween) ? splitBetween : [];

      const numAmount = Number(amount);
      if (!cleanDesc) return;
      if (!cleanPaidBy) return;
      if (!Number.isFinite(numAmount) || numAmount <= 0) return;
      if (cleanSplit.length === 0) return;

      group.expenses.push({
        id: Date.now().toString(),
        description: cleanDesc,
        amount: numAmount,
        paidBy: cleanPaidBy,
        splitBetween: cleanSplit,
        createdAt: new Date().toISOString(),
      });
    },

    removeExpenseFromGroup: (state, action) => {
      // payload: { groupId, expenseId }
      const { groupId, expenseId } = action.payload;

      const group = state.list.find((g) => String(g.id) === String(groupId));
      if (!group) return;

      group.expenses = group.expenses.filter((e) => e.id !== expenseId);
    },

    // ✅ NUEVO: Liquidar grupo
    settleGroup: (state, action) => {
      const { groupId } = action.payload;

      const group = state.list.find((g) => String(g.id) === String(groupId));
      if (!group) return;

      group.isSettled = true;
    },

    // ✅ OPCIONAL: Reabrir grupo (por si se equivocan)
    reopenGroup: (state, action) => {
      const { groupId } = action.payload;

      const group = state.list.find((g) => String(g.id) === String(groupId));
      if (!group) return;

      group.isSettled = false;
    },

    // ✅ NUEVO: Eliminar grupo (solo borra ese grupo)
    removeGroup: (state, action) => {
      const { groupId } = action.payload;
      state.list = state.list.filter((g) => String(g.id) !== String(groupId));
    },
  },
});

export const {
  addGroup,
  addMemberToGroup,
  removeMemberFromGroup,
  addExpenseToGroup,
  removeExpenseFromGroup,
  settleGroup, // ✅ NUEVO
  reopenGroup, // ✅ OPCIONAL
  removeGroup, // ✅ NUEVO
} = groupsSlice.actions;

export default groupsSlice.reducer;
