import { useState, useEffect, useRef } from "react";
import { THEME_ICONS, THEME_LABELS } from "./constants";

export default function Header({
  user,
  onLogout,
  theme,
  onCycleTheme,
  onDownload,
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showUserMenu) return;
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu]);

  return (
    <header className="et-header">
      {/* ── User menu (left) ── */}
      <div className="et-user-menu" ref={menuRef}>
        <button
          className={`et-icon-btn et-icon-btn--avatar${showUserMenu ? " et-icon-btn--active" : ""}`}
          onClick={() => setShowUserMenu((v) => !v)}
          title="Account"
        >
          {showUserMenu ? (
            <i className="fa fa-bars" />
          ) : (
            <img
              src="./images/logo.png"
              alt=""
              className="et-user-avatar"
              referrerPolicy="no-referrer"
            />
          )}
        </button>

        {showUserMenu && (
          <div className="et-user-dropdown">
            <div className="et-user-dropdown-info">
              <div>
                {user?.photoURL && (
                  <img
                    src={user.photoURL}
                    alt=""
                    className="et-user-avatar et-user-avatar--lg"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
              <div style={{ marginLeft: "10px" }}>
                <div className="et-user-display-name">{user?.displayName}</div>
                <div className="et-user-email">{user?.email}</div>
              </div>
            </div>
            <div className="et-user-divider" />
            <button
              className="et-logout-item"
              onClick={() => {
                setShowUserMenu(false);
                onLogout();
              }}
            >
              <i className="fa fa-right-from-bracket" />
              Sign out
            </button>
          </div>
        )}
      </div>

      {/* ── App title ── */}
      <div className="et-header-title">
        {/* <span className="et-header-emoji">
          
        </span> */}
        <div>
          <h1>Expense Tracker</h1>
          <span className="et-header-sub">{user?.displayName}</span>
        </div>
      </div>

      {/* ── Actions (right) ── */}
      <div className="et-header-actions">
        <button
          className="et-icon-btn et-theme-btn"
          onClick={onCycleTheme}
          title={`Theme: ${THEME_LABELS[theme]}`}
        >
          <span className="et-theme-icon">{THEME_ICONS[theme]}</span>
          <span className="et-theme-label">{THEME_LABELS[theme]}</span>
        </button>

        <button
          className="et-icon-btn"
          onClick={onDownload}
          title="Export expenses"
        >
          <i className="fa fa-download" />
        </button>
      </div>
    </header>
  );
}
