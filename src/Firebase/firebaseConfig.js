import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID,
};

// ── Initialize Firebase ────────────────────────────────────────────────────────
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Persist the user session in localStorage until they explicitly log out.
// Without this, closing the tab signs the user out on some mobile browsers.
setPersistence(auth, browserLocalPersistence).catch(() => {});

// Re-export so App.js doesn't need a second firebase/auth import
export { onAuthStateChanged, getRedirectResult };

// ── Auth flow detection ────────────────────────────────────────────────────────
// Both iOS Safari and Android browsers block signInWithPopup reliably.
// Use redirect for any mobile device; popup only on desktop.
const isMobile =
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) &&
  !("MSStream" in window);

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
  if (isMobile) {
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
