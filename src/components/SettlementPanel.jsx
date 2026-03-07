import { capitalizeEachWord } from "../utils/helpers";
import { formatCurrency } from "./constants";

export default function SettlementPanel({ settlements, members, selfUID }) {
  if (settlements.length === 0) {
    return (
      <div className="et-settle-all-good">
        <span className="et-settle-good-icon">🎉</span>
        <p className="et-settle-good-text">All settled up!</p>
        <p className="et-settle-good-sub">No outstanding balances.</p>
      </div>
    );
  }

  function memberName(uid) {
    const m = members.find((x) => x.uid === uid);
    if (!m) return "Unknown";
    return m.uid === selfUID ? "You" : capitalizeEachWord(m.name);
  }

  function isSelfInvolved(t) {
    return t.from === selfUID || t.to === selfUID;
  }

  function memberPhoto(uid) {
    return members.find((m) => m.uid === uid)?.photoURL ?? null;
  }

  return (
    <div className="et-settlement-panel">
      <h3 className="et-section-title">Settlement</h3>
      <p className="et-settle-subtitle">
        Minimum transactions needed to settle all balances
      </p>
      <div className="et-settle-list">
        {settlements.map((t, i) => {
          const you = isSelfInvolved(t);
          const fromPhoto = memberPhoto(t.from);
          const toPhoto = memberPhoto(t.to);
          return (
            <div
              key={i}
              className={`et-settle-row${you ? " et-settle-row--you" : ""}`}
            >
              <div className="et-settle-from">
                <span className="et-settle-avatar">
                  {fromPhoto ? (
                    <img src={fromPhoto} alt="" className="et-user-avatar" referrerPolicy="no-referrer" />
                  ) : t.from === selfUID ? "🧑" : "👤"}
                </span>
                <span className="et-settle-name">{memberName(t.from)}</span>
              </div>
              <div className="et-settle-mid">
                <span className="et-settle-arrow">
                  <i className="fa fa-arrow-right" />
                </span>
                <span className="et-settle-amount">{formatCurrency(t.amount)}</span>
              </div>
              <div className="et-settle-to">
                <span className="et-settle-avatar">
                  {toPhoto ? (
                    <img src={toPhoto} alt="" className="et-user-avatar" referrerPolicy="no-referrer" />
                  ) : t.to === selfUID ? "🧑" : "👤"}
                </span>
                <span className="et-settle-name">{memberName(t.to)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
