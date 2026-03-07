import { useState } from "react";
import {
  CATEGORIES,
  CURRENCY,
  getTodayStr,
  getCurrentTimeStr,
} from "./constants";
import { uid } from "../utils/helpers";

export default function AddGroupExpenseModal({
  onClose,
  onSubmit,
  saving,
  members,
  editingExpense,
  user,
  group,
}) {
  const isAdmin = group.adminUID === user.uid;
  const selfMember = members.find((m) => m.isSelf) || members[0];
  const isEditing = !!editingExpense;

  const [form, setForm] = useState({
    amount: isEditing ? String(editingExpense.amount) : "",
    description: isEditing ? editingExpense.description : "",
    category: isEditing ? editingExpense.category : "food",
    date: isEditing ? editingExpense.date : getTodayStr(),
    time: isEditing ? editingExpense.time : getCurrentTimeStr(),
    // paidBy: isEditing ? editingExpense.paidBy : selfMember?.uid || "",
    paidBy: user.uid,
    splitAmong: isEditing
      ? editingExpense.splitAmong
      : members.map((m) => m.uid),
  });
  const [errors, setErrors] = useState({});
  const [isAllSplitMembersSelected, setAllSplitMemberSelected] = useState(true);
  function toggleSplit(uid) {
    setForm((f) => {
      const has = f.splitAmong.includes(uid);
      if (has && f.splitAmong.length === 1) return f;
      return {
        ...f,
        splitAmong: has
          ? f.splitAmong.filter((x) => x !== uid)
          : [...f.splitAmong, uid],
      };
    });
    setErrors((e) => ({ ...e, splitAmong: null }));
  }

  function selectAll(isAll) {
    if (isAll) {
      setForm((f) => ({ ...f, splitAmong: members.map((m) => m.uid) }));
      setAllSplitMemberSelected(true);
    } else {
      setForm((f) => ({ ...f, splitAmong: [user.uid] }));
      setAllSplitMemberSelected(false);
    }
  }

  const perPersonShare =
    form.splitAmong.length > 0 && parseFloat(form.amount) > 0
      ? (parseFloat(form.amount) / form.splitAmong.length).toFixed(2)
      : null;

  function handleSubmit() {
    const errs = {};
    const amt = parseFloat(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0)
      errs.amount = "Enter a valid positive amount";
    if (!form.description.trim()) errs.description = "Description is required";
    if (form.splitAmong.length === 0)
      errs.splitAmong = "Select at least one member";
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    onSubmit({
      id: isEditing ? editingExpense.id : uid(),
      amount: amt,
      description: form.description.trim(),
      category: form.category,
      date: form.date,
      time: form.time,
      paidBy: form.paidBy,
      splitAmong: form.splitAmong,
    });
  }

  function memberLabel(m) {
    // return m.isSelf ? "You" : m.name;
    return m.uid === user.uid ? "You" : m.name;
  }

  return (
    <div className="et-modal-overlay" onClick={onClose}>
      <div
        className="et-modal et-modal--tall"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="et-modal-header">
          <div className="et-modal-title-wrap">
            <span>💸</span>
            <h2>{isEditing ? "Edit Expense" : "Add Group Expense"}</h2>
          </div>
          <button className="et-modal-close" onClick={onClose}>
            <i className="fa fa-xmark" />
          </button>
        </div>

        <div className="et-modal-body">
          {/* Paid by */}
          <div className="et-form-group">
            <label>Paid by</label>
            <div
              className="et-grp-member-btns"
              style={{ borderColor: "green !important" }}
            >
              <button
                key={user.uid}
                type="button"
                className={`et-grp-member-btn et-grp-member-btn--selected`}
                onClick={() => setForm((f) => ({ ...f, paidBy: user.uid }))}
                disabled={true}
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt=""
                    className="et-user-avatar"
                    referrerPolicy="no-referrer"
                    style={{ width: 18, height: 18 }}
                  />
                ) : user.isSelf ? (
                  "🧑"
                ) : (
                  "👤"
                )}{" "}
                You
              </button>

              {/* {members.map(
                (m) =>
                  m.uid === user.uid && (
                    <button
                      key={m.uid}
                      type="button"
                      className={`et-grp-member-btn${form.paidBy === m.uid ? " et-grp-member-btn--selected" : ""}`}
                      onClick={() => setForm((f) => ({ ...f, paidBy: m.uid }))}
                      disabled={true}
                    >
                      {m.photoURL ? (
                        <img
                          src={m.photoURL}
                          alt=""
                          className="et-user-avatar"
                          referrerPolicy="no-referrer"
                          style={{ width: 18, height: 18 }}
                        />
                      ) : m.isSelf ? (
                        "🧑"
                      ) : (
                        "👤"
                      )}{" "}
                      {memberLabel(m)}
                    </button>
                  ),
              )} */}
            </div>
          </div>

          {/* Split among */}
          <div className="et-form-group">
            <div className="et-split-label-row">
              <label>Split among</label>
              <button
                type="button"
                className="et-split-all-btn"
                onClick={() => selectAll(!isAllSplitMembersSelected)}
              >
                {isAllSplitMembersSelected ? "Unselect All" : "Select All"}
              </button>
            </div>
            <div className="et-grp-member-btns">
              {members.map((m) => (
                <button
                  key={m.uid}
                  type="button"
                  className={`et-grp-member-btn${form.splitAmong.includes(m.uid) ? " et-grp-member-btn--selected" : ""}`}
                  onClick={() => toggleSplit(m.uid)}
                >
                  <input
                    type="checkbox"
                    checked={form.splitAmong.includes(m.uid)}
                  />
                  {m.photoURL ? (
                    <img
                      src={m.photoURL}
                      alt=""
                      className="et-user-avatar"
                      referrerPolicy="no-referrer"
                      style={{ width: 18, height: 18 }}
                    />
                  ) : m.isSelf ? (
                    "🧑"
                  ) : (
                    "👤"
                  )}{" "}
                  {memberLabel(m)}
                </button>
              ))}
            </div>
            {perPersonShare && (
              <div className="et-split-info">
                <i className="fa fa-equals" /> Each pays:{" "}
                <strong>
                  {CURRENCY} {perPersonShare}
                </strong>{" "}
                ({form.splitAmong.length} people)
              </div>
            )}
            {errors.splitAmong && (
              <span className="et-field-error">
                <i className="fa fa-circle-exclamation" /> {errors.splitAmong}
              </span>
            )}
          </div>
          {/* Amount */}
          <div className="et-form-group et-form-group--large">
            <label htmlFor="et-ge-amount">Amount</label>
            <div className="et-amount-wrap">
              <span className="et-currency-prefix">{CURRENCY}</span>
              <input
                id="et-ge-amount"
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(e) => {
                  setForm((f) => ({ ...f, amount: e.target.value }));
                  setErrors((er) => ({ ...er, amount: null }));
                }}
                placeholder="0.00"
                className={`et-input et-amount-input${errors.amount ? " et-input--error" : ""}`}
                autoFocus
              />
            </div>
            {errors.amount && (
              <span className="et-field-error">
                <i className="fa fa-circle-exclamation" /> {errors.amount}
              </span>
            )}
 
          </div>

          {/* Description */}
          <div className="et-form-group">
            <label htmlFor="et-ge-desc">Description</label>
            <input
              id="et-ge-desc"
              type="text"
              value={form.description}
              onChange={(e) => {
                setForm((f) => ({ ...f, description: e.target.value }));
                setErrors((er) => ({ ...er, description: null }));
              }}
              placeholder="e.g. Ice cream, Hotel bill, Taxi…"
              maxLength={100}
              className={`et-input${errors.description ? " et-input--error" : ""}`}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
            />
            {errors.description && (
              <span className="et-field-error">
                <i className="fa fa-circle-exclamation" /> {errors.description}
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

          {/* Date + Time */}
          <div className="et-form-row">
            <div className="et-form-group">
              <label htmlFor="et-ge-time">Time</label>
              <input
                id="et-ge-time"
                type="time"
                value={form.time}
                onChange={(e) =>
                  setForm((f) => ({ ...f, time: e.target.value }))
                }
                className="et-input"
              />
            </div>
            <div className="et-form-group">
              <label>Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
                className="et-input"
              />
            </div>
          </div>
        </div>

        <div className="et-modal-footer">
          <button className="et-btn et-btn--cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="et-btn et-btn--add"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <span className="et-btn-spinner" />
            ) : (
              <i className={`fa fa-${isEditing ? "pen" : "plus"}`} />
            )}
            {saving
              ? isEditing
                ? "Saving…"
                : "Adding…"
              : isEditing
                ? "Save Changes"
                : "Add Expense"}
          </button>
        </div>
      </div>
    </div>
  );
}
