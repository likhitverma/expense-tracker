import { CATEGORIES, CURRENCY } from "./constants";

export default function AddExpenseModal({
  onClose,
  form,
  setForm,
  formErrors,
  setFormErrors,
  selectedDate,
  onDateChange,
  onSubmit,
  savingExpense,
}) {
  return (
    <div className="et-modal-overlay" onClick={onClose}>
      <div className="et-modal" onClick={(e) => e.stopPropagation()}>
        <div className="et-modal-header">
          <div className="et-modal-title-wrap">
            <span>➕</span>
            <h2>Add Expense</h2>
          </div>
          <button className="et-modal-close" onClick={onClose}>
            <i className="fa fa-xmark" />
          </button>
        </div>

        <div className="et-modal-body">
          {/* Amount */}
          <div className="et-form-group et-form-group--large">
            <label htmlFor="et-amount">Amount</label>
            <div className="et-amount-wrap">
              <span className="et-currency-prefix">{CURRENCY}</span>
              <input
                id="et-amount"
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(e) => {
                  setForm((f) => ({ ...f, amount: e.target.value }));
                  setFormErrors((fe) => ({ ...fe, amount: null }));
                }}
                placeholder="0.00"
                className={`et-input et-amount-input${formErrors.amount ? " et-input--error" : ""}`}
                autoFocus
              />
            </div>
            {formErrors.amount && (
              <span className="et-field-error">
                <i className="fa fa-circle-exclamation" /> {formErrors.amount}
              </span>
            )}
          </div>

          {/* Category */}
          <div className="et-form-group">
            <label>Category</label>
            <div className="et-cat-selector">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`et-cat-btn${form.category === cat.id ? " et-cat-btn--selected" : ""}`}
                  style={{ "--cat-color": cat.color }}
                  onClick={() => setForm((f) => ({ ...f, category: cat.id }))}
                >
                  <span className="et-cat-btn-icon">{cat.icon}</span>
                  <span className="et-cat-btn-label">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Time + Date */}
          <div className="et-form-row">
            <div className="et-form-group">
              <label htmlFor="et-time">Time</label>
              <input
                id="et-time"
                type="time"
                value={form.time}
                onChange={(e) => {
                  setForm((f) => ({ ...f, time: e.target.value }));
                  setFormErrors((fe) => ({ ...fe, time: null }));
                }}
                className={`et-input${formErrors.time ? " et-input--error" : ""}`}
              />
              {formErrors.time && (
                <span className="et-field-error">
                  <i className="fa fa-circle-exclamation" /> {formErrors.time}
                </span>
              )}
            </div>
            <div className="et-form-group">
              <label>Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="et-input"
              />
            </div>
          </div>

          {/* Description */}
          <div className="et-form-group">
            <label htmlFor="et-desc">
              Description <span className="et-label-opt">(optional)</span>
            </label>
            <input
              id="et-desc"
              type="text"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="e.g. Coffee at Starbucks" 
              maxLength={100}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSubmit();
              }}
              className={`et-input et-desc-input${formErrors.description ? " et-input--error" : ""}`}
            />
          </div>
          {formErrors.description && (
            <span className="et-field-error">
              <i className="fa fa-circle-exclamation" /> {formErrors.description}
            </span>
          )}
        </div>

        <div className="et-modal-footer">
          <button className="et-btn et-btn--cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="et-btn et-btn--add"
            onClick={onSubmit}
            disabled={savingExpense}
          >
            {savingExpense ? (
              <span className="et-btn-spinner" />
            ) : (
              <i className="fa fa-plus" />
            )}
            {savingExpense ? "Adding…" : "Add Expense"}
          </button>
        </div>
      </div>
    </div>
  );
}
