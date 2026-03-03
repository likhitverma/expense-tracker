import { THEME_ICONS, THEME_LABELS } from "./constants";

export default function Header({ user, onLogout, theme, onCycleTheme, onDownload }) {
  return (
    <header className="et-header">
      <button className="et-icon-btn" onClick={onLogout} title="Sign out">
        <i className="fa fa-right-from-bracket" />
      </button>

      <div className="et-header-title">
        <span className="et-header-emoji">💰</span>
        <div>
          <h1>Expense Tracker</h1>
          <span className="et-header-sub">{user?.displayName}</span>
        </div>
      </div>

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
