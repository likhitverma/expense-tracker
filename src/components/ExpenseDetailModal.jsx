import { capitalizeEachWord } from "../utils/helpers";
import {
  CATEGORIES,
  INCOME_CATEGORIES,
  formatCurrency,
  formatTime,
  formatDisplayDate,
} from "./constants";

export default function ExpenseDetailModal({
  isGroupExpense,
  members,
  expense,
  user,
  onDelete,
  onClose,
  onEditRequest,
  canEdit,
}) {
  if (!expense) return null;

  const showEditButton = !isGroupExpense
    ? true
    : isGroupExpense && canEdit
      ? true
      : false;

  console.log("expense==>", expense);
  const isIncome = expense.type === "income";
  const catList = isIncome ? INCOME_CATEGORIES : CATEGORIES;
  const cat =
    catList.find((c) => c.id === expense.category) ||
    catList[catList.length - 1];

  function memberName(uid) {
    const m = members.find((x) => x.uid === uid);
    if (!m) return "Unknown";
    return m.uid === user.uid ? (
      <span class="et-grp-exp-debt-badge">You</span>
    ) : (
      <span class="et-grp-exp-debt-badge">{capitalizeEachWord(m.name)}</span>
    );
  }

  function splitLabel(splitAmong) {
    if (splitAmong.length === members.length)
      return <span class="et-grp-exp-debt-badge">Everyone</span>;
    // if (splitAmong.length <= 3) return splitAmong.map(memberName).join(", ");
    // return `${splitAmong.map(memberName).join(", ")}`;
    return splitAmong.map(memberName);
  }

  return (
    <div className="et-modal-overlay" onClick={onClose}>
      <div
        className={`et-modal et-modal--detail${isIncome ? " et-modal--income" : ""}`}
        onClick={(e) => e.stopPropagation()}
        style={{ "--cat-color": isIncome ? "#10b981" : cat.color }}
      >
        {/* ── Close button ── */}
        <div className="et-modal-header">
          <div className="et-modal-title-wrap">
            <span>{cat.icon}</span>
            <h2>{isIncome ? "Income Details" : "Expense Details"}</h2>
          </div>
          <button className="et-modal-close" onClick={onClose}>
            <i className="fa fa-xmark" />
          </button>
        </div>

        {/* ── Type badge ── */}
        <div className="et-detail-type-row">
          <span
            className={`et-detail-type-badge${isIncome ? " et-detail-type-badge--income" : " et-detail-type-badge--expense"}`}
          >
            <i className={`fa fa-arrow-trend-${isIncome ? "up" : "down"}`} />
            {isIncome ? "Income Received" : "Expense"}
          </span>
        </div>

        {/* ── Amount hero ── */}
        <div
          className={`et-detail-hero${isIncome ? " et-detail-hero--income" : ""}`}
          style={{ borderColor: isIncome ? "#10b981" : cat.color }}
        >
          <div className="et-detail-cat-icon">{cat.icon}</div>
          <div
            className="et-detail-amount"
            style={{ color: isIncome ? "#10b981" : cat.color }}
          >
            {isIncome ? "+" : ""}
            {formatCurrency(expense.amount)}
          </div>
          <div className="et-detail-cat-label">{cat.label}</div>
        </div>

        {/* ── Info rows ── */}
        <div className="et-detail-rows">
          {isGroupExpense && (
            <div className="et-grp-split-row">
              <span className="et-grp-paidby">
                <i className="fa fa-hand-holding-dollar" />{" "}
                {memberName(expense.paidBy)}
              </span>
              <span className="et-grp-split-dot">paid to</span>
              <span className="et-grp-split-info flex-row-wrap">
                {splitLabel(expense.splitAmong ?? [])}
              </span>
            </div>
          )}
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
              <div className="et-detail-row-value">
                {formatDisplayDate(expense.date)}
              </div>
            </div>
          </div>

          <div className="et-detail-row">
            <span className="et-detail-row-icon">
              <i className="fa fa-clock" />
            </span>
            <div>
              <div className="et-detail-row-label">Time</div>
              <div className="et-detail-row-value">
                {formatTime(expense.time)}
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="et-modal-footer">
          <button className="et-btn et-btn--cancel" onClick={onClose}>
            Close
          </button>
          {/* {!isGroupExpense && (
            <button
              className="et-btn et-btn"
              onClick={() => {
                onClose();
                onEditRequest(expense);
              }}
            >
              <i className="fa fa-edit" /> Edit
            </button>
          )}

          {isGroupExpense && canEdit && (
            <button
              className="et-btn et-btn"
              onClick={() => {
                onClose();
                onEditRequest(expense);
              }}
            >
              <i className="fa fa-edit" /> Edit
            </button>
          )} */}

          {showEditButton && (
            <button
              className="et-btn et-btn"
              onClick={() => {
                onClose();
                onEditRequest(expense);
              }}
            >
              <i className="fa fa-edit" /> Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
