// src/app/groupsApi.js
import { db } from "../firebase";
import { runTransaction } from "firebase/firestore";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc,
} from "firebase/firestore";

// Colección principal
const groupsCol = collection(db, "groups");

// Escuchar grupos en tiempo real
export function listenGroups(callback) {
  // ✅ Ordenamos por createdAtMs (estable, nunca es null)
  const q = query(groupsCol, orderBy("createdAtMs", "desc"));

  const unsub = onSnapshot(q, (snap) => {
    const groups = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        members: Array.isArray(data.members) ? data.members : [],
        expenses: Array.isArray(data.expenses) ? data.expenses : [],
        isSettled: !!data.isSettled,
        type: data.type ?? "other",
        createdAtMs: Number(data.createdAtMs) || 0,
      };
    });

    callback(groups);
  });

  return unsub;
}

// Crear un grupo nuevo
export async function createGroup({ name, type = "other" }) {
  const cleanName = (name || "").trim();
  if (!cleanName) throw new Error("Nombre de grupo vacío");

  const now = Date.now();

  const docRef = await addDoc(groupsCol, {
    name: cleanName,
    type,
    createdAt: serverTimestamp(), // (para referencia humana en Firestore)
    createdAtMs: now,            // ✅ para orden estable
    members: [],
    expenses: [],
    isSettled: false,
  });

  return docRef.id;
}

// =========================
// MEMBERS
// =========================

// Agregar miembro
export async function addMember(groupId, memberName) {
  const clean = (memberName || "").trim();
  if (!clean) return;

  const ref = doc(db, "groups", groupId);
  await updateDoc(ref, {
    members: arrayUnion(clean),
  });
}

// Quitar miembro
export async function removeMember(groupId, memberName) {
  const clean = (memberName || "").trim();
  if (!clean) return;

  const ref = doc(db, "groups", groupId);
  await updateDoc(ref, {
    members: arrayRemove(clean),
  });
}

// =========================
// EXPENSES
// =========================

export async function addExpense(groupId, expense) {
  const description = (expense?.description || "").trim();
  const paidBy = (expense?.paidBy || "").trim();

  const splitBetween = Array.isArray(expense?.splitBetween)
    ? expense.splitBetween.map((x) => String(x).trim()).filter(Boolean)
    : [];

  const amountNum = Number(expense?.amount);

  if (!description) throw new Error("Descripción vacía");
  if (!paidBy) throw new Error("Falta quién pagó");
  if (!Number.isFinite(amountNum) || amountNum <= 0)
    throw new Error("Monto inválido");
  if (splitBetween.length === 0) throw new Error("Split vacío");

  const ref = doc(db, "groups", groupId);

  const payload = {
    id:
      globalThis.crypto?.randomUUID?.() ??
      `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    description,
    amount: amountNum,
    paidBy,
    splitBetween,
    createdAt: new Date().toISOString(),
  };

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("Grupo no existe");

    const data = snap.data();
    if (data?.isSettled) throw new Error("Grupo liquidado");

    const prev = Array.isArray(data?.expenses) ? data.expenses : [];

    // (Opcional) evita duplicado por id (por si se reintenta)
    const already = prev.some((e) => String(e?.id) === String(payload.id));
    const next = already ? prev : [...prev, payload];

    tx.update(ref, { expenses: next });
  });

  return payload.id;
}

/**
 * ✅ Importante:
 * No usamos arrayRemove(expenseObj) porque tiene que ser EXACTAMENTE igual al objeto guardado.
 * Mejor borramos por ID (seguro).
 */
export async function removeExpense(groupId, expenseOrId) {
  const expenseId =
    typeof expenseOrId === "string" ? expenseOrId : expenseOrId?.id;

  if (!expenseId) throw new Error("Falta expenseId");

  const ref = doc(db, "groups", groupId);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("Grupo no existe");

    const data = snap.data();
    const prev = Array.isArray(data?.expenses) ? data.expenses : [];
    const next = prev.filter((e) => String(e?.id) !== String(expenseId));

    tx.update(ref, { expenses: next });
  });
}

// =========================
// SETTLE / REOPEN
// =========================

export async function settleGroupFS(groupId) {
  const ref = doc(db, "groups", groupId);
  await updateDoc(ref, { isSettled: true });
}

export async function reopenGroupFS(groupId) {
  const ref = doc(db, "groups", groupId);
  await updateDoc(ref, { isSettled: false });
}

// =========================
// DELETE GROUP
// =========================

export async function deleteGroup(groupId) {
  const ref = doc(db, "groups", groupId);
  await deleteDoc(ref);
}
