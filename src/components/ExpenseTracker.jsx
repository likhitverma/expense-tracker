import { useState, useEffect, useMemo } from "react";
import {
  loadExpenses,
  addExpense,
  deleteExpense,
} from "../Firebase/firestoreOps";
import { uid } from "../utils/helpers";
import DownloadModal from "../modals/DownloadModal";
import Header from "./Header";
import DailyView from "./DailyView";
import MonthlyView from "./MonthlyView";
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

  // ── View: "daily" | "monthly" ─────────────────────────────────────────────
  const [view, setView] = useState("daily");

  // ── Daily view state ──────────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState(getTodayStr);
  const [activeCategory, setActiveCategory] = useState("all");

  // ── Monthly view state ────────────────────────────────────────────────────
  const [expandedMonth, setExpandedMonth] = useState(null);

  // ── Add expense modal ─────────────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [savingExpense, setSavingExpense] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [form, setForm] = useState({
    amount: "",
    time: getCurrentTimeStr(),
    description: "",
    category: "food",
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
  const filteredByCategory =
    activeCategory === "all"
      ? byDate
      : byDate.filter((e) => e.category === activeCategory);
  const sortedExpenses = [...filteredByCategory].sort((a, b) =>
    b.time.localeCompare(a.time),
  );

  const dayTotal = byDate.reduce((s, e) => s + (e.amount || 0), 0);
  const monthExpenses = expenses.filter(
    (e) => getMonthStr(e.date) === currentMonthStr,
  );
  const monthTotal = monthExpenses.reduce((s, e) => s + (e.amount || 0), 0);
  const overallTotal = expenses.reduce((s, e) => s + (e.amount || 0), 0);

  const categoryBreakdown = CATEGORIES.map((cat) => ({
    ...cat,
    total: byDate
      .filter((e) => e.category === cat.id)
      .reduce((s, e) => s + (e.amount || 0), 0),
  })).filter((c) => c.total > 0);

  // ── Derived: Monthly ──────────────────────────────────────────────────────
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
            dayTotal={dayTotal}
            monthTotal={monthTotal}
            overallTotal={overallTotal}
            monthExpenseCount={monthExpenses.length}
            totalExpenseCount={expenses.length}
            deletingId={deletingId}
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
            overallTotal={overallTotal}
            totalExpenseCount={expenses.length}
            todayStr={todayStr}
            expandedMonth={expandedMonth}
            onToggleMonth={(m) => setExpandedMonth(expandedMonth === m ? null : m)}
            onDrillDay={drillIntoDay}
            onSwitchToDaily={() => setView("daily")}
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
