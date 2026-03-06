import { useState, useEffect, useMemo } from "react";
import {
  loadExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  loadOccasions,
  addOccasion,
  deleteOccasion,
  loadOccasionExpenses,
  addOccasionExpense,
  updateOccasionExpense,
  deleteOccasionExpense,
} from "../Firebase/firestoreOps";
import { uid } from "../utils/helpers";
import featureFlags from "../appConfig";
import DownloadModal from "../modals/DownloadModal";
import Header from "./Header";
import DailyView from "./DailyView";
import MonthlyView from "./MonthlyView";
import Dashboard from "./Dashboard";
import OccasionsView from "./OccasionsView";
import OccasionDetailView from "./OccasionDetailView";
import AddExpenseModal from "./AddExpenseModal";
import AddOccasionModal from "./AddOccasionModal";
import OccasionInfoModal from "./OccasionInfoModal";
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
import "../styles/occasionsView.css"

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
  // "daily" | "occasion-expense" | "occasion-card"
  const [deleteContext, setDeleteContext] = useState("daily");

  // ── Download modal ────────────────────────────────────────────────────────
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  // ── Occasions ─────────────────────────────────────────────────────────────
  const [occasions, setOccasions] = useState([]);
  const [occasionsLoaded, setOccasionsLoaded] = useState(false);
  const [selectedOccasion, setSelectedOccasion] = useState(null);
  const [occasionExpenses, setOccasionExpenses] = useState([]);
  const [occasionExpensesLoading, setOccasionExpensesLoading] = useState(false);
  const [showAddOccasionModal, setShowAddOccasionModal] = useState(false);
  const [savingOccasion, setSavingOccasion] = useState(false);
  // When adding from within an occasion, we track the date separately
  // so it doesn't affect the global selectedDate
  const [occasionDate, setOccasionDate] = useState(getTodayStr);
  const [addingToOccasion, setAddingToOccasion] = useState(false);

  // ── Edit expense ──────────────────────────────────────────────────────────
  // "daily" | "occasion-expense"
  const [editContext, setEditContext] = useState("daily");
  const [editingExpense, setEditingExpense] = useState(null);

  // ── Occasion info modal ───────────────────────────────────────────────────
  const [infoOccasion, setInfoOccasion] = useState(null);

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

  // ── Load occasions (lazy, first time tab is opened) ───────────────────────
  useEffect(() => {
    if (view !== "occasions" || occasionsLoaded) return;
    loadOccasions(user.uid)
      .then((data) => {
        setOccasions(data);
        setOccasionsLoaded(true);
      })
      .catch((err) => {
        console.error("Failed to load occasions:", err);
        toast?.("Failed to load occasions.", "error");
        setOccasionsLoaded(true);
      });
  }, [view, occasionsLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load expenses for selected occasion ───────────────────────────────────
  useEffect(() => {
    if (!selectedOccasion) return;
    setOccasionExpensesLoading(true);
    loadOccasionExpenses(user.uid, selectedOccasion.id)
      .then((data) => {
        setOccasionExpenses(data);
        setOccasionExpensesLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load occasion expenses:", err);
        toast?.("Failed to load expenses.", "error");
        setOccasionExpensesLoading(false);
      });
  }, [selectedOccasion?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ──────────────────────────────────────────────────────────────
  function cycleTheme() {
    const next =
      THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length];
    setTheme(next);
    persistTheme(next);
  }

  function openAddModal() {
    setAddingToOccasion(false);
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

  function openAddModalForOccasion() {
    setAddingToOccasion(true);
    setEditingExpense(null);
    setOccasionDate(getTodayStr());
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

  function openEditModal(expense, context) {
    setEditingExpense(expense);
    setEditContext(context);
    setAddingToOccasion(context === "occasion-expense");
    if (context === "occasion-expense") {
      setOccasionDate(expense.date);
    }
    setForm({
      amount: String(expense.amount),
      time: expense.time,
      description: expense.description,
      category: expense.category,
      type: expense.type || "expense",
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

    if (editingExpense) {
      // ── Edit existing record ──
      const updated = {
        ...editingExpense,
        amount: parseFloat(form.amount),
        time: form.time,
        date: addingToOccasion ? occasionDate : selectedDate,
        description: form.description.trim(),
        category: form.category,
        type: form.type || "expense",
      };
      try {
        if (editContext === "occasion-expense" && selectedOccasion) {
          await updateOccasionExpense(user.uid, selectedOccasion.id, updated);
          setOccasionExpenses((prev) =>
            prev.map((e) => (e.id === updated.id ? updated : e)),
          );
        } else {
          await updateExpense(user.uid, updated);
          setExpenses((prev) =>
            prev.map((e) => (e.id === updated.id ? updated : e)),
          );
        }
        setShowModal(false);
        setEditingExpense(null);
        setAddingToOccasion(false);
        toast?.("Changes saved!", "success");
      } catch (err) {
        console.error("Failed to update record:", err);
        toast?.("Failed to save changes. Please try again.", "error");
      }
      setSavingExpense(false);
      return;
    }

    // ── Add new record ──
    const record = {
      id: uid(),
      amount: parseFloat(form.amount),
      time: form.time,
      date: addingToOccasion ? occasionDate : selectedDate,
      description: form.description.trim(),
      category: form.category,
      type: form.type || "expense",
    };
    try {
      if (addingToOccasion && selectedOccasion) {
        await addOccasionExpense(user.uid, selectedOccasion.id, record);
        setOccasionExpenses((prev) => [record, ...prev]);
      } else {
        await addExpense(user.uid, record);
        setExpenses((prev) => [record, ...prev]);
      }
      setShowModal(false);
      setAddingToOccasion(false);
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
    const item = confirmDelete;
    setConfirmDelete(null);

    // Deleting an entire occasion card
    if (deleteContext === "occasion-card") {
      setDeleteContext("daily");
      try {
        await deleteOccasion(user.uid, item.id);
        setOccasions((prev) => prev.filter((o) => o.id !== item.id));
        toast?.("Occasion deleted.", "success");
      } catch (err) {
        console.error("Delete occasion failed:", err);
        toast?.("Failed to delete occasion.", "error");
      }
      return;
    }

    // Deleting an expense (either daily or inside an occasion)
    setDeletingId(item.id);
    try {
      if (deleteContext === "occasion-expense" && selectedOccasion) {
        await deleteOccasionExpense(user.uid, selectedOccasion.id, item.id);
        setTimeout(() => {
          setOccasionExpenses((prev) => prev.filter((e) => e.id !== item.id));
          setDeletingId(null);
        }, 320);
      } else {
        await deleteExpense(user.uid, item.id);
        setTimeout(() => {
          setExpenses((prev) => prev.filter((e) => e.id !== item.id));
          setDeletingId(null);
        }, 320);
      }
    } catch (err) {
      console.error("Delete failed:", err);
      toast?.("Failed to delete. Please try again.", "error");
      setDeletingId(null);
    }
    setDeleteContext("daily");
  }

  async function handleCreateOccasion(occasionData) {
    setSavingOccasion(true);
    const newOccasion = { id: uid(), ...occasionData };
    try {
      await addOccasion(user.uid, newOccasion);
      setOccasions((prev) => [newOccasion, ...prev]);
      setShowAddOccasionModal(false);
      toast?.("Occasion created!", "success");
    } catch (err) {
      console.error("Failed to create occasion:", err);
      toast?.("Failed to create occasion.", "error");
    }
    setSavingOccasion(false);
  }

  function requestDeleteOccasionCard(occ) {
    setDeleteContext("occasion-card");
    setConfirmDelete(occ);
  }

  function requestDeleteOccasionExpense(expense) {
    setDeleteContext("occasion-expense");
    setConfirmDelete(expense);
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

        {featureFlags.TABS.occasions && (
          <button
            className={`et-tab${view === "occasions" ? " et-tab--active" : ""}`}
            onClick={() => { setView("occasions"); setSelectedOccasion(null); }}
          >
            <i className="fa fa-layer-group" /> Occasions
            {occasions.length > 0 && (
              <span className="et-tab-badge">{occasions.length}</span>
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
            onEditRequest={(expense) => openEditModal(expense, "daily")}
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

        {view === "occasions" && !selectedOccasion && (
          <OccasionsView
            occasions={occasions}
            loading={!occasionsLoaded}
            onSelectOccasion={(occ) => {
              setSelectedOccasion(occ);
              setOccasionExpenses([]);
            }}
            onInfoOccasion={setInfoOccasion}
            onNewOccasion={() => setShowAddOccasionModal(true)}
          />
        )}

        {view === "occasions" && selectedOccasion && (
          <OccasionDetailView
            occasion={selectedOccasion}
            expenses={occasionExpenses}
            loading={occasionExpensesLoading}
            deletingId={deletingId}
            enableIncomeTracking={featureFlags.ENABLE_INCOME_TRACKING}
            onBack={() => setSelectedOccasion(null)}
            onAddExpense={openAddModalForOccasion}
            onEditRequest={(expense) => openEditModal(expense, "occasion-expense")}
            onDeleteRequest={requestDeleteOccasionExpense}
          />
        )}
      </div>

      {/* ── Floating add button ── */}
      <button
        className="et-fab"
        onClick={() => {
          if (view === "occasions") {
            if (selectedOccasion) openAddModalForOccasion();
            else setShowAddOccasionModal(true);
          } else {
            openAddModal();
          }
        }}
        title={view === "occasions" ? (selectedOccasion ? "Add expense to occasion" : "New occasion") : "Add expense"}
      >
        <i className="fa fa-plus" />
      </button>

      {/* ── Modals ── */}
      {showModal && (
        <AddExpenseModal
          onClose={() => { setShowModal(false); setAddingToOccasion(false); setEditingExpense(null); }}
          form={form}
          setForm={setForm}
          formErrors={formErrors}
          setFormErrors={setFormErrors}
          selectedDate={addingToOccasion ? occasionDate : selectedDate}
          onDateChange={addingToOccasion ? setOccasionDate : setSelectedDate}
          onSubmit={handleAddExpense}
          savingExpense={savingExpense}
          enableIncomeTracking={featureFlags.ENABLE_INCOME_TRACKING}
          isEditing={!!editingExpense}
        />
      )}

      {showAddOccasionModal && (
        <AddOccasionModal
          onClose={() => setShowAddOccasionModal(false)}
          onSubmit={handleCreateOccasion}
          saving={savingOccasion}
        />
      )}

      <OccasionInfoModal
        occasion={infoOccasion}
        onClose={() => setInfoOccasion(null)}
        onDelete={(occ) => { setInfoOccasion(null); requestDeleteOccasionCard(occ); }}
      />

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
