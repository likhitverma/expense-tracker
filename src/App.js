import { useState, useEffect, useCallback } from "react";
import {
  auth,
  onAuthStateChanged,
  logout,
  getRedirectResult,
  saveUserToFirestore,
  saveDefaultSettingsToFireStore,
} from "./Firebase/firebaseConfig";
import ExpenseTracker from "./components/ExpenseTracker";
import AuthModal from "./modals/AuthModal";
import "./styles/global.css";
import "./styles/Modal.css";

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  // ── Handle Google redirect result (mobile sign-in) ───────────────────────
  // On mobile, signInWithGoogle triggers a page redirect. When the page loads
  // back, getRedirectResult resolves the pending credential and saves the user.
  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          await saveUserToFirestore(result.user);
          await saveDefaultSettingsToFireStore(result.user);
          // toast is stable (useCallback with []), safe to call here
          toast(`Welcome, ${result.user.displayName || result.user.email}! 🎉`, "success");
        }
      })
      .catch((err) => {
        // Only show meaningful errors — null result is normal on non-redirect loads
        if (err?.code && err.code !== "auth/null-user" && err.code !== "auth/no-current-user") {
          toast(`Google sign-in failed: ${err.message || err.code}`, "error");
        }
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Listen to Firebase auth state ────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setUser(
        fbUser
          ? {
              uid: fbUser.uid,
              displayName: fbUser.displayName || fbUser.email?.split("@")[0],
              email: fbUser.email,
              photoURL: fbUser.photoURL,
            }
          : null,
      );
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // ── Toast helper ─────────────────────────────────────────────────────────
  const toast = useCallback((msg, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3500,
    );
  }, []);

  // ── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      toast("Signed out successfully.", "success");
    } catch {
      toast("Failed to sign out. Please try again.", "error");
    }
  }, [toast]);

  // ── Auth resolving ───────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="app-loading">
        <div className="app-spinner" />
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div className="App">
      {/* ── Toast notifications ── */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.type}`}>
            {t.msg}
          </div>
        ))}
      </div>

      {/* ── Auth gate: show modal until signed in ── */}
      {!user ? (
        <AuthModal isGate onClose={() => {}} toast={toast} />
      ) : (
        <ExpenseTracker user={user} onLogout={handleLogout} toast={toast} />
      )}
    </div>
  );
}

export default App;
