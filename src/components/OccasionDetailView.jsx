import { useState } from "react";
import {
  CATEGORIES,
  INCOME_CATEGORIES,
  formatCurrency,
  formatTime,
  formatShortDate,
} from "./constants";
import ExpenseDetailModal from "./ExpenseDetailModal";

export default function OccasionDetailView({
  occasion,
  expenses,
  loading,
  deletingId,
  enableIncomeTracking,
  onBack,
  onAddExpense,
  onEditRequest,
  onDeleteRequest,
}) {
  const [detailExpense, setDetailExpense] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");

  const expenseEntries = expenses.filter(
    (e) => (e.type || "expense") === "expense",
  );
  const incomeEntries = expenses.filter((e) => e.type === "income");
  const totalSpent = expenseEntries.reduce((s, e) => s + (e.amount || 0), 0);
  const totalEarned = incomeEntries.reduce((s, e) => s + (e.amount || 0), 0);
  const net = totalEarned - totalSpent;

  // Category breakdown (expense only, for bar chart)
  const categoryBreakdown = CATEGORIES.map((cat) => ({
    ...cat,
    total: expenseEntries
      .filter((e) => e.category === cat.id)
      .reduce((s, e) => s + (e.amount || 0), 0),
  })).filter((c) => c.total > 0);

  // Apply category filter then sort by date desc, time desc
  const filtered =
    activeCategory === "all"
      ? expenses
      : expenses.filter((e) => e.category === activeCategory);

  const sorted = [...filtered].sort((a, b) => {
    const dc = b.date.localeCompare(a.date);
    return dc !== 0 ? dc : b.time.localeCompare(a.time);
  });

  function getCat(expense) {
    if (expense.type === "income") {
      return (
        INCOME_CATEGORIES.find((c) => c.id === expense.category) ||
        INCOME_CATEGORIES[INCOME_CATEGORIES.length - 1]
      );
    }
    return (
      CATEGORIES.find((c) => c.id === expense.category) ||
      CATEGORIES[CATEGORIES.length - 1]
    );
  }

  if (loading) {
    return (
      <div className="et-occ-detail">
        <button className="et-occ-back-btn" onClick={onBack}>
          <i className="fa fa-arrow-left" /> All Occasions
        </button>
        <div className="et-loading" style={{ minHeight: 200 }}>
          <div className="et-spinner" />
          <span>Loading expenses…</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="et-occ-detail">
        {/* Back button */}
        <button className="et-occ-back-btn" onClick={onBack}>
          <i className="fa fa-arrow-left" /> All Occasions
        </button>

        {/* Occasion hero */}
        <div className="et-occ-detail-hero">
          <span className="et-occ-detail-emoji">{occasion.emoji}</span>
          <div className="et-occ-detail-hero-text">
            <h2 className="et-occ-detail-name">{occasion.name}</h2>
            {occasion.description && (
              <p className="et-occ-detail-desc">{occasion.description}</p>
            )}
          </div>
        </div>

        {/* Summary cards */}
        <div className="et-summary">
          <div className="et-summary-card et-card-spent">
            <span className="et-card-icon">💸</span>
            <div>
              <div className="et-card-label">Total Spent</div>
              <div className="et-card-amount">{formatCurrency(totalSpent)}</div>
              <div className="et-card-count">
                {expenseEntries.length} expense
                {expenseEntries.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          {enableIncomeTracking && totalEarned > 0 && (
            <div className="et-summary-card et-card-earned">
              <span className="et-card-icon">💰</span>
              <div>
                <div className="et-card-label">Received</div>
                <div className="et-card-amount et-card-amount--income">
                  {formatCurrency(totalEarned)}
                </div>
                <div className="et-card-count">
                  {incomeEntries.length} income
                  {incomeEntries.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          )}

          {enableIncomeTracking && totalEarned > 0 && (
            <div
              className={`et-summary-card et-card-net${net >= 0 ? " et-card-net--positive" : " et-card-net--negative"}`}
            >
              <span className="et-card-icon">{net >= 0 ? "📈" : "📉"}</span>
              <div>
                <div className="et-card-label">Net</div>
                <div
                  className={`et-card-amount${net >= 0 ? " et-card-amount--positive" : " et-card-amount--negative"}`}
                >
                  {net >= 0 ? "+" : ""}
                  {formatCurrency(net)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Category breakdown bars (expense only) ── */}
        {categoryBreakdown.length > 0 && (
          <div className="et-category-breakdown">
            <h3 className="et-section-title">Breakdown</h3>
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
                        width: `${Math.round((cat.total / totalSpent) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="et-cat-row-pct">
                    {Math.round((cat.total / totalSpent) * 100)}%
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
        {expenses.length > 0 && (
          <div className="et-filter-section">
            <div className="et-filter-chips">
              <button
                className={`et-chip${activeCategory === "all" ? " active" : ""}`}
                onClick={() => setActiveCategory("all")}
              >
                All ({expenses.length})
              </button>
              {CATEGORIES.map((cat) => {
                const count = expenses.filter((e) => e.category === cat.id).length;
                if (!count) return null;
                return (
                  <button
                    key={cat.id}
                    className={`et-chip${activeCategory === cat.id ? " active" : ""}`}
                    style={{ "--cat-color": cat.color }}
                    onClick={() =>
                      setActiveCategory(activeCategory === cat.id ? "all" : cat.id)
                    }
                  >
                    {cat.icon} {cat.label} ({count})
                  </button>
                );
              })}
              {INCOME_CATEGORIES.map((cat) => {
                const count = expenses.filter((e) => e.category === cat.id).length;
                if (!count) return null;
                return (
                  <button
                    key={cat.id}
                    className={`et-chip${activeCategory === cat.id ? " active" : ""}`}
                    style={{ "--cat-color": cat.color }}
                    onClick={() =>
                      setActiveCategory(activeCategory === cat.id ? "all" : cat.id)
                    }
                  >
                    {cat.icon} {cat.label} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Expense list */}
        <div className="et-list-section">
          <h3 className="et-section-title">
            Records
            {sorted.length > 0 && (
              <span className="et-count-badge">{sorted.length}</span>
            )}
          </h3>

          {sorted.length === 0 ? (
            <div className="et-empty">
              <div className="et-empty-icon">💸</div>
              <p className="et-empty-title">No expenses yet</p>
              <p className="et-empty-sub">
                Tap the + button to log your first expense for this occasion
              </p>
              <button className="et-empty-cta" onClick={onAddExpense}>
                <i className="fa fa-plus" /> Add Expense
              </button>
            </div>
          ) : (
            <div className="et-expense-list">
              {sorted.map((expense) => {
                const cat = getCat(expense);
                const isIncome = expense.type === "income";
                return (
                  <div
                    key={expense.id}
                    className={`et-expense-card et-expense-card--clickable${deletingId === expense.id ? " et-deleting" : ""}${isIncome ? " et-expense-card--income" : ""}`}
                    style={{ "--cat-color": cat.color }}
                    onClick={() => setDetailExpense(expense)}
                  >
                    <div className="et-exp-cat-icon">{cat.icon}</div>
                    <div className="et-exp-info">
                      <div className="et-exp-top-row">
                        {expense.description && (
                          <div className="et-exp-desc">
                            {expense.description}
                          </div>
                        )}
                        {isIncome && (
                          <span className="et-income-badge">
                            <i className="fa fa-arrow-trend-up" /> Income
                          </span>
                        )}
                      </div>
                      {cat.label && (
                        <div className="et-exp-cat-name">{cat.label}</div>
                      )}
                      <div
                        className="et-exp-time"
                        style={{ fontSize: "0.6rem" }}
                      >
                        <i className="fa fa-calendar" />{" "}
                        {formatShortDate(expense.date)}
                        {" · "}
                        <i className="fa fa-clock" /> {formatTime(expense.time)}
                      </div>
                    </div>
                    <div
                      className={`et-exp-amount${isIncome ? " et-exp-amount--income" : ""}`}
                    >
                      {isIncome ? "+" : ""}
                      {formatCurrency(expense.amount)}
                    </div>
                    <button
                      className="et-edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditRequest(expense);
                      }}
                      title="Edit"
                    >
                      <i className="fa fa-pen" />
                    </button>
                    <button
                      className="et-del-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteRequest(expense);
                      }}
                      title="Delete"
                    >
                      <i className="fa fa-trash" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ExpenseDetailModal
        expense={detailExpense}
        onClose={() => setDetailExpense(null)}
        onDelete={onDeleteRequest}
      />
    </>
  );
}
