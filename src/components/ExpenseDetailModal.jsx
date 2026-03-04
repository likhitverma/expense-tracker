import { CATEGORIES, formatCurrency, formatTime, formatDisplayDate } from "./constants";

export default function ExpenseDetailModal({ expense, onDelete, onClose }) {
  if (!expense) return null;

  const cat =
    CATEGORIES.find((c) => c.id === expense.category) ||
    CATEGORIES[CATEGORIES.length - 1];

  return (
    <div className="et-modal-overlay" onClick={onClose}>
      <div
        className="et-modal et-modal--detail"
        onClick={(e) => e.stopPropagation()}
        style={{ "--cat-color": cat.color }}
      >
        {/* ── Close button ── */}
        <div className="et-modal-header">
          <div className="et-modal-title-wrap">
            <span>{cat.icon}</span>
            <h2>Expense Details</h2>
          </div>
          <button className="et-modal-close" onClick={onClose}>
            <i className="fa fa-xmark" />
          </button>
        </div>

        {/* ── Amount hero ── */}
        <div className="et-detail-hero" style={{ borderColor: cat.color }}>
          <div className="et-detail-cat-icon">{cat.icon}</div>
          <div className="et-detail-amount">{formatCurrency(expense.amount)}</div>
          <div className="et-detail-cat-label">{cat.label}</div>
        </div>

        {/* ── Info rows ── */}
        <div className="et-detail-rows">
          {expense.description && (
            <div className="et-detail-row">
              <span className="et-detail-row-icon">
                <i className="fa fa-note-sticky" />
              </span>
              <div className="et-detail-row-container">
                <div className="et-detail-row-label">Description</div>
                <div className="et-detail-row-value">{expense.description}</div>
              </div>
            </div>
          )}

          <div className="et-detail-row">
            <span className="et-detail-row-icon">
              <i className="fa fa-calendar" />
            </span>
            <div>
              <div className="et-detail-row-label">Date</div>
              <div className="et-detail-row-value">{formatDisplayDate(expense.date)}</div>
            </div>
          </div>

          <div className="et-detail-row">
            <span className="et-detail-row-icon">
              <i className="fa fa-clock" />
            </span>
            <div>
              <div className="et-detail-row-label">Time</div>
              <div className="et-detail-row-value">{formatTime(expense.time)}</div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="et-modal-footer">
          <button className="et-btn et-btn--cancel" onClick={onClose}>
            Close
          </button>
          {/* <button
            className="et-btn et-btn--danger"
            onClick={() => {
              onClose();
              onDelete(expense);
            }}
          >
            <i className="fa fa-trash" /> Delete
          </button> */}
        </div>
      </div>
    </div>
  );
}
