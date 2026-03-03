import "./DownloadModal.css";
import { useState, useMemo } from "react";
import jsPDF from "jspdf";

// ── Category label map (mirrors ExpenseTracker constants) ───────────────────
const CAT_LABELS = {
  food: "Food", fruits: "Fruits", transport: "Transport", fuel: "Fuel",
  shopping: "Shopping", bills: "Bills", Investment: "Investment",
  health: "Health", entertainment: "Entertainment", temple: "Temple",
  other: "Other",
};
function catLabel(id) {
  return CAT_LABELS[id] || id;
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().split("T")[0];
}
function currentMonthStr() {
  return todayStr().substring(0, 7);
}
function fmtMonth(monthStr) {
  return new Date(monthStr + "-01T00:00:00").toLocaleDateString("en-US", {
    month: "long", year: "numeric",
  });
}
function fmtLongDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}
function safeName(str) {
  return str.replace(/[^a-z0-9]/gi, "-").toLowerCase().replace(/-+/g, "-").slice(0, 50);
}

// ── File download trigger ────────────────────────────────────────────────────
function triggerDownload(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Period label for file names & headers ────────────────────────────────────
function periodLabel(rangeType, selectedMonth, specificDate, fromDate, toDate) {
  switch (rangeType) {
    case "current-month": return fmtMonth(currentMonthStr());
    case "specific-month": return selectedMonth ? fmtMonth(selectedMonth) : "Selected Month";
    case "specific-date":  return specificDate  ? fmtLongDate(specificDate) : "Selected Date";
    case "date-range":     return (fromDate && toDate) ? `${fromDate} to ${toDate}` : "Date Range";
    case "all-time":
    default:               return "All Time";
  }
}

// ── CSV export ───────────────────────────────────────────────────────────────
function exportCSV(filtered, label) {
  const total = filtered.reduce((s, e) => s + (e.amount || 0), 0);
  const rows = [
    ["Date", "Time", "Category", "Description", "Amount (INR)"],
    ...filtered.map((e) => [
      e.date,
      e.time,
      catLabel(e.category),
      `"${(e.description || "").replace(/"/g, '""')}"`,
      e.amount.toFixed(2),
    ]),
    ["", "", "", "TOTAL", total.toFixed(2)],
  ];
  triggerDownload(
    new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv;charset=utf-8;" }),
    `expenses-${safeName(label)}.csv`,
  );
}

// ── PDF export ───────────────────────────────────────────────────────────────
function exportPDF(filtered, label) {
  const doc  = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw   = doc.internal.pageSize.getWidth();
  const ph   = doc.internal.pageSize.getHeight();
  const M    = 14;
  const total = filtered.reduce((s, e) => s + (e.amount || 0), 0);

  // ─ Header strip ────────────────────────────────────────────────────────────
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, pw, 24, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont(undefined, "bold");
  doc.text("Expense Report", M, 12);
  doc.setFontSize(8);
  doc.setFont(undefined, "normal");
  doc.setTextColor(200, 200, 255);
  doc.text(`Period: ${label}`, M, 19);
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-IN")}`,
    pw - M, 19, { align: "right" },
  );

  // ─ Summary row ─────────────────────────────────────────────────────────────
  doc.setFontSize(11);
  doc.setFont(undefined, "bold");
  doc.setTextColor(30, 27, 75);
  doc.text(`Total: INR ${total.toFixed(2)}`, M, 34);
  doc.setFontSize(9);
  doc.setFont(undefined, "normal");
  doc.setTextColor(107, 114, 128);
  doc.text(
    `${filtered.length} transaction${filtered.length !== 1 ? "s" : ""}`,
    M, 40,
  );

  // ─ Table columns: Date(24) Time(14) Category(26) Description(78) Amount(30) ─
  const cols = [
    { header: "Date",         w: 24 },
    { header: "Time",         w: 14 },
    { header: "Category",     w: 26 },
    { header: "Description",  w: 78 },
    { header: "Amount (INR)", w: 30 },
  ];
  const tableW = cols.reduce((s, c) => s + c.w, 0);

  function drawTableHeader(y) {
    doc.setFillColor(79, 70, 229);
    doc.rect(M, y, tableW, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont(undefined, "bold");
    let x = M;
    cols.forEach((col) => { doc.text(col.header, x + 2, y + 5.5); x += col.w; });
  }

  let y = 46;
  drawTableHeader(y);
  y += 8;

  doc.setFont(undefined, "normal");

  filtered.forEach((e, idx) => {
    // Page break
    if (y > ph - 22) {
      doc.addPage();
      y = 14;
      drawTableHeader(y);
      y += 8;
      doc.setFont(undefined, "normal");
    }

    // Zebra stripe
    if (idx % 2 === 0) {
      doc.setFillColor(238, 242, 255);
      doc.rect(M, y, tableW, 7, "F");
    }

    doc.setTextColor(30, 27, 75);
    doc.setFontSize(8);

    const row = [
      e.date,
      e.time,
      catLabel(e.category),
      e.description || "-",
      e.amount.toFixed(2),
    ];

    let x = M;
    row.forEach((val, i) => {
      const clipped = doc.splitTextToSize(String(val), cols[i].w - 4)[0] || "";
      doc.text(clipped, x + 2, y + 5);
      x += cols[i].w;
    });

    y += 7;
  });

  // ─ Total footer ────────────────────────────────────────────────────────────
  if (filtered.length > 0) {
    if (y > ph - 20) { doc.addPage(); y = 14; }
    doc.setFillColor(224, 231, 255);
    doc.rect(M, y, tableW, 8, "F");
    doc.setFont(undefined, "bold");
    doc.setTextColor(30, 27, 75);
    doc.setFontSize(8.5);
    doc.text("TOTAL", M + 2, y + 5.5);
    const amtX = M + cols[0].w + cols[1].w + cols[2].w + cols[3].w;
    doc.text(`INR ${total.toFixed(2)}`, amtX + 2, y + 5.5);
  }

  doc.save(`expenses-${safeName(label)}.pdf`);
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
const RANGE_OPTIONS = [
  { id: "current-month", label: "Current Month", icon: "🗓️" },
  { id: "specific-month", label: "Pick Month",   icon: "📅" },
  { id: "specific-date",  label: "Single Day",   icon: "📆" },
  { id: "date-range",     label: "Date Range",   icon: "📊" },
  { id: "all-time",       label: "All Time",     icon: "🗂️" },
];

export default function DownloadModal({ expenses, onClose, toast }) {
  const today    = todayStr();
  const curMonth = currentMonthStr();

  const [rangeType,     setRangeType]     = useState("current-month");
  const [selectedMonth, setSelectedMonth] = useState(curMonth);
  const [specificDate,  setSpecificDate]  = useState(today);
  const [fromDate,      setFromDate]      = useState(curMonth + "-01");
  const [toDate,        setToDate]        = useState(today);

  // ── Available months derived from actual expense data ───────────────────
  const availableMonths = useMemo(() => {
    const set = new Set(expenses.map((e) => e.date.substring(0, 7)));
    const months = [...set].sort((a, b) => b.localeCompare(a));
    return months.length > 0 ? months : [curMonth];
  }, [expenses, curMonth]);

  // ── Filtered expenses ───────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result;
    switch (rangeType) {
      case "current-month":
        result = expenses.filter((e) => e.date.startsWith(curMonth));
        break;
      case "specific-month":
        result = expenses.filter((e) => e.date.startsWith(selectedMonth));
        break;
      case "specific-date":
        result = expenses.filter((e) => e.date === specificDate);
        break;
      case "date-range":
        result = expenses.filter((e) => e.date >= fromDate && e.date <= toDate);
        break;
      case "all-time":
      default:
        result = [...expenses].sort((a, b) => a.date.localeCompare(b.date));
    }
    return result;
  }, [rangeType, selectedMonth, specificDate, fromDate, toDate, expenses, curMonth]);

  const total = filtered.reduce((s, e) => s + (e.amount || 0), 0);
  const label = periodLabel(rangeType, selectedMonth, specificDate, fromDate, toDate);

  function handleDownload(format) {
    if (filtered.length === 0) {
      toast("No expenses found for the selected period.", "error");
      return;
    }
    if (format === "csv") {
      exportCSV(filtered, label);
      toast("Exported as CSV!", "success");
    } else {
      exportPDF(filtered, label);
      toast("Exported as PDF!", "success");
    }
    onClose();
  }

  const hasData = filtered.length > 0;

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal dl-modal">

        {/* ── Header ── */}
        <div className="modal-header">
          <div className="modal-icon" style={{ background: "#EEF2FF" }}>⬇️</div>
          <div className="modal-title">Export Expenses</div>
          <button className="modal-close" onClick={onClose}>
            <i className="fa fa-xmark" />
          </button>
        </div>

        {/* ── Range type selector ── */}
        <div className="dl-section-label">Date Range</div>
        <div className="dl-range-chips">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              className={`dl-chip${rangeType === opt.id ? " dl-chip--active" : ""}`}
              onClick={() => setRangeType(opt.id)}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>

        {/* ── Conditional date inputs ── */}
        <div className="dl-date-inputs">
          {rangeType === "specific-month" && (
            <div className="dl-input-group">
              <label className="dl-input-label">Select Month</label>
              <select
                className="dl-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {availableMonths.map((m) => (
                  <option key={m} value={m}>{fmtMonth(m)}</option>
                ))}
              </select>
            </div>
          )}

          {rangeType === "specific-date" && (
            <div className="dl-input-group">
              <label className="dl-input-label">Select Date</label>
              <input
                type="date"
                className="dl-date-input"
                value={specificDate}
                onChange={(e) => setSpecificDate(e.target.value)}
              />
            </div>
          )}

          {rangeType === "date-range" && (
            <div className="dl-input-row">
              <div className="dl-input-group">
                <label className="dl-input-label">From</label>
                <input
                  type="date"
                  className="dl-date-input"
                  value={fromDate}
                  max={toDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div className="dl-input-group">
                <label className="dl-input-label">To</label>
                <input
                  type="date"
                  className="dl-date-input"
                  value={toDate}
                  min={fromDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Preview summary ── */}
        <div className={`dl-preview${!hasData ? " dl-preview--empty" : ""}`}>
          {!hasData ? (
            <span><i className="fa fa-inbox" /> No expenses for this period</span>
          ) : (
            <>
              <span>
                <i className="fa fa-receipt" />{" "}
                <strong>{filtered.length}</strong>{" "}
                transaction{filtered.length !== 1 ? "s" : ""}
              </span>
              <span className="dl-preview-dot">·</span>
              <span>Total: <strong>₹ {total.toFixed(2)}</strong></span>
            </>
          )}
        </div>

        {/* ── Format buttons ── */}
        <div className="dl-section-label">Choose Format</div>
        <div className="dl-format-row">
          <button
            className={`dl-format-btn${!hasData ? " dl-format-btn--disabled" : ""}`}
            onClick={() => handleDownload("csv")}
            disabled={!hasData}
          >
            <div className="dl-format-icon" style={{ background: "#F0FDF4" }}>📊</div>
            <div className="dl-format-text">
              <div className="dl-format-label">CSV Spreadsheet</div>
              <div className="dl-format-sub">Open in Excel · Google Sheets</div>
            </div>
            <i className="fa fa-download dl-format-arrow" />
          </button>

          <button
            className={`dl-format-btn${!hasData ? " dl-format-btn--disabled" : ""}`}
            onClick={() => handleDownload("pdf")}
            disabled={!hasData}
          >
            <div className="dl-format-icon" style={{ background: "#FFF7ED" }}>📑</div>
            <div className="dl-format-text">
              <div className="dl-format-label">PDF Document</div>
              <div className="dl-format-sub">Formatted report · Print-ready</div>
            </div>
            <i className="fa fa-download dl-format-arrow" />
          </button>
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
