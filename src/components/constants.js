// ── Categories ─────────────────────────────────────────────────────────────
export const CATEGORIES = [
  { id: "food", label: "Food", icon: "🍔", color: "#f59e0b" },
  { id: "fruits", label: "Fruits", icon: "🍎", color: "#ec4899" },
  { id: "transport", label: "Transport", icon: "🚌", color: "#3b82f6" },
  { id: "fuel", label: "Fuel", icon: "⛽", color: "#8b5cf6" },
  { id: "shopping", label: "Shopping", icon: "🛍️", color: "#8b5cf6" },
  { id: "bills", label: "Bills", icon: "📋", color: "#ef4444" },
  { id: "Investment", label: "Investment", icon: "📈", color: "#22c55e" },
  { id: "health", label: "Health", icon: "🏋️‍♂️", color: "#10b981" },
  { id: "medicine", label: "Medicine", icon: "💊", color: "#04a818" },
  { id: "entertainment", label: "Entertainment", icon: "🎬", color: "#f43f5e" },
  { id: "temple", label: "Temple", icon: "🛕", color: "#0ea5e9" },
  { id: "other", label: "Other", icon: "💡", color: "#6b7280" },
];

// ── Income Categories ───────────────────────────────────────────────────────
export const INCOME_CATEGORIES = [
  { id: "salary", label: "Salary", icon: "💼", color: "#10b981" },
  { id: "business", label: "Business", icon: "🏢", color: "#3b82f6" },
  { id: "rental", label: "Rental", icon: "🏠", color: "#8b5cf6" },
  { id: "investment", label: "Investment", icon: "📈", color: "#22c55e" },
  { id: "gift", label: "Gift", icon: "🎁", color: "#f59e0b" },
  { id: "refund", label: "Refund", icon: "🔄", color: "#8b5cf6" },
  { id: "boss", label: "Boss", icon: "👨‍🦳", color: "#3b82f6" },
  { id: "relative", label: "Relative", icon: "👪", color: "#10b981" },
  { id: "father", label: "Father", icon: "👨‍🍼", color: "#3b82f6" },
  { id: "mother", label: "Mother", icon: "🤱", color: "#ec4899" },
  { id: "sibling", label: "Sibling", icon: "👦👧", color: "#f59e0b" },
  { id: "friend", label: "Friend", icon: "👫", color: "#8b5cf6" },
  { id: "other_person", label: "Other Person", icon: "🧑", color: "#6b7280" },
  { id: "family", label: "Family", icon: "👨‍👩‍👧‍👦", color: "#22c55e" },
  { id: "freelance", label: "Freelance", icon: "💻", color: "#06b6d4" },
  { id: "other_income", label: "Other", icon: "💰", color: "#22c55e" },
];

// ── Group Emojis ────────────────────────────────────────────────────────────
export const GROUP_EMOJIS = [
  "👥", "🏖️", "🎉", "✈️", "🏕️", "🍕", "🎂", "🎬",
  "🏋️", "🚗", "🚢", "🏔️", "⚽", "🎮", "🎸", "🎭",
  "🏠", "🍻", "🎓", "💼", "🛒", "🎁", "🌍", "🏨",
  "🍽️", "🎪", "🧳", "🎯", "🏄", "🎊",
];

// ── Occasion Emojis ─────────────────────────────────────────────────────────
export const OCCASION_EMOJIS = [
  "✈️", "🚗", "🏠", "🎉", "🎓", "💒", "🏥", "🛠️",
  "🎁", "🍽️", "🎮", "💼", "🏋️", "🐾", "📱", "🎭",
  "🏖️", "🚢", "🏔️", "🎨", "📚", "🍕", "🎂", "⚽",
  "🚀", "🛍️", "🎸", "🌿", "👔", "🎪",
];

// ── Theme ───────────────────────────────────────────────────────────────────
export const THEME_ORDER = ["light", "dark", "golden", "monokai"];
export const THEME_ICONS = {
  light: "🌞",
  dark: "🌛",
  golden: "⭐",
  monokai: "Ⓜ️",
};
export const THEME_LABELS = {
  light: "Light",
  dark: "Dark",
  golden: "Golden",
  monokai: "Monokai",
};

export const CURRENCY = "₹";

// ── Date helpers ────────────────────────────────────────────────────────────
export function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

export function getCurrentTimeStr() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function formatDisplayDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatShortDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatSimpleDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return `${String(d.getDate()).padStart(2, "0")} / ${String(d.getMonth() + 1).padStart(2, "0")} / ${d.getFullYear()}`;
}

export function formatMonthLabel(monthStr) {
  return new Date(monthStr + "-01T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function shiftDate(dateStr, days) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export function getMonthStr(dateStr) {
  return dateStr.substring(0, 7);
}

// ── Format helpers ──────────────────────────────────────────────────────────
export function formatCurrency(amount) {
  return `${CURRENCY} ${Number(amount).toFixed(2)}`;
}

/** Converts "HH:MM" (24h) to "H:MM AM/PM" (12h) */
export function formatTime(timeStr) {
  if (!timeStr) return timeStr;
  const [hourStr, minuteStr] = timeStr.split(":");
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minuteStr} ${ampm}`;
}

// ── Theme persistence ───────────────────────────────────────────────────────
export function readTheme() {
  try {
    return JSON.parse(localStorage.getItem("nq_v2"))?.theme || "dark";
  } catch {
    return "dark";
  }
}

export function persistTheme(t) {
  try {
    const raw = localStorage.getItem("nq_v2");
    const data = raw ? JSON.parse(raw) : {};
    localStorage.setItem("nq_v2", JSON.stringify({ ...data, theme: t }));
  } catch {
    /* ignore */
  }
}
