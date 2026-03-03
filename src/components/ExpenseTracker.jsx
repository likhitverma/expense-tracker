import { useState, useEffect, useMemo } from "react";
import {
  loadExpenses,
  addExpense,
  deleteExpense,
  addAllExpenses,
} from "../Firebase/firestoreOps";
import { uid } from "../utils/helpers";
import DownloadModal from "../modals/DownloadModal";
import "./ExpenseTracker.css";

// ── Constants ──────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "food", label: "Food", icon: "🍔", color: "#f59e0b" },
  { id: "fruits", label: "Fruits", icon: "🍎", color: "#ec4899" },
  { id: "transport", label: "Transport", icon: "🚌", color: "#3b82f6" },
  { id: "fuel", label: "Fuel", icon: "⛽", color: "#8b5cf6" },
  { id: "shopping", label: "Shopping", icon: "🛍️", color: "#8b5cf6" },
  { id: "bills", label: "Bills", icon: "📋", color: "#ef4444" },
  { id: "Investment", label: "Investment", icon: "📈", color: "#22c55e" },
  { id: "health", label: "Health", icon: "💊", color: "#10b981" },
  { id: "entertainment", label: "Entertainment", icon: "🎬", color: "#f43f5e" },
  { id: "temple", label: "Temple", icon: "🛕", color: "#0ea5e9" },
  { id: "other", label: "Other", icon: "💡", color: "#6b7280" },
];

const THEME_ORDER = ["light", "dark", "golden", "monokai"];
const THEME_ICONS = { light: "☀", dark: "☾", golden: "✦", monokai: "◈" };
const THEME_LABELS = {
  light: "Light",
  dark: "Dark",
  golden: "Golden",
  monokai: "Monokai",
};
const CURRENCY = "₹";

// ── Helpers ────────────────────────────────────────────────────────────────────
function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

function getCurrentTimeStr() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function formatDisplayDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatShortDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatMonthLabel(monthStr) {
  return new Date(monthStr + "-01T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function formatCurrency(amount) {
  // if (amount >= 1_00_000)
  //   return `${CURRENCY}${(amount / 1_00_000).toFixed(1)}L`;
  // if (amount >= 1000) return `${CURRENCY}${(amount / 1000).toFixed(1)}K`;
  return `${CURRENCY} ${Number(amount).toFixed(2)}`;
}

function getMonthStr(dateStr) {
  return dateStr.substring(0, 7);
}

function shiftDate(dateStr, days) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function readTheme() {
  try {
    return JSON.parse(localStorage.getItem("nq_v2"))?.theme || "dark";
  } catch {
    return "dark";
  }
}

function persistTheme(t) {
  try {
    const raw = localStorage.getItem("nq_v2");
    const data = raw ? JSON.parse(raw) : {};
    localStorage.setItem("nq_v2", JSON.stringify({ ...data, theme: t }));
  } catch {
    /* ignore */
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function ExpenseTracker({ user, onLogout, toast }) {
  // Theme (mutable, synced with main-app localStorage key)
  const [theme, setTheme] = useState(readTheme);

  // Data
  const [expensesLoading, setExpensesLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);

  // View: "daily" | "monthly"
  const [view, setView] = useState("daily");

  // Daily-view state
  const [selectedDate, setSelectedDate] = useState(getTodayStr);
  const [activeCategory, setActiveCategory] = useState("all");

  // Monthly-view state
  const [expandedMonth, setExpandedMonth] = useState(null);

  // Add-expense modal
  const [showModal, setShowModal] = useState(false);
  const [savingExpense, setSavingExpense] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [form, setForm] = useState({
    amount: "",
    time: getCurrentTimeStr(),
    description: "",
    category: "food",
  });

  // Delete flow
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // expense object

  // Download modal
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  // ── Fix: override body overflow:hidden so the page scrolls ────────────────
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, []);

  // ── Load expenses for the signed-in user ───────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setExpensesLoading(true);
    loadExpenses(user.uid)
      .then((data) => {
        if (!cancelled) {
          setExpenses(data);
          setExpensesLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load expenses:", err);
        if (!cancelled) {
          toast?.("Failed to load your expenses. Please refresh.", "error");
          setExpensesLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived: Daily ─────────────────────────────────────────────────────────
  const todayStr = getTodayStr();
  const currentMonthStr = getMonthStr(selectedDate);

  const byDate = expenses.filter((e) => e.date === selectedDate);
  const filteredByCategory =
    activeCategory === "all"
      ? byDate
      : byDate.filter((e) => e.category === activeCategory);
  const sortedExpenses = [...filteredByCategory].sort((a, b) =>
    b.time.localeCompare(a.time),
  );

  const dayTotal = byDate.reduce((s, e) => s + (e.amount || 0), 0);
  const monthTotal = expenses
    .filter((e) => getMonthStr(e.date) === currentMonthStr)
    .reduce((s, e) => s + (e.amount || 0), 0);
  const overallTotal = expenses.reduce((s, e) => s + (e.amount || 0), 0);

  const categoryBreakdown = CATEGORIES.map((cat) => ({
    ...cat,
    total: byDate
      .filter((e) => e.category === cat.id)
      .reduce((s, e) => s + (e.amount || 0), 0),
  })).filter((c) => c.total > 0);

  // ── Derived: Monthly ───────────────────────────────────────────────────────
  const monthlyData = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const m = getMonthStr(e.date);
      if (!map[m]) map[m] = { monthStr: m, total: 0, count: 0, dayMap: {} };
      map[m].total += e.amount || 0;
      map[m].count += 1;
      if (!map[m].dayMap[e.date])
        map[m].dayMap[e.date] = { total: 0, count: 0 };
      map[m].dayMap[e.date].total += e.amount || 0;
      map[m].dayMap[e.date].count += 1;
    });
    return Object.values(map)
      .sort((a, b) => b.monthStr.localeCompare(a.monthStr))
      .map((m) => ({
        ...m,
        label: formatMonthLabel(m.monthStr),
        days: Object.entries(m.dayMap)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([date, d]) => ({ date, ...d })),
      }));
  }, [expenses]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  function cycleTheme() {
    const next =
      THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length];
    setTheme(next);
    persistTheme(next);
  }

  function openAddModal() {
    setForm({
      amount: "",
      time: getCurrentTimeStr(),
      description: "",
      category: "food",
    });
    setFormErrors({});
    setShowModal(true);
  }

  function validateForm() {
    const errors = {};
    const amt = parseFloat(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0)
      errors.amount = "Enter a valid positive amount";
    if (!form.time) errors.time = "Time is required";
    return errors;
  }

  async function handleAddExpense() {
    const errors = validateForm();
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }
    setSavingExpense(true);
    const expense = {
      id: uid(),
      amount: parseFloat(form.amount),
      time: form.time,
      date: selectedDate,
      description: form.description.trim(),
      category: form.category,
    };
    try {
      await addExpense(user.uid, expense);
      setExpenses((prev) => [expense, ...prev]);
      setShowModal(false);
      toast?.("Expense added!", "success");
    } catch (err) {
      console.error("Failed to add expense:", err);
      toast?.("Failed to save expense. Please try again.", "error");
    }
    setSavingExpense(false);
  }

  // Step 1: show confirm dialog
  function requestDelete(expense) {
    setConfirmDelete(expense);
  }

  // Step 2: user confirmed — actually delete
  async function executeDelete() {
    const expenseId = confirmDelete.id;
    setConfirmDelete(null);
    setDeletingId(expenseId);
    try {
      await deleteExpense(user.uid, expenseId);
    } catch (err) {
      console.error("Delete failed:", err);
      toast?.("Failed to delete expense. Please try again.", "error");
      setDeletingId(null);
      return;
    }
    setTimeout(() => {
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
      setDeletingId(null);
    }, 320);
  }

  // Jump from monthly view into daily view for a specific date
  function drillIntoDay(dateStr) {
    setSelectedDate(dateStr);
    setActiveCategory("all");
    setView("daily");
  }

  // ── Loading screen ─────────────────────────────────────────────────────────
  if (expensesLoading) {
    return (
      <div className="et-page" data-theme={theme}>
        <div className="et-loading">
          <div className="et-spinner" />
          <span>Loading your expenses…</span>
        </div>
      </div>
    );
  }

  const confirmCat = confirmDelete
    ? CATEGORIES.find((c) => c.id === confirmDelete.category) ||
      CATEGORIES[CATEGORIES.length - 1]
    : null;

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="et-page" data-theme={theme}>
      {/* ── HEADER ── */}
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
          {/* Theme Toggle */}
          <button
            className="et-icon-btn et-theme-btn"
            onClick={cycleTheme}
            title={`Theme: ${THEME_LABELS[theme]}`}
          >
            <span className="et-theme-icon">{THEME_ICONS[theme]}</span>
            <span className="et-theme-label">{THEME_LABELS[theme]}</span>
          </button>

          {/* Export */}
          <button
            className="et-icon-btn"
            onClick={() => setShowDownloadModal(true)}
            title="Export expenses"
          >
            <i className="fa fa-download" />
          </button>
        </div>
      </header>

      {/* ── VIEW TABS ── */}
      <div className="et-tab-strip">
        <button
          className={`et-tab${view === "daily" ? " et-tab--active" : ""}`}
          onClick={() => setView("daily")}
        >
          <i className="fa fa-calendar-day" /> Daily
        </button>
        <button
          className={`et-tab${view === "monthly" ? " et-tab--active" : ""}`}
          onClick={() => setView("monthly")}
        >
          <i className="fa fa-calendar-alt" /> Monthly
          {monthlyData.length > 0 && (
            <span className="et-tab-badge">{monthlyData.length}</span>
          )}
        </button>
      </div>

      {/* ── BODY ── */}
      <div className="et-body">
        {/* ════════════════════ DAILY VIEW ════════════════════ */}
        {view === "daily" && (
          <>
            {/* Date navigator */}
            <div className="et-date-section">
              <button
                className="et-nav-btn"
                onClick={() => setSelectedDate((d) => shiftDate(d, -1))}
              >
                <i className="fa fa-chevron-left" />
              </button>
              <div className="et-date-display">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setActiveCategory("all");
                  }}
                  className="et-date-input"
                />
                <span className="et-date-label">
                  {formatDisplayDate(selectedDate)}
                </span>
                {selectedDate !== todayStr && (
                  <button
                    className="et-today-btn"
                    onClick={() => setSelectedDate(todayStr)}
                  >
                    Today
                  </button>
                )}
              </div>
              <button
                className="et-nav-btn"
                onClick={() => setSelectedDate((d) => shiftDate(d, 1))}
              >
                <i className="fa fa-chevron-right" />
              </button>
            </div>

            {/* Summary cards */}
            <div className="et-summary">
              <div className="et-summary-card et-card-day">
                <span className="et-card-icon">📆</span>
                <div>
                  <div className="et-card-label">Day&apos;s Spend</div>
                  <div className="et-card-amount">
                    {formatCurrency(dayTotal)}
                  </div>
                  <div className="et-card-count">
                    {byDate.length} transaction{byDate.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
              <div className="et-summary-card et-card-month">
                <span className="et-card-icon">🗓️</span>
                <div>
                  <div className="et-card-label">This Month</div>
                  <div className="et-card-amount">
                    {formatCurrency(monthTotal)}
                  </div>
                  <div className="et-card-count">
                    {
                      expenses.filter(
                        (e) => getMonthStr(e.date) === currentMonthStr,
                      ).length
                    }{" "}
                    transactions
                  </div>
                </div>
              </div>
              <div className="et-summary-card et-card-total">
                <span className="et-card-icon">💸</span>
                <div>
                  <div className="et-card-label">All-Time</div>
                  <div className="et-card-amount">
                    {formatCurrency(overallTotal)}
                  </div>
                  <div className="et-card-count">{expenses.length} total</div>
                </div>
              </div>
            </div>

            {/* Category breakdown bar */}
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

            {/* Category filter chips */}
            {byDate.length > 0 && (
              <div className="et-filter-section">
                <div className="et-filter-chips">
                  <button
                    className={`et-chip${activeCategory === "all" ? " active" : ""}`}
                    onClick={() => setActiveCategory("all")}
                  >
                    All ({byDate.length})
                  </button>
                  {CATEGORIES.map((cat) => {
                    const count = byDate.filter(
                      (e) => e.category === cat.id,
                    ).length;
                    if (!count) return null;
                    return (
                      <button
                        key={cat.id}
                        className={`et-chip${activeCategory === cat.id ? " active" : ""}`}
                        style={{ "--cat-color": cat.color }}
                        onClick={() =>
                          setActiveCategory(
                            activeCategory === cat.id ? "all" : cat.id,
                          )
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
                {selectedDate === todayStr ? "Today's Expenses" : "Expenses"}
                {sortedExpenses.length > 0 && (
                  <span className="et-count-badge">
                    {sortedExpenses.length}
                  </span>
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
                    <button className="et-empty-cta" onClick={openAddModal}>
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
                        className={`et-expense-card${deletingId === expense.id ? " et-deleting" : ""}`}
                        style={{ "--cat-color": cat.color }}
                      >
                        <div className="et-exp-cat-icon">{cat.icon}</div>
                        <div className="et-exp-info">
                          <div className="et-exp-cat-name">{cat.label}</div>
                          {expense.description && (
                            <div className="et-exp-desc">
                              {expense.description}
                            </div>
                          )}
                          <div className="et-exp-time">
                            <i className="fa fa-clock" /> {expense.time}
                          </div>
                        </div>
                        <div className="et-exp-amount">
                          {formatCurrency(expense.amount)}
                        </div>
                        <button
                          className="et-del-btn"
                          onClick={() => requestDelete(expense)}
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
          </>
        )}

        {/* ════════════════════ MONTHLY VIEW ════════════════════ */}
        {view === "monthly" && (
          <div className="et-monthly-view">
            {/* Overall total pill */}
            <div className="et-monthly-hero">
              <span className="et-monthly-hero-label">
                Total All-Time Spend
              </span>
              <span className="et-monthly-hero-amount">
                {formatCurrency(overallTotal)}
              </span>
              <span className="et-monthly-hero-count">
                {expenses.length} transactions across {monthlyData.length} month
                {monthlyData.length !== 1 ? "s" : ""}
              </span>
            </div>

            <h3 className="et-section-title">
              Monthly Summary
              {monthlyData.length > 0 && (
                <span className="et-count-badge">{monthlyData.length}</span>
              )}
            </h3>

            {monthlyData.length === 0 ? (
              <div className="et-empty">
                <div className="et-empty-icon">📭</div>
                <p className="et-empty-title">No expenses recorded yet</p>
                <p className="et-empty-sub">
                  Switch to Daily view to log your first expense
                </p>
                <button
                  className="et-empty-cta"
                  onClick={() => setView("daily")}
                >
                  <i className="fa fa-calendar-day" /> Go to Daily View
                </button>
              </div>
            ) : (
              <div className="et-month-list">
                {monthlyData.map((month) => {
                  const isOpen = expandedMonth === month.monthStr;
                  return (
                    <div
                      key={month.monthStr}
                      className={`et-month-card${isOpen ? " et-month-card--open" : ""}`}
                    >
                      {/* Month header row */}
                      <button
                        className="et-month-header"
                        onClick={() =>
                          setExpandedMonth(isOpen ? null : month.monthStr)
                        }
                      >
                        <div className="et-month-left">
                          <div className="et-month-icon-wrap">
                            <i className="fa fa-calendar-alt" />
                          </div>
                          <div>
                            <div className="et-month-label">{month.label}</div>
                            <div className="et-month-meta">
                              {month.count} transaction
                              {month.count !== 1 ? "s" : ""}
                              {" · "}
                              {month.days.length} day
                              {month.days.length !== 1 ? "s" : ""}
                            </div>
                          </div>
                        </div>
                        <div className="et-month-right">
                          <span className="et-month-total">
                            {formatCurrency(month.total)}
                          </span>
                          <i
                            className={`fa fa-chevron-down et-month-chevron${isOpen ? " et-month-chevron--open" : ""}`}
                          />
                        </div>
                      </button>

                      {/* Day-by-day breakdown (expanded) */}
                      {isOpen && (
                        <div className="et-month-days">
                          {month.days.map((day, idx) => (
                            <button
                              key={day.date}
                              className="et-day-row"
                              onClick={() => drillIntoDay(day.date)}
                              title={`View ${formatDisplayDate(day.date)}`}
                              style={{ animationDelay: `${idx * 40}ms` }}
                            >
                              <div className="et-day-row-left">
                                <div className="et-day-dot" />
                                <div>
                                  <div className="et-day-date">
                                    {day.date === todayStr
                                      ? "Today"
                                      : formatShortDate(day.date)}
                                  </div>
                                  <div className="et-day-count">
                                    {day.count} transaction
                                    {day.count !== 1 ? "s" : ""}
                                  </div>
                                </div>
                              </div>
                              <div className="et-day-row-right">
                                <span className="et-day-total">
                                  {formatCurrency(day.total)}
                                </span>
                                <i className="fa fa-chevron-right et-day-arrow" />
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
      {/* end .et-body */}

      {/* ── FLOATING ADD BUTTON ── */}
      <button className="et-fab" onClick={openAddModal} title="Add expense">
        <i className="fa fa-plus" />
      </button>

      {/* ══════════════════════════════════════════════════════
          ADD EXPENSE MODAL
          ══════════════════════════════════════════════════════ */}
      {showModal && (
        <div className="et-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="et-modal" onClick={(e) => e.stopPropagation()}>
            <div className="et-modal-header">
              <div className="et-modal-title-wrap">
                <span>➕</span>
                <h2>Add Expense</h2>
              </div>
              <button
                className="et-modal-close"
                onClick={() => setShowModal(false)}
              >
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
                    <i className="fa fa-circle-exclamation" />{" "}
                    {formErrors.amount}
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
                      onClick={() =>
                        setForm((f) => ({ ...f, category: cat.id }))
                      }
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
                      <i className="fa fa-circle-exclamation" />{" "}
                      {formErrors.time}
                    </span>
                  )}
                </div>
                <div className="et-form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
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
                  className="et-input"
                  maxLength={100}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddExpense();
                  }}
                />

                
              </div>
            </div>

            <div className="et-modal-footer">
              <button
                className="et-btn et-btn--cancel"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="et-btn et-btn--add"
                onClick={handleAddExpense}
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
      )}

      {/* ══════════════════════════════════════════════════════
          CONFIRM DELETE MODAL
          ══════════════════════════════════════════════════════ */}
      {confirmDelete && (
        <div
          className="et-modal-overlay"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="et-modal et-modal--confirm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="et-confirm-body">
              <div className="et-confirm-icon-wrap">🗑️</div>
              <h3 className="et-confirm-title">Delete Expense?</h3>
              <div className="et-confirm-detail">
                <span className="et-confirm-cat-icon">{confirmCat?.icon}</span>
                <div>
                  <div className="et-confirm-cat-name">{confirmCat?.label}</div>
                  <div className="et-confirm-amount">
                    {formatCurrency(confirmDelete.amount)}
                  </div>
                  {confirmDelete.description && (
                    <div className="et-confirm-desc">
                      "{confirmDelete.description}"
                    </div>
                  )}
                  <div className="et-confirm-time">
                    <i className="fa fa-clock" /> {confirmDelete.time} ·{" "}
                    {formatShortDate(confirmDelete.date)}
                  </div>
                </div>
              </div>
              <p className="et-confirm-warn">This action cannot be undone.</p>
            </div>

            <div className="et-modal-footer">
              <button
                className="et-btn et-btn--cancel"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button className="et-btn et-btn--danger" onClick={executeDelete}>
                <i className="fa fa-trash" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          DOWNLOAD / EXPORT MODAL
          ══════════════════════════════════════════════════════ */}
      {showDownloadModal && (
        <DownloadModal
          expenses={expenses}
          onClose={() => setShowDownloadModal(false)}
          toast={toast}
        />
      )}
    </div>
  );
}
