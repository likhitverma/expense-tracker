import "./DownloadModal.css";
import { useState, useMemo } from "react";
import jsPDF from "jspdf";

// ── Category label map ───────────────────────────────────────────────────────
const CAT_LABELS = {
  // expense
  food: "Food",
  fruits: "Fruits",
  transport: "Transport",
  fuel: "Fuel",
  shopping: "Shopping",
  bills: "Bills",
  Investment: "Investment",
  health: "Health",
  medicine: "Medicine",
  entertainment: "Entertainment",
  temple: "Temple",
  other: "Other",
  // income
  salary: "Salary",
  business: "Business",
  rental: "Rental",
  investment: "Investment",
  gift: "Gift",
  refund: "Refund",
  boss: "Boss",
  relative: "Relative",
  father: "Father",
  mother: "Mother",
  sibling: "Sibling",
  friend: "Friend",
  other_person: "Other Person",
  family: "Family",
  freelance: "Freelance",
  other_income: "Other Income",
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
    month: "long",
    year: "numeric",
  });
}
function fmtLongDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
/** "2026-03-01" → "01-March-2026" */
function fmtExportDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleDateString("en-US", { month: "long" });
  return `${day}-${month}-${d.getFullYear()}`;
}
/** "13:45" → "1:45 PM" */
function fmtTime12h(timeStr) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  let hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${m} ${ampm}`;
}
function safeName(str) {
  return str
    .replace(/[^a-z0-9]/gi, "-")
    .toLowerCase()
    .replace(/-+/g, "-")
    .slice(0, 50);
}
function totals(filtered) {
  const spent = filtered
    .filter((e) => (e.type || "expense") === "expense")
    .reduce((s, e) => s + (e.amount || 0), 0);
  const earned = filtered
    .filter((e) => e.type === "income")
    .reduce((s, e) => s + (e.amount || 0), 0);
  return { spent, earned, net: earned - spent };
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
    case "current-month":
      return fmtMonth(currentMonthStr());
    case "specific-month":
      return selectedMonth ? fmtMonth(selectedMonth) : "Selected Month";
    case "specific-date":
      return specificDate ? fmtLongDate(specificDate) : "Selected Date";
    case "date-range":
      return fromDate && toDate ? `${fromDate} to ${toDate}` : "Date Range";
    case "all-time":
    default:
      return "All Time";
  }
}

// ── CSV export ───────────────────────────────────────────────────────────────
function exportCSV(filtered, label) {
  const { spent, earned, net } = totals(filtered);
  const hasIncome = filtered.some((e) => e.type === "income");
  const rows = [
    ["Date", "Time", "Type", "Category", "Description", "Amount (INR)"],
    ...filtered.map((e) => {
      const isIncome = e.type === "income";
      return [
        fmtExportDate(e.date),
        fmtTime12h(e.time),
        isIncome ? "Income" : "Expense",
        catLabel(e.category),
        `"${(e.description || "").replace(/"/g, '""')}"`,
        (isIncome ? "+" : "-") + e.amount.toFixed(2),
      ];
    }),
    ["", "", "", "", "", ""],
    ["", "", "", "", "Total Spent", spent.toFixed(2)],
    ...(hasIncome
      ? [
          ["", "", "", "", "Total Earned", earned.toFixed(2)],
          [
            "",
            "",
            "",
            "",
            "Net Balance",
            (net >= 0 ? "+" : "") + net.toFixed(2),
          ],
        ]
      : []),
  ];
  triggerDownload(
    new Blob([rows.map((r) => r.join(",")).join("\n")], {
      type: "text/csv;charset=utf-8;",
    }),
    `report-${safeName(label)}.csv`,
  );
}

// ── PDF export ───────────────────────────────────────────────────────────────
function exportPDF(filtered, label) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const M = 14;
  const { spent, earned, net } = totals(filtered);
  const hasIncome = filtered.some((e) => e.type === "income");

  // ─ Header strip ────────────────────────────────────────────────────────────
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, pw, 24, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont(undefined, "bold");
  doc.text("Financial Report", M, 12);
  doc.setFontSize(8);
  doc.setFont(undefined, "normal");
  doc.setTextColor(200, 200, 255);
  doc.text(`Period: ${label}`, M, 19);
  doc.text(`Generated: ${fmtExportDate(todayStr())}`, pw - M, 19, {
    align: "right",
  });

  // ─ Summary boxes ───────────────────────────────────────────────────────────
  const boxY = 28;
  const boxH = 16;
  const boxes = hasIncome
    ? [
        {
          label: "Total Spent",
          val: `INR ${spent.toFixed(2)}`,
          r: 220,
          g: 38,
          b: 38,
        },
        {
          label: "Total Earned",
          val: `INR ${earned.toFixed(2)}`,
          r: 16,
          g: 185,
          b: 129,
        },
        {
          label: "Net Balance",
          val: `${net >= 0 ? "+" : ""}INR ${net.toFixed(2)}`,
          r: net >= 0 ? 16 : 220,
          g: net >= 0 ? 185 : 38,
          b: net >= 0 ? 129 : 38,
        },
        {
          label: "Transactions",
          val: String(filtered.length),
          r: 79,
          g: 70,
          b: 229,
        },
      ]
    : [
        {
          label: "Total",
          val: `INR ${spent.toFixed(2)}`,
          r: 79,
          g: 70,
          b: 229,
        },
        {
          label: "Transactions",
          val: String(filtered.length),
          r: 107,
          g: 114,
          b: 128,
        },
      ];

  const boxW = (pw - M * 2 - (boxes.length - 1) * 4) / boxes.length;
  boxes.forEach((box, i) => {
    const bx = M + i * (boxW + 4);
    doc.setFillColor(box.r, box.g, box.b);
    doc.roundedRect(bx, boxY, boxW, boxH, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6.5);
    doc.setFont(undefined, "normal");
    doc.text(box.label.toUpperCase(), bx + 3, boxY + 5);
    doc.setFontSize(8.5);
    doc.setFont(undefined, "bold");
    doc.text(box.val, bx + 3, boxY + 12);
  });

  // ─ Table columns ───────────────────────────────────────────────────────────
  // Date(30) Time(16) Type(16) Category(24) Description(56) Amount(30) = 172
  const cols = [
    { header: "Date", w: 30 },
    { header: "Time", w: 16 },
    { header: "Type", w: 16 },
    { header: "Category", w: 24 },
    { header: "Description", w: 56 },
    { header: "Amount (INR)", w: 30 },
  ];
  const tableW = cols.reduce((s, c) => s + c.w, 0);

  function drawTableHeader(y) {
    doc.setFillColor(30, 27, 75);
    doc.rect(M, y, tableW, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.setFont(undefined, "bold");
    let x = M;
    cols.forEach((col) => {
      doc.text(col.header, x + 2, y + 5.5);
      x += col.w;
    });
  }

  let y = boxY + boxH + 8;
  drawTableHeader(y);
  y += 8;
  doc.setFont(undefined, "normal");

  filtered.forEach((e) => {
    if (y > ph - 26) {
      doc.addPage();
      y = 14;
      drawTableHeader(y);
      y += 8;
      doc.setFont(undefined, "normal");
    }

    const isIncome = e.type === "income";

    // Row background: income = light green, expense = alternating indigo / white
    if (isIncome) {
      doc.setFillColor(220, 252, 231); // light green
    } else {
      doc.setFillColor(238, 242, 255); // light indigo
    }
    doc.rect(M, y, tableW, 7, "F");

    // Amount color
    if (isIncome) {
      doc.setTextColor(5, 120, 80); // dark green for income
    } else {
      doc.setTextColor(30, 27, 75);
    }
    doc.setFontSize(7.5);

    const row = [
      fmtExportDate(e.date),
      fmtTime12h(e.time),
      isIncome ? "Income" : "Expense",
      catLabel(e.category),
      e.description || "-",
      (isIncome ? "+" : "") + e.amount.toFixed(2),
    ];

    let x = M;
    // Reset text color for all cols except amount (handled per-cell)
    row.forEach((val, i) => {
      if (i === 5) {
        doc.setTextColor(
          isIncome ? 5 : 30,
          isIncome ? 120 : 27,
          isIncome ? 80 : 75,
        );
      } else {
        doc.setTextColor(30, 27, 75);
      }
      const clipped = doc.splitTextToSize(String(val), cols[i].w - 4)[0] || "";
      doc.text(clipped, x + 2, y + 5);
      x += cols[i].w;
    });

    y += 7;
  });

  // ─ Footer totals ───────────────────────────────────────────────────────────
  if (filtered.length > 0) {
    if (y > ph - 28) {
      doc.addPage();
      y = 14;
    }

    const amtX = M + cols.slice(0, 5).reduce((s, c) => s + c.w, 0);

    // Spent row
    doc.setFillColor(254, 226, 226);
    doc.rect(M, y, tableW, 7, "F");
    doc.setFont(undefined, "bold");
    doc.setFontSize(8);
    doc.setTextColor(185, 28, 28);
    doc.text("TOTAL SPENT", M + 2, y + 5);
    doc.text(`INR ${spent.toFixed(2)}`, amtX + 2, y + 5);
    y += 7;

    if (hasIncome) {
      // Earned row
      doc.setFillColor(220, 252, 231);
      doc.rect(M, y, tableW, 7, "F");
      doc.setTextColor(5, 120, 80);
      doc.text("TOTAL EARNED", M + 2, y + 5);
      doc.text(`INR ${earned.toFixed(2)}`, amtX + 2, y + 5);
      y += 7;

      // Net row
      const netPos = net >= 0;
      doc.setFillColor(
        netPos ? 187 : 254,
        netPos ? 247 : 202,
        netPos ? 208 : 202,
      );
      doc.rect(M, y, tableW, 8, "F");
      doc.setFontSize(8.5);
      doc.setTextColor(netPos ? 5 : 185, netPos ? 120 : 28, netPos ? 80 : 28);
      doc.text("NET BALANCE", M + 2, y + 5.5);
      doc.text(
        `${net >= 0 ? "+" : ""}INR ${net.toFixed(2)}`,
        amtX + 2,
        y + 5.5,
      );
    }
  }

  doc.save(`report-${safeName(label)}.pdf`);
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
const RANGE_OPTIONS = [
  { id: "current-month", label: "Current Month", icon: "🗓️" },
  { id: "specific-month", label: "Pick Month", icon: "📅" },
  { id: "specific-date", label: "Single Day", icon: "📆" },
  { id: "date-range", label: "Date Range", icon: "📊" },
  { id: "all-time", label: "All Time", icon: "🗂️" },
];

export default function DownloadModal({ expenses, onClose, toast }) {
  const today = todayStr();
  const curMonth = currentMonthStr();

  const [rangeType, setRangeType] = useState("current-month");
  const [selectedMonth, setSelectedMonth] = useState(curMonth);
  const [specificDate, setSpecificDate] = useState(today);
  const [fromDate, setFromDate] = useState(curMonth + "-01");
  const [toDate, setToDate] = useState(today);

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
  }, [
    rangeType,
    selectedMonth,
    specificDate,
    fromDate,
    toDate,
    expenses,
    curMonth,
  ]);

  const { spent, earned, net } = useMemo(() => totals(filtered), [filtered]);
  const hasIncome = filtered.some((e) => e.type === "income");
  const label = periodLabel(
    rangeType,
    selectedMonth,
    specificDate,
    fromDate,
    toDate,
  );

  function handleDownload(format) {
    if (filtered.length === 0) {
      toast("No records found for the selected period.", "error");
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
    <div
      className="overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal dl-modal">
        {/* ── Header ── */}
        <div className="modal-header">
          <div className="modal-icon" style={{ background: "#EEF2FF" }}>
            ⬇️
          </div>
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
                  <option key={m} value={m}>
                    {fmtMonth(m)}
                  </option>
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
            <span>
              <i className="fa fa-inbox" /> No records for this period
            </span>
          ) : (
            <>
              <span>
                <i className="fa fa-receipt" />{" "}
                <strong>{filtered.length}</strong> record
                {filtered.length !== 1 ? "s" : ""}
              </span>
              <span className="dl-preview-dot">·</span>
              <span>
                Spent: <strong>₹ {spent.toFixed(2)}</strong>
              </span>
              {/* {hasIncome && (
                <>
                  <span className="dl-preview-dot">·</span>
                  <span>
                    Earned: <strong>₹ {earned.toFixed(2)}</strong>
                  </span>
                  <span className="dl-preview-dot">·</span>
                  <span style={{ color: net >= 0 ? "#10b981" : "#ef4444" }}>
                    Net:{" "}
                    <strong>
                      {net >= 0 ? "+" : ""}₹ {net.toFixed(2)}
                    </strong>
                  </span>
                </>
              )} */}
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
            <div className="dl-format-icon" style={{ background: "#F0FDF4" }}>
              📊
            </div>
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
            <div className="dl-format-icon" style={{ background: "#FFF7ED" }}>
              📑
            </div>
            <div className="dl-format-text">
              <div className="dl-format-label">PDF Document</div>
              <div className="dl-format-sub">
                Formatted report · Print-ready
              </div>
            </div>
            <i className="fa fa-download dl-format-arrow" />
          </button>
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
