// ─── Firestore Operations ───────────────────────────────────────────────────────
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebaseConfig"; 
// ── Expenses ───────────────────────────────────────────────────────────────────
const expensesCol = (uid) => collection(db, "expenseTracker", uid, "expenses");
const expenseDoc = (uid, expenseId) =>
  doc(db, "expenseTracker", uid, "expenses", expenseId);

// Load all expenses for a user, sorted by createdAt descending.
export async function loadExpenses(uid) {
  const q = query(expensesCol(uid), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      amount: data.amount ?? 0,
      time: data.time ?? "00:00",
      date: data.date ?? "",
      description: data.description ?? "",
      category: data.category ?? "other",
      createdAt: data.createdAt?.toMillis?.() ?? data.createdAt ?? Date.now(),
    };
  });
}

// Add a new expense document.
export async function addExpense(uid, expense) {
  const { id, ...rest } = expense;
  await setDoc(expenseDoc(uid, id), {
    ...rest,
    createdAt: serverTimestamp(),
  });
}

// Add multiple expense documents in one call.
export async function addAllExpenses(uid, expenses) {
  for (const expense of expenses) {
    const { id, ...rest } = expense;
    await setDoc(expenseDoc(uid, id), {
      ...rest,
      createdAt: serverTimestamp(),
    });
  }
}

// Delete an expense document.
export async function deleteExpense(uid, expenseId) {
  await deleteDoc(expenseDoc(uid, expenseId));
}
