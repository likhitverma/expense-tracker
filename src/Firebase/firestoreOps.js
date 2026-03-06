// ─── Firestore Operations ───────────────────────────────────────────────────────
import {
  collection,
  doc,
  setDoc,
  updateDoc,
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

// ── Occasions ──────────────────────────────────────────────────────────────────
const occasionsCol = (uid) =>
  collection(db, "expenseTracker", uid, "occasions");
const occasionDoc = (uid, occasionId) =>
  doc(db, "expenseTracker", uid, "occasions", occasionId);
const occasionExpensesCol = (uid, occasionId) =>
  collection(db, "expenseTracker", uid, "occasions", occasionId, "expenses");
const occasionExpenseDoc = (uid, occasionId, expenseId) =>
  doc(db, "expenseTracker", uid, "occasions", occasionId, "expenses", expenseId);

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
      type: data.type ?? "expense",
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

// Update an existing expense document (preserves createdAt).
export async function updateExpense(uid, expense) {
  const { id, ...rest } = expense;
  await updateDoc(expenseDoc(uid, id), rest);
}

// ── Occasion CRUD ──────────────────────────────────────────────────────────────

export async function loadOccasions(uid) {
  const q = query(occasionsCol(uid), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      name: data.name ?? "Unnamed",
      emoji: data.emoji ?? "📦",
      description: data.description ?? "",
      status: data.status ?? "active",
      createdAt: data.createdAt?.toMillis?.() ?? data.createdAt ?? Date.now(),
    };
  });
}

export async function addOccasion(uid, occasion) {
  const { id, ...rest } = occasion;
  await setDoc(occasionDoc(uid, id), { ...rest, createdAt: serverTimestamp() });
}

// Deletes the occasion doc and all its expense sub-documents.
export async function deleteOccasion(uid, occasionId) {
  const snap = await getDocs(occasionExpensesCol(uid, occasionId));
  for (const d of snap.docs) {
    await deleteDoc(d.ref);
  }
  await deleteDoc(occasionDoc(uid, occasionId));
}

// ── Occasion Expense CRUD ──────────────────────────────────────────────────────

export async function loadOccasionExpenses(uid, occasionId) {
  const q = query(occasionExpensesCol(uid, occasionId), orderBy("createdAt", "desc"));
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
      type: data.type ?? "expense",
      createdAt: data.createdAt?.toMillis?.() ?? data.createdAt ?? Date.now(),
    };
  });
}

export async function addOccasionExpense(uid, occasionId, expense) {
  const { id, ...rest } = expense;
  await setDoc(occasionExpenseDoc(uid, occasionId, id), {
    ...rest,
    createdAt: serverTimestamp(),
  });
}

export async function deleteOccasionExpense(uid, occasionId, expenseId) {
  await deleteDoc(occasionExpenseDoc(uid, occasionId, expenseId));
}

// Update an existing occasion expense (preserves createdAt).
export async function updateOccasionExpense(uid, occasionId, expense) {
  const { id, ...rest } = expense;
  await updateDoc(occasionExpenseDoc(uid, occasionId, id), rest);
}
