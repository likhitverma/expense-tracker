import {
  CATEGORIES,
  formatCurrency,
  formatShortDate,
  formatTime,
} from "./constants";
import SettlementPanel from "./SettlementPanel";
import { computeBalances, settleDebts } from "../utils/groupSettlement";

export default function GroupDetailView({
  group,
  expenses,
  loading,
  deletingId,
  user,
  onBack,
  onAddExpense,
  onDeleteExpense,
  onEditExpense,
  onEditGroup,
  onManageMembers,
  loadExpensesForSelectedGroup
}) {
  const { members } = group;
  const isAdmin = group.adminUID === user.uid;
  const selfMember = members.find((m) => m.uid === user.uid);

  // ── Settlement computation (client-side, derived from expenses) ────────────
  const balances = computeBalances(members, expenses);
  const settlements = settleDebts(members, balances, user.uid);
  const selfBalance = selfMember ? (balances[selfMember.uid] ?? 0) : 0;
  const totalSpent = expenses.reduce((s, e) => s + (e.amount || 0), 0);

  console.log("Expenses-->", expenses);
  console.log("members-->", members);
  function getCat(expense) {
    return (
      CATEGORIES.find((c) => c.id === expense.category) ||
      CATEGORIES[CATEGORIES.length - 1]
    );
  }

  function memberName(uid) {
    const m = members.find((x) => x.uid === uid);
    if (!m) return "Unknown";
    return m.uid === user.uid ? "You" : m.name;
  }

  function splitLabel(splitAmong) {
    if (splitAmong.length === members.length) return "Everyone";
    if (splitAmong.length <= 3) return splitAmong.map(memberName).join(", ");
    return `${splitAmong.slice(0, 2).map(memberName).join(", ")} +${splitAmong.length - 2}`;
  }

  if (loading) {
    return (
      <div className="et-grp-detail">
        <button className="et-occ-back-btn" onClick={onBack}>
          <i className="fa fa-arrow-left" /> All Groups
        </button>
        <div className="et-loading" style={{ minHeight: 200 }}>
          <div className="et-spinner" />
          <span>Loading expenses…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="et-grp-detail">
      <div className="et-grp-nav-buttons">
        {/* Back */} 
        <button className="et-occ-back-btn" onClick={onBack}>
          <i className="fa fa-arrow-left" /> All Groups
        </button>

        {/* Referesh Data */}
        <button className="et-occ-back-btn grp-ref-btn" onClick={loadExpensesForSelectedGroup}>
          <i className="fa fa-refresh" /> Referesh
        </button>
      </div>
      {/* Hero */}
      <div className="et-grp-detail-hero">
        <span className="et-grp-detail-emoji">{group.emoji}</span>
        <div className="et-grp-detail-hero-text">
          <h2 className="et-grp-detail-name">{group.name}</h2>
          {group.description && (
            <p className="et-grp-detail-desc">{group.description}</p>
          )}
        </div>
        {isAdmin && (
          <div className="et-grp-admin-actions">
            <button
              className="et-icon-btn"
              onClick={onEditGroup}
              title="Edit group info"
            >
              <i className="fa fa-pen" />
            </button>
            <button
              className="et-icon-btn"
              onClick={onManageMembers}
              title="Manage members"
            >
              <i className="fa fa-users-gear" />
            </button>
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className="et-summary">
        <div
          className={`et-summary-card${selfBalance >= 0 ? " et-card-net--positive" : " et-card-net--negative"}`}
        >
          <span className="et-card-icon">{selfBalance >= 0 ? "💚" : "🔴"}</span>
          <div>
            <div className="et-card-label">Your Balance</div>
            <div
              className={`et-card-amount${selfBalance >= 0 ? " et-card-amount--positive" : " et-card-amount--negative"}`}
            >
              {selfBalance >= 0 ? "+" : ""}
              {formatCurrency(selfBalance)}
            </div>
            <div className="et-card-count">
              {selfBalance > 0.005
                ? "others owe you"
                : selfBalance < -0.005
                  ? "you owe others"
                  : "all settled"}
            </div>
          </div>
        </div>

        <div className="et-summary-card et-card-spent">
          <span className="et-card-icon">💸</span>
          <div>
            <div className="et-card-label">Total Spent</div>
            <div className="et-card-amount">{formatCurrency(totalSpent)}</div>
            <div className="et-card-count">
              {expenses.length} expense{expenses.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>

      {/* Settlement summary */}
      {expenses.length > 0 && (
        <SettlementPanel
          settlements={settlements}
          members={members}
          selfUID={user.uid}
        />
      )}
      {/* Members bar */}
      <div className="et-grp-members-bar">
        <div className="et-grp-members-label">
          <i className="fa fa-users" /> {members.length} Members
        </div>
        <div className="et-grp-member-avatars">
          {members.map((m) => {
            const bal = balances[m.uid] ?? 0;
            const isSelf = m.uid === user.uid;
            return (
              <div
                key={m.uid}
                className={`et-grp-avatar-wrap${isSelf ? " et-grp-avatar-wrap--self" : ""}`}
                title={`${isSelf ? "You" : m.name}: ${bal >= 0 ? "+" : ""}${formatCurrency(bal)}`}
              >
                <div
                  className={`et-grp-avatar${bal > 0.005 ? " et-grp-avatar--positive" : bal < -0.005 ? " et-grp-avatar--negative" : ""}`}
                >
                  {m.photoURL ? (
                    <img
                      src={m.photoURL}
                      alt=""
                      className="et-user-avatar"
                      referrerPolicy="no-referrer"
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                      }}
                    />
                  ) : isSelf ? (
                    "🧑"
                  ) : (
                    "👤"
                  )}
                </div>
                <div className="et-grp-avatar-name">
                  {isSelf ? "You" : m.name.split(" ")[0]}
                </div>
                <div
                  className={`et-grp-avatar-bal${bal > 0.005 ? " pos" : bal < -0.005 ? " neg" : ""}`}
                >
                  {bal > 0.005 ? "+" : ""}
                  {bal !== 0 ? formatCurrency(Math.abs(bal)) : "✓"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expense list */}
      <div className="et-list-section">
        <h3 className="et-section-title">
          Expenses
          {expenses.length > 0 && (
            <span className="et-count-badge">{expenses.length}</span>
          )}
        </h3>

        {expenses.length === 0 ? (
          <div className="et-empty">
            <div className="et-empty-icon">💸</div>
            <p className="et-empty-title">No expenses yet</p>
            <p className="et-empty-sub">
              Tap the + button to record the first expense for this group
            </p>
            <button className="et-empty-cta" onClick={onAddExpense}>
              <i className="fa fa-plus" /> Add Expense
            </button>
          </div>
        ) : (
          <div className="et-expense-list">
            {[...expenses]
              .sort((a, b) => {
                const dc = b.date.localeCompare(a.date);
                return dc !== 0 ? dc : b.time.localeCompare(a.time);
              })
              .map((expense) => {
                const cat = getCat(expense);
                const share =
                  expense.splitAmong?.length > 0
                    ? expense.amount / expense.splitAmong.length
                    : 0;
                const selfInSplit = selfMember
                  ? expense.splitAmong?.includes(selfMember.uid)
                  : false;
                const paidByMe = selfMember
                  ? expense.paidBy === selfMember.uid
                  : false;

                // const paidByMe = expense.addedBy === user.uid;
                const canEdit = expense.addedBy === user.uid;

                return (
                  <div
                    key={expense.id}
                    className={`et-grp-expense-card${deletingId === expense.id ? " et-deleting" : ""}`}
                    style={{ "--cat-color": cat.color }}
                  >
                    <div className="et-exp-cat-icon">{cat.icon}</div>
                    <div className="et-exp-info">
                      <div className="et-exp-top-row">
                        <div className="et-exp-desc">{expense.description}</div>
                        {paidByMe && (
                          <span className="et-grp-paid-badge">You paid</span>
                        )}
                      </div>
                      <div className="et-grp-split-row">
                        <span className="et-grp-paidby">
                          <i className="fa fa-hand-holding-dollar" />{" "}
                          {memberName(expense.paidBy)}
                          {/* {memberName(expense.addedBy)} */}
                        </span>
                        <span className="et-grp-split-dot">to</span>
                        <span className="et-grp-split-info">
                          {splitLabel(expense.splitAmong ?? [])}
                        </span>
                      </div>
                      {selfInSplit && (
                        <div className="et-grp-your-share">
                          Your share: <strong>{formatCurrency(share)}</strong>
                        </div>
                      )}
                      <div
                        className="et-exp-time"
                        style={{ fontSize: "0.6rem" }}
                      >
                        <i className="fa fa-calendar" />{" "}
                        {formatShortDate(expense.date)} ·{" "}
                        <i className="fa fa-clock" /> {formatTime(expense.time)}
                      </div>
                    </div>
                    <div className="et-grp-expense-right">
                      <div className="et-exp-amount">
                        {formatCurrency(expense.amount)}
                      </div>
                      {canEdit && (
                        <div className="et-exp-actions">
                          <button
                            className="et-edit-btn"
                            onClick={() => onEditExpense(expense)}
                            title="Edit"
                          >
                            <i className="fa fa-pen" />
                          </button>
                          <button
                            className="et-del-btn"
                            onClick={() => onDeleteExpense(expense)}
                            title="Delete"
                          >
                            <i className="fa fa-trash" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
