// ─── Confirm / Danger Modal ─────────────────────────────────────────────────────
export default function ConfirmModal({ title, message, onConfirm, onClose, danger, icon }) {
  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <div className="modal-icon" style={{ background: danger ? "#FEF2F2" : "#EEF2FF" }}>
            {icon || "⚠️"}
          </div>
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={onClose}>
            <i className="fa fa-xmark" />
          </button>
        </div>

        <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>
          {message}
        </p>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className={`btn ${danger ? "btn-danger" : "btn-primary"}`}
            onClick={() => { onConfirm(); onClose(); }}
          >
            {danger ? (
              <><i className="fa fa-trash" /> Delete</>
            ) : (
              "Confirm"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
