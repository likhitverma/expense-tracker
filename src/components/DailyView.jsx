import { useState } from "react";
import {
  CATEGORIES,
  formatDisplayDate,
  formatCurrency,
  formatTime,
  shiftDate,
} from "./constants";
import ExpenseDetailModal from "./ExpenseDetailModal";

export default function DailyView({
  selectedDate,
  todayStr,
  activeCategory,
  byDate,
  sortedExpenses,
  categoryBreakdown,
  dayTotal,
  monthTotal,
  overallTotal,
  monthExpenseCount,
  totalExpenseCount,
  deletingId,
  onDateChange,
  onCategoryChange,
  onDeleteRequest,
  onAddExpense,
}) {
  const [detailExpense, setDetailExpense] = useState(null);

  return (
    <>
      {/* ── Date navigator ── */}
      <div className="et-date-section">
        <button
          className="et-nav-btn"
          onClick={() => onDateChange(shiftDate(selectedDate, 0))}
        >
          <i className="fa fa-chevron-left" />
        </button>
        <div className="et-date-display">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              onDateChange(e.target.value);
              onCategoryChange("all");
            }}
            className="et-date-input"
          />
          <span className="et-date-label">
            {formatDisplayDate(selectedDate)}
          </span>
          {selectedDate !== todayStr && (
            <button
              className="et-today-btn"
              onClick={() => onDateChange(todayStr)}
            >
              Today
            </button>
          )}
        </div>
        <button
          className="et-nav-btn"
          onClick={() => onDateChange(shiftDate(selectedDate, 2))}
        >
          <i className="fa fa-chevron-right" />
        </button>
      </div>

      {/* ── Summary cards ── */}
      <div className="et-summary">
        <div className="et-summary-card et-card-day">
          <span className="et-card-icon">📆</span>
          <div>
            <div className="et-card-label">Day&apos;s Spend</div>
            <div className="et-card-amount">{formatCurrency(dayTotal)}</div>
            <div className="et-card-count">
              {byDate.length} transaction{byDate.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
        <div className="et-summary-card et-card-month">
          <span className="et-card-icon">🗓️</span>
          <div>
            <div className="et-card-label">This Month</div>
            <div className="et-card-amount">{formatCurrency(monthTotal)}</div>
            <div className="et-card-count">
              {monthExpenseCount} transactions
            </div>
          </div>
        </div>
        <div className="et-summary-card et-card-total">
          <span className="et-card-icon">💸</span>
          <div>
            <div className="et-card-label">All-Time</div>
            <div className="et-card-amount">{formatCurrency(overallTotal)}</div>
            <div className="et-card-count">{totalExpenseCount} total</div>
          </div>
        </div>
      </div>

      {/* ── Category breakdown bars ── */}
      {categoryBreakdown.length > 0 && (
        <div className="et-category-breakdown">
          <h3 className="et-section-title">Breakdown for this day</h3>
          <div className="et-cat-breakdown-list">
            {categoryBreakdown.map((cat) => (
              <div
                key={cat.id}
                className="et-cat-row"
                style={{ "--cat-color": cat.color }}
              >
                <span className="et-cat-row-icon">{cat.icon}</span>
                <span className="et-cat-row-name">{cat.label}</span>
                <div className="et-cat-bar-wrap">
                  <div
                    className="et-cat-bar-fill"
                    style={{
                      width: `${Math.round((cat.total / dayTotal) * 100)}%`,
                    }}
                  />
                </div>
                <span className="et-cat-row-pct">
                  {Math.round((cat.total / dayTotal) * 100)}%
                </span>
                <span className="et-cat-row-amt">
                  {formatCurrency(cat.total)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Category filter chips ── */}
      {byDate.length > 0 && (
        <div className="et-filter-section">
          <div className="et-filter-chips">
            <button
              className={`et-chip${activeCategory === "all" ? " active" : ""}`}
              onClick={() => onCategoryChange("all")}
            >
              All ({byDate.length})
            </button>
            {CATEGORIES.map((cat) => {
              const count = byDate.filter((e) => e.category === cat.id).length;
              if (!count) return null;
              return (
                <button
                  key={cat.id}
                  className={`et-chip${activeCategory === cat.id ? " active" : ""}`}
                  style={{ "--cat-color": cat.color }}
                  onClick={() =>
                    onCategoryChange(activeCategory === cat.id ? "all" : cat.id)
                  }
                >
                  {cat.icon} {cat.label} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Expense list ── */}
      <div className="et-list-section">
        <h3 className="et-section-title">
          {selectedDate === todayStr ? "Today's Expenses" : "Expenses"}
          {sortedExpenses.length > 0 && (
            <span className="et-count-badge">{sortedExpenses.length}</span>
          )}
        </h3>

        {sortedExpenses.length === 0 ? (
          <div className="et-empty">
            <div className="et-empty-icon">💸</div>
            <p className="et-empty-title">No expenses yet</p>
            <p className="et-empty-sub">
              {activeCategory !== "all"
                ? `No "${CATEGORIES.find((c) => c.id === activeCategory)?.label}" expenses for this date`
                : "Tap the + button to log your first expense"}
            </p>
            {activeCategory === "all" && (
              <button className="et-empty-cta" onClick={onAddExpense}>
                <i className="fa fa-plus" /> Add Expense
              </button>
            )}
          </div>
        ) : (
          <div className="et-expense-list">
            {sortedExpenses.map((expense) => {
              const cat =
                CATEGORIES.find((c) => c.id === expense.category) ||
                CATEGORIES[CATEGORIES.length - 1];
              return (
                <div
                  key={expense.id}
                  className={`et-expense-card et-expense-card--clickable${deletingId === expense.id ? " et-deleting" : ""}`}
                  style={{ "--cat-color": cat.color }}
                  onClick={() => setDetailExpense(expense)}
                >
                  <div className="et-exp-cat-icon">{cat.icon}</div>
                  <div className="et-exp-info">
                    <div className="et-exp-cat-name">{cat.label}</div>
                    {expense.description && (
                      <div className="et-exp-desc">{expense.description}</div>
                    )}
                    <div className="et-exp-time">
                      <i className="fa fa-clock" /> {formatTime(expense.time)}
                    </div>
                  </div>
                  <div className="et-exp-amount">
                    {formatCurrency(expense.amount)}
                  </div>
                  <button
                    className="et-del-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteRequest(expense);
                    }}
                    title="Delete expense"
                  >
                    <i className="fa fa-trash" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Expense detail modal ── */}
      <ExpenseDetailModal
        expense={detailExpense}
        onClose={() => setDetailExpense(null)}
        onDelete={onDeleteRequest}
      />
    </>
  );
}
