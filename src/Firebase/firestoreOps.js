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
  where,
  limit,
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

// ── User Search ────────────────────────────────────────────────────────────

// Prefix search on nameLower field — returns up to 8 matching users.
export async function searchUsers(queryStr) {
  if (!queryStr.trim()) return [];
  const q = queryStr.toLowerCase();
  const snap = await getDocs(
    query(
      collection(db, "users"),
      where("nameLower", ">=", q),
      where("nameLower", "<=", q + "\uf8ff"),
      limit(8),
    ),
  );
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      uid: d.id,
      displayName: data.displayName ?? "Unknown",
      email: data.email ?? "",
      photoURL: data.photoURL ?? null,
    };
  });
}

// ── Group CRUD (top-level: groups/{groupId}) ───────────────────────────────

const groupsTopCol = () => collection(db, "groups");
const groupTopDoc = (groupId) => doc(db, "groups", groupId);
const groupExpensesCol = (groupId) =>
  collection(db, "groups", groupId, "expenses");
const groupExpenseDoc = (groupId, expenseId) =>
  doc(db, "groups", groupId, "expenses", expenseId);

// Load all groups where the user is a member (uses memberUIDs array-contains).
// Sorted client-side to avoid needing a composite index.
export async function loadGroups(uid) {
  const snap = await getDocs(
    query(
      groupsTopCol(),
      where("memberUIDs", "array-contains", uid),
    ),
  );
  return snap.docs
    .map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name ?? "Unnamed",
        emoji: data.emoji ?? "👥",
        description: data.description ?? "",
        members: data.members ?? [],
        memberUIDs: data.memberUIDs ?? [],
        adminUID: data.adminUID ?? "",
        createdAt: data.createdAt?.toMillis?.() ?? data.createdAt ?? Date.now(),
      };
    })
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function addGroup(group) {
  const { id, ...rest } = group;
  await setDoc(groupTopDoc(id), { ...rest, createdAt: serverTimestamp() });
}

export async function updateGroup(groupId, updates) {
  await updateDoc(groupTopDoc(groupId), updates);
}

// Deletes the group doc and all its expense sub-documents.
export async function deleteGroup(groupId) {
  const snap = await getDocs(groupExpensesCol(groupId));
  for (const d of snap.docs) {
    await deleteDoc(d.ref);
  }
  await deleteDoc(groupTopDoc(groupId));
}

// ── Group Expense CRUD ─────────────────────────────────────────────────────

export async function loadGroupExpenses(groupId) {
  const q = query(groupExpensesCol(groupId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      description: data.description ?? "",
      amount: data.amount ?? 0,
      paidBy: data.paidBy ?? "",
      splitAmong: data.splitAmong ?? [],
      category: data.category ?? "other",
      date: data.date ?? "",
      time: data.time ?? "00:00",
      addedBy: data.addedBy ?? "",
      createdAt: data.createdAt?.toMillis?.() ?? data.createdAt ?? Date.now(),
    };
  });
}

export async function addGroupExpense(groupId, expense) {
  const { id, ...rest } = expense;
  await setDoc(groupExpenseDoc(groupId, id), {
    ...rest,
    createdAt: serverTimestamp(),
  });
}

export async function updateGroupExpense(groupId, expense) {
  const { id, ...rest } = expense;
  await updateDoc(groupExpenseDoc(groupId, id), rest);
}

export async function deleteGroupExpense(groupId, expenseId) {
  await deleteDoc(groupExpenseDoc(groupId, expenseId));
}
