import { CATEGORIES, formatCurrency, formatTime, formatShortDate } from "./constants";

export default function ConfirmDeleteModal({ expense, onConfirm, onCancel }) {
  if (!expense) return null;

  const cat =
    CATEGORIES.find((c) => c.id === expense.category) ||
    CATEGORIES[CATEGORIES.length - 1];

  return (
    <div className="et-modal-overlay" onClick={onCancel}>
      <div
        className="et-modal et-modal--confirm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="et-confirm-body">
          <div className="et-confirm-icon-wrap">🗑️</div>
          <h3 className="et-confirm-title">Delete Expense?</h3>
          <div className="et-confirm-detail">
            <span className="et-confirm-cat-icon">{cat.icon}</span>
            <div>
              <div className="et-confirm-cat-name">{cat.label}</div>
              <div className="et-confirm-amount">
                {formatCurrency(expense.amount)}
              </div>
              {expense.description && (
                <div className="et-confirm-desc">"{expense.description}"</div>
              )}
              <div className="et-confirm-time">
                <i className="fa fa-clock" /> {formatTime(expense.time)} ·{" "}
                {formatShortDate(expense.date)}
              </div>
            </div>
          </div>
          <p className="et-confirm-warn">This action cannot be undone.</p>
        </div>

        <div className="et-modal-footer">
          <button className="et-btn et-btn--cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="et-btn et-btn--danger" onClick={onConfirm}>
            <i className="fa fa-trash" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
