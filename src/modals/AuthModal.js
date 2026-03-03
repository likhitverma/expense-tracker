import "./AuthModal.css";
import { useState } from "react";
import {
  signInWithGoogle,
  loginWithEmail,
  registerWithEmail,
} from "../Firebase/firebaseConfig";
import featureFlags from "../appConfig";

// ─── Friendly messages for Firebase Auth error codes ───────────────────────────
function authErrorMsg(code) {
  const map = {
    "auth/invalid-credential":       "Incorrect email or password.",
    "auth/user-not-found":           "No account found with this email.",
    "auth/wrong-password":           "Incorrect password.",
    "auth/email-already-in-use":     "An account with this email already exists.",
    "auth/weak-password":            "Password must be at least 6 characters.",
    "auth/invalid-email":            "Please enter a valid email address.",
    "auth/popup-blocked":            "Popup blocked — please allow popups for this site.",
    "auth/popup-closed-by-user":     "Sign-in was cancelled.",
    "auth/too-many-requests":        "Too many attempts — wait a moment and try again.",
    "auth/network-request-failed":   "Network error — check your connection.",
    "auth/email-not-verified":       "Please verify your email first. Check your inbox.",
  };
  return map[code] || "Something went wrong. Please try again.";
}

// ─── Auth Modal (Sign In / Register) ───────────────────────────────────────────
// isGate=true → shown as the full-page auth wall; hides Close & Cancel buttons
//               and prevents overlay-click from dismissing it.
export default function AuthModal({ onClose, toast, isGate = false }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Google ──────────────────────────────────────────────────────────────────
  async function handleGoogle() {
    if (!featureFlags.ENABLE_GOOGLE_AUTH) return;
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      // signInWithGoogle returns null on mobile (redirect flow) — the page navigates away.
      // On desktop it returns the user object after the popup closes.
      if (user) {
        toast(`Welcome, ${user.displayName || user.email}! 🎉`, "success");
        onClose();
      }
      // On mobile: page is redirecting — do nothing, App.js handles the result.
    } catch (err) {
      toast(authErrorMsg(err.code), "error");
      setLoading(false);
    }
  }

  // ── Email ───────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!featureFlags.ENABLE_EMAIL_AUTH) return;
    if (!email.trim() || !pass.trim()) {
      toast("Please fill in all fields", "error");
      return;
    }
    setLoading(true);
    try {
      if (mode === "register") {
        await registerWithEmail(email, pass, name.trim() || undefined);
        toast(
          "Account created! Check your inbox to verify your email before signing in.",
          "success",
        );
        // Switch to login mode so the user can sign in after verifying
        setMode("login");
        setPass("");
      } else {
        const user = await loginWithEmail(email, pass);
        toast(`Welcome back, ${user.displayName || user.email}!`, "success");
        onClose();
      }
    } catch (err) {
      toast(authErrorMsg(err.code), "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="overlay"
      onClick={(e) => !isGate && e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modal-header">
          <div className="modal-icon" style={{ background: "#EEF2FF" }}>🔐</div>
          <div className="modal-title">
            {mode === "login" ? "Sign in" : "Create account"}
          </div>
          {!isGate && (
            <button className="modal-close" onClick={onClose} disabled={loading}>
              <i className="fa fa-xmark" />
            </button>
          )}
        </div>

        {/* Google */}
        {featureFlags.ENABLE_GOOGLE_AUTH && (
          <button className="btn-google" onClick={handleGoogle} disabled={loading}>
            <svg viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            {loading ? "Connecting…" : "Continue with Google"}
          </button>
        )}

        {featureFlags.ENABLE_EMAIL_AUTH && featureFlags.ENABLE_GOOGLE_AUTH && (
          <div className="divider-or">or with email</div>
        )}

        {/* Email form */}
        {featureFlags.ENABLE_EMAIL_AUTH && (
          <>
            {mode === "register" && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  disabled={loading}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="Min. 6 characters"
                disabled={loading}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            <div className="modal-actions">
              {!isGate && (
                <button className="btn btn-ghost" onClick={onClose} disabled={loading}>
                  Cancel
                </button>
              )}
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <><i className="fa fa-spinner fa-spin" /> Please wait…</>
                ) : mode === "login" ? (
                  <><i className="fa fa-arrow-right-to-bracket" /> Sign in</>
                ) : (
                  <><i className="fa fa-user-plus" /> Create Account</>
                )}
              </button>
            </div>

            <div className="auth-toggle">
              {mode === "login" ? (
                <>No account?{" "}
                  <button onClick={() => setMode("register")} disabled={loading}>
                    Create one free
                  </button>
                </>
              ) : (
                <>Already registered?{" "}
                  <button onClick={() => setMode("login")} disabled={loading}>
                    Sign in
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
