import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAOrHbPfFll8T0jzxIYfokqV2ZTrX0rQ-c",
  authDomain: "expensetracker-cs.firebaseapp.com",
  projectId: "expensetracker-cs",
  storageBucket: "expensetracker-cs.firebasestorage.app",
  messagingSenderId: "808031790552",
  appId: "1:808031790552:web:57ced9f4a460ff078abead",
  measurementId: "G-HY28RPCRM8"
};

// ── Initialize Firebase ────────────────────────────────────────────────────────
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Persist the user session in localStorage until they explicitly log out.
// Without this, closing the tab signs the user out on some mobile browsers.
setPersistence(auth, browserLocalPersistence).catch(() => {});

// Re-export onAuthStateChanged so App.js doesn't need a second firebase/auth import
export { onAuthStateChanged };

// ── Auth flow detection ────────────────────────────────────────────────────────
// iOS Safari blocks signInWithPopup (ITP) → use redirect on iOS only.
// Android Chrome handles popups fine; signInWithRedirect on Android has known
// Chrome Custom Tab issues where auth state doesn't restore after redirect.
const isIOS = /iPhone|iPad/i.test(navigator.userAgent) && !("MSStream" in window);

// ── Firestore: save user profile on first sign-in ─────────────────────────────
export const saveUserToFirestore = async (user) => {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || "Anonymous",
    });
  }
};

// ── Firestore: write default settings for a new user ──────────────────────────
// Uses merge:true so it never overwrites existing data for returning users.
export const saveDefaultSettingsToFireStore = async (user) => {
  const userRef = doc(db, "expenseTracker", user.uid);
  await setDoc(
    userRef,
    {
      uid: user.uid,
      email: user.email,
      isDarkMode: true,
      theme: "monokai",
      currentNoteIndex: 0,
    },
    { merge: true },
  );
};

// ── Google sign-in ─────────────────────────────────────────────────────────────
// Desktop → popup (instant UX).
// Mobile  → redirect (popup is blocked on iOS/Android browsers).
// After redirect, App.js handles getRedirectResult() on mount.
export const signInWithGoogle = async () => {
  if (isIOS) {
    await signInWithRedirect(auth, googleProvider);
    return null; // page navigates away; result resolved via getRedirectResult
  }
  const result = await signInWithPopup(auth, googleProvider);
  await saveUserToFirestore(result.user);
  await saveDefaultSettingsToFireStore(result.user);
  return result.user;
};

// ── Email sign-in ──────────────────────────────────────────────────────────────
// Throws "auth/email-not-verified" if the user hasn't confirmed their email yet.
export const loginWithEmail = async (email, password) => {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  if (!user.emailVerified) {
    // Sign out immediately so a non-verified session is never persisted
    await signOut(auth);
    const err = new Error("Please verify your email before signing in.");
    err.code = "auth/email-not-verified";
    throw err;
  }
  return user;
};

// ── Email registration ─────────────────────────────────────────────────────────
// Creates the account, sends a verification email, and saves the user profile.
// The user must verify their email before they can sign in.
export const registerWithEmail = async (email, password, displayName) => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) await updateProfile(user, { displayName });
  await sendEmailVerification(user);
  await saveUserToFirestore(user);
  await saveDefaultSettingsToFireStore(user);
  // Sign out after registration so the user is forced to verify before accessing the app
  await signOut(auth);
  return user;
};

// ── Sign out ───────────────────────────────────────────────────────────────────
export const logout = async () => {
  await signOut(auth);
};
