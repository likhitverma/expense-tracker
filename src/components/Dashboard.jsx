import { useMemo } from "react";
import { CATEGORIES, formatCurrency, formatMonthLabel } from "./constants";

export default function Dashboard({
  expenses,
  monthlyData,
  overallSpent,
  overallEarned,
  enableIncomeTracking,
}) {
  const overallNet = overallEarned - overallSpent;

  // Top 5 expense categories (all-time)
  const topCategories = useMemo(() => {
    const totals = CATEGORIES.map((cat) => ({
      ...cat,
      total: expenses
        .filter(
          (e) => (e.type || "expense") === "expense" && e.category === cat.id,
        )
        .reduce((s, e) => s + (e.amount || 0), 0),
    }))
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
    return totals;
  }, [expenses]);

  // Last 6 months for trend
  const last6 = monthlyData.slice(0, 6).reverse();
  const maxVal =
    last6.length > 0
      ? Math.max(...last6.map((m) => Math.max(m.spent, m.earned || 0)), 1)
      : 1;

  const topCatMax = topCategories.length > 0 ? topCategories[0].total : 1;

  // Quick stats
  const thisMonthData = monthlyData[0];
  const biggestExpense = useMemo(() => {
    const exps = expenses.filter((e) => (e.type || "expense") === "expense");
    if (!exps.length) return null;
    return exps.reduce((a, b) => (b.amount > a.amount ? b : a));
  }, [expenses]);

  if (expenses.length === 0) {
    return (
      <div className="et-dashboard">
        <div className="et-empty">
          <div className="et-empty-icon">📊</div>
          <p className="et-empty-title">No data yet</p>
          <p className="et-empty-sub">
            Add some expenses or income to see your dashboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="et-dashboard">
      {/* ── Overview cards ── */}
      <h3 className="et-section-title">Overview</h3>
      <div className="et-dash-overview">
        <div className="et-dash-card et-dash-card--spent">
          <div className="et-dash-card-icon">💸</div>
          <div className="et-dash-card-label">Total Spent</div>
          <div className="et-dash-card-amount">{formatCurrency(overallSpent)}</div>
        </div>
        {enableIncomeTracking && (
          <div className="et-dash-card et-dash-card--earned">
            <div className="et-dash-card-icon">💰</div>
            <div className="et-dash-card-label">Total Earned</div>
            <div className="et-dash-card-amount et-dash-card-amount--green">
              {formatCurrency(overallEarned)}
            </div>
          </div>
        )}
        {enableIncomeTracking && (
          <div
            className={`et-dash-card${overallNet >= 0 ? " et-dash-card--positive" : " et-dash-card--negative"}`}
          >
            <div className="et-dash-card-icon">{overallNet >= 0 ? "📈" : "📉"}</div>
            <div className="et-dash-card-label">Net Balance</div>
            <div
              className={`et-dash-card-amount${overallNet >= 0 ? " et-dash-card-amount--green" : " et-dash-card-amount--red"}`}
            >
              {overallNet >= 0 ? "+" : ""}
              {formatCurrency(overallNet)}
            </div>
          </div>
        )}
        <div className="et-dash-card et-dash-card--count">
          <div className="et-dash-card-icon">🧾</div>
          <div className="et-dash-card-label">Transactions</div>
          <div className="et-dash-card-amount">{expenses.length}</div>
        </div>
      </div>

      {/* ── Monthly trend ── */}
      {last6.length > 0 && (
        <div className="et-dash-section">
          <h3 className="et-section-title">
            Monthly Trend
            <span className="et-dash-legend">
              <span className="et-legend-dot et-legend-dot--spent" /> Spent
              {enableIncomeTracking && (
                <>
                  <span className="et-legend-dot et-legend-dot--earned" /> Earned
                </>
              )}
            </span>
          </h3>
          <div className="et-trend-list">
            {last6.map((month) => (
              <div key={month.monthStr} className="et-trend-row">
                <div className="et-trend-label">
                  {formatMonthLabel(month.monthStr).split(" ")[0].slice(0, 3)}{" "}
                  {month.monthStr.slice(2, 4)}
                </div>
                <div className="et-trend-bars">
                  <div className="et-trend-bar-track">
                    <div
                      className="et-trend-bar-fill et-trend-bar-fill--spent"
                      style={{ width: `${(month.spent / maxVal) * 100}%` }}
                    />
                  </div>
                  {enableIncomeTracking && (
                    <div className="et-trend-bar-track">
                      <div
                        className="et-trend-bar-fill et-trend-bar-fill--earned"
                        style={{
                          width: `${((month.earned || 0) / maxVal) * 100}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="et-trend-val">{formatCurrency(month.spent)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Top spending categories ── */}
      {topCategories.length > 0 && (
        <div className="et-dash-section">
          <h3 className="et-section-title">Top Categories (All-Time)</h3>
          <div className="et-dash-cat-list">
            {topCategories.map((cat, i) => (
              <div
                key={cat.id}
                className="et-dash-cat-row"
                style={{ "--cat-color": cat.color }}
              >
                <span className="et-dash-cat-rank">#{i + 1}</span>
                <span className="et-dash-cat-icon">{cat.icon}</span>
                <span className="et-dash-cat-name">{cat.label}</span>
                <div className="et-dash-cat-bar-wrap">
                  <div
                    className="et-dash-cat-bar-fill"
                    style={{ width: `${(cat.total / topCatMax) * 100}%` }}
                  />
                </div>
                <span className="et-dash-cat-amt">
                  {formatCurrency(cat.total)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Quick stats ── */}
      <div className="et-dash-section">
        <h3 className="et-section-title">Quick Stats</h3>
        <div className="et-dash-stats">
          {thisMonthData && (
            <div className="et-dash-stat">
              <div className="et-dash-stat-label">This Month Spent</div>
              <div className="et-dash-stat-value">
                {formatCurrency(thisMonthData.spent)}
              </div>
              <div className="et-dash-stat-sub">
                {thisMonthData.count} transactions
              </div>
            </div>
          )}
          {biggestExpense && (
            <div className="et-dash-stat">
              <div className="et-dash-stat-label">Biggest Expense</div>
              <div className="et-dash-stat-value">
                {formatCurrency(biggestExpense.amount)}
              </div>
              <div className="et-dash-stat-sub">
                {biggestExpense.description || biggestExpense.category}
              </div>
            </div>
          )}
          <div className="et-dash-stat">
            <div className="et-dash-stat-label">Months Tracked</div>
            <div className="et-dash-stat-value">{monthlyData.length}</div>
            <div className="et-dash-stat-sub">
              {monthlyData.length > 0
                ? `Since ${formatMonthLabel(monthlyData[monthlyData.length - 1].monthStr)}`
                : ""}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
