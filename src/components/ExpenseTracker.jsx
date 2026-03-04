import { useState, useEffect, useMemo } from "react";
import {
  loadExpenses,
  addExpense,
  deleteExpense,
} from "../Firebase/firestoreOps";
import { uid } from "../utils/helpers";
import featureFlags from "../appConfig";
import DownloadModal from "../modals/DownloadModal";
import Header from "./Header";
import DailyView from "./DailyView";
import MonthlyView from "./MonthlyView";
import Dashboard from "./Dashboard";
import AddExpenseModal from "./AddExpenseModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import {
  CATEGORIES,
  THEME_ORDER,
  getTodayStr,
  getCurrentTimeStr,
  getMonthStr,
  formatMonthLabel,
  readTheme,
  persistTheme,
} from "./constants";
import "./ExpenseTracker.css";

export default function ExpenseTracker({ user, onLogout, toast }) {
  // ── Theme ─────────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState(readTheme);

  // ── Data ──────────────────────────────────────────────────────────────────
  const [expensesLoading, setExpensesLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);

  // ── View: "daily" | "monthly" | "dashboard" ───────────────────────────────
  const [view, setView] = useState("daily");

  // ── Daily view state ──────────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState(getTodayStr);
  const [activeCategory, setActiveCategory] = useState("all");

  // ── Monthly view state ────────────────────────────────────────────────────
  const [expandedMonth, setExpandedMonth] = useState(null);

  // ── Add expense/income modal ──────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [savingExpense, setSavingExpense] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [form, setForm] = useState({
    amount: "",
    time: getCurrentTimeStr(),
    description: "",
    category: "food",
    type: "expense",
  });

  // ── Delete flow ───────────────────────────────────────────────────────────
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // ── Download modal ────────────────────────────────────────────────────────
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  // ── Fix: override body overflow so the page scrolls ──────────────────────
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, []);

  // ── Load expenses for the signed-in user ──────────────────────────────────
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

  // ── Derived: Daily ────────────────────────────────────────────────────────
  const todayStr = getTodayStr();
  const currentMonthStr = getMonthStr(selectedDate);

  const byDate = expenses.filter((e) => e.date === selectedDate);
  const byDateExpenses = byDate.filter((e) => (e.type || "expense") === "expense");
  const byDateIncome = byDate.filter((e) => e.type === "income");

  const filteredByCategory =
    activeCategory === "all"
      ? byDate
      : byDate.filter((e) => e.category === activeCategory);
  const sortedExpenses = [...filteredByCategory].sort((a, b) =>
    b.time.localeCompare(a.time),
  );

  const daySpent = byDateExpenses.reduce((s, e) => s + (e.amount || 0), 0);
  const dayEarned = byDateIncome.reduce((s, e) => s + (e.amount || 0), 0);

  const monthExpenses = expenses.filter(
    (e) => getMonthStr(e.date) === currentMonthStr,
  );
  const monthSpent = monthExpenses
    .filter((e) => (e.type || "expense") === "expense")
    .reduce((s, e) => s + (e.amount || 0), 0);
  const monthEarned = monthExpenses
    .filter((e) => e.type === "income")
    .reduce((s, e) => s + (e.amount || 0), 0);

  const overallSpent = expenses
    .filter((e) => (e.type || "expense") === "expense")
    .reduce((s, e) => s + (e.amount || 0), 0);
  const overallEarned = expenses
    .filter((e) => e.type === "income")
    .reduce((s, e) => s + (e.amount || 0), 0);

  const categoryBreakdown = CATEGORIES.map((cat) => ({
    ...cat,
    total: byDateExpenses
      .filter((e) => e.category === cat.id)
      .reduce((s, e) => s + (e.amount || 0), 0),
  })).filter((c) => c.total > 0);

  // ── Derived: Monthly ──────────────────────────────────────────────────────
  const monthlyData = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const m = getMonthStr(e.date);
      if (!map[m])
        map[m] = { monthStr: m, spent: 0, earned: 0, count: 0, dayMap: {} };
      const isIncome = e.type === "income";
      if (isIncome) {
        map[m].earned += e.amount || 0;
      } else {
        map[m].spent += e.amount || 0;
      }
      map[m].count += 1;
      if (!map[m].dayMap[e.date])
        map[m].dayMap[e.date] = { spent: 0, earned: 0, count: 0 };
      if (isIncome) {
        map[m].dayMap[e.date].earned += e.amount || 0;
      } else {
        map[m].dayMap[e.date].spent += e.amount || 0;
      }
      map[m].dayMap[e.date].count += 1;
    });
    return Object.values(map)
      .sort((a, b) => b.monthStr.localeCompare(a.monthStr))
      .map((m) => ({
        ...m,
        total: m.spent,
        net: m.earned - m.spent,
        label: formatMonthLabel(m.monthStr),
        days: Object.entries(m.dayMap)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([date, d]) => ({
            date,
            ...d,
            total: d.spent,
            net: d.earned - d.spent,
          })),
      }));
  }, [expenses]);

  // ── Handlers ──────────────────────────────────────────────────────────────
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
      type: "expense",
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
    if (!form.description || form.description.trim() === "")
      errors.description = "Enter a valid description";
    return errors;
  }

  async function handleAddExpense() {
    const errors = validateForm();
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }
    setSavingExpense(true);
    const record = {
      id: uid(),
      amount: parseFloat(form.amount),
      time: form.time,
      date: selectedDate,
      description: form.description.trim(),
      category: form.category,
      type: form.type || "expense",
    };
    try {
      await addExpense(user.uid, record);
      setExpenses((prev) => [record, ...prev]);
      setShowModal(false);
      toast?.(
        record.type === "income" ? "Income added!" : "Expense added!",
        "success",
      );
    } catch (err) {
      console.error("Failed to add record:", err);
      toast?.("Failed to save. Please try again.", "error");
    }
    setSavingExpense(false);
  }

  async function executeDelete() {
    const expenseId = confirmDelete.id;
    setConfirmDelete(null);
    setDeletingId(expenseId);
    try {
      await deleteExpense(user.uid, expenseId);
    } catch (err) {
      console.error("Delete failed:", err);
      toast?.("Failed to delete. Please try again.", "error");
      setDeletingId(null);
      return;
    }
    setTimeout(() => {
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
      setDeletingId(null);
    }, 320);
  }

  function drillIntoDay(dateStr) {
    setSelectedDate(dateStr);
    setActiveCategory("all");
    setView("daily");
  }

  // ── Loading screen ────────────────────────────────────────────────────────
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="et-page" data-theme={theme}>
      <Header
        user={user}
        onLogout={onLogout}
        theme={theme}
        onCycleTheme={cycleTheme}
        onDownload={() => setShowDownloadModal(true)}
      />

      {/* ── View tabs ── */}
      <div className="et-tab-strip">
        {featureFlags.TABS.daily && (
          <button
            className={`et-tab${view === "daily" ? " et-tab--active" : ""}`}
            onClick={() => setView("daily")}
          >
            <i className="fa fa-calendar-day" /> Daily
          </button>
        )}
        {featureFlags.TABS.monthly && (
          <button
            className={`et-tab${view === "monthly" ? " et-tab--active" : ""}`}
            onClick={() => setView("monthly")}
          >
            <i className="fa fa-calendar-alt" /> Monthly
            {monthlyData.length > 0 && (
              <span className="et-tab-badge">{monthlyData.length}</span>
            )}
          </button>
        )}
        {featureFlags.TABS.dashboard && (
          <button
            className={`et-tab${view === "dashboard" ? " et-tab--active" : ""}`}
            onClick={() => setView("dashboard")}
          >
            <i className="fa fa-chart-pie" /> Dashboard
          </button>
        )}
      </div>

      {/* ── Body ── */}
      <div className="et-body">
        {view === "daily" && (
          <DailyView
            selectedDate={selectedDate}
            todayStr={todayStr}
            activeCategory={activeCategory}
            byDate={byDate}
            sortedExpenses={sortedExpenses}
            categoryBreakdown={categoryBreakdown}
            daySpent={daySpent}
            dayEarned={dayEarned}
            monthSpent={monthSpent}
            monthEarned={monthEarned}
            overallSpent={overallSpent}
            overallEarned={overallEarned}
            monthExpenseCount={monthExpenses.length}
            totalExpenseCount={expenses.length}
            deletingId={deletingId}
            enableIncomeTracking={featureFlags.ENABLE_INCOME_TRACKING}
            onDateChange={(date) => {
              setSelectedDate(date);
              setActiveCategory("all");
            }}
            onCategoryChange={setActiveCategory}
            onDeleteRequest={setConfirmDelete}
            onAddExpense={openAddModal}
          />
        )}

        {view === "monthly" && (
          <MonthlyView
            monthlyData={monthlyData}
            overallSpent={overallSpent}
            overallEarned={overallEarned}
            totalExpenseCount={expenses.length}
            todayStr={todayStr}
            expandedMonth={expandedMonth}
            enableIncomeTracking={featureFlags.ENABLE_INCOME_TRACKING}
            onToggleMonth={(m) =>
              setExpandedMonth(expandedMonth === m ? null : m)
            }
            onDrillDay={drillIntoDay}
            onSwitchToDaily={() => setView("daily")}
          />
        )}

        {view === "dashboard" && (
          <Dashboard
            expenses={expenses}
            monthlyData={monthlyData}
            overallSpent={overallSpent}
            overallEarned={overallEarned}
            enableIncomeTracking={featureFlags.ENABLE_INCOME_TRACKING}
          />
        )}
      </div>

      {/* ── Floating add button ── */}
      <button className="et-fab" onClick={openAddModal} title="Add expense">
        <i className="fa fa-plus" />
      </button>

      {/* ── Modals ── */}
      {showModal && (
        <AddExpenseModal
          onClose={() => setShowModal(false)}
          form={form}
          setForm={setForm}
          formErrors={formErrors}
          setFormErrors={setFormErrors}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onSubmit={handleAddExpense}
          savingExpense={savingExpense}
          enableIncomeTracking={featureFlags.ENABLE_INCOME_TRACKING}
        />
      )}

      <ConfirmDeleteModal
        expense={confirmDelete}
        onConfirm={executeDelete}
        onCancel={() => setConfirmDelete(null)}
      />

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
