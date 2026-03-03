import { formatCurrency, formatDisplayDate, formatShortDate } from "./constants";

export default function MonthlyView({
  monthlyData,
  overallTotal,
  totalExpenseCount,
  todayStr,
  expandedMonth,
  onToggleMonth,
  onDrillDay,
  onSwitchToDaily,
}) {
  return (
    <div className="et-monthly-view">
      {/* ── All-time hero banner ── */}
      <div className="et-monthly-hero">
        <span className="et-monthly-hero-label">Total All-Time Spend</span>
        <span className="et-monthly-hero-amount">
          {formatCurrency(overallTotal)}
        </span>
        <span className="et-monthly-hero-count">
          {totalExpenseCount} transactions across {monthlyData.length} month
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
          <button className="et-empty-cta" onClick={onSwitchToDaily}>
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
                  onClick={() => onToggleMonth(month.monthStr)}
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
                        onClick={() => onDrillDay(day.date)}
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
  );
}
