// ── Categories ─────────────────────────────────────────────────────────────
export const CATEGORIES = [
  // 🍔 Food & Drinks
  { id: "food", label: "Food", icon: "🍽️", color: "#f59e0b" },
  { id: "vegetable", label: "Vegetable", icon: "🥕", color: "#188f08" },
  { id: "milk", label: "Milk & Dairy", icon: "🥛", color: "#fff7e3" },
  { id: "fruits", label: "Fruits", icon: "🍎", color: "#ec4899" },
  // { id: "tea", label: "Tea", icon: "🍵", color: "#a16207" },
  { id: "coffee", label: "Coffee / Tea", icon: "☕", color: "#92400e" },
  { id: "coldrink", label: "Cold Drink", icon: "🥤", color: "#282928" },
  { id: "snacks", label: "Snacks", icon: "🍟", color: "#f59e0b" },
  { id: "groceries", label: "Groceries", icon: "🛒", color: "#22c55e" },
  { id: "maggie", label: "Maggie", icon: "🍜", color: "#f59e0b" },
  

  // 🙏 Spiritual & Social
  { id: "temple", label: "Temple", icon: "🛕", color: "#0ea5e9" },
  { id: "donation", label: "Donation", icon: "🙏", color: "#f472b6" },
  { id: "pets", label: "Pets", icon: "🐶", color: "#a3e635" },

  // 🏠 Home & Living
  { id: "rent", label: "Rent", icon: "🏠", color: "#6366f1" },
  { id: "bills", label: "Bills", icon: "📋", color: "#ef4444" },
  { id: "electricity", label: "Electricity", icon: "⚡", color: "#facc15" },
  { id: "water", label: "Water Bill", icon: "🚰", color: "#38bdf8" },
  { id: "internet", label: "Internet", icon: "🌐", color: "#0ea5e9" },
  { id: "mobile", label: "Mobile Recharge", icon: "📱", color: "#a855f7" },
  { id: "repair", label: "Repair & Maintenance", icon: "🛠️", color: "#78716c" },

  // 🚗 Transport & Travel
  { id: "transport", label: "Transport", icon: "🚌", color: "#3b82f6" },
  { id: "travel", label: "Travel", icon: "🚂", color: "#f63bf6" },
  { id: "fuel", label: "Fuel", icon: "⛽", color: "#8b5cf6" },
  { id: "parking", label: "Parking", icon: "🅿️", color: "#60a5fa" },
  { id: "fast_tag", label: "Fast Tag", icon: "🏷️", color: "#51ff00" },
  { id: "flight", label: "Flight", icon: "✈️", color: "#0ea5e9" },
  { id: "train", label: "Train", icon: "🚄", color: "#c694ff" },
  { id: "metro", label: "Metro", icon: "🚇", color: "#e9f171" },

  // 🛍️ Shopping
  { id: "shopping", label: "Shopping", icon: "🛍️", color: "#8b5cf6" },
  { id: "clothes", label: "Clothes", icon: "👕", color: "#ec4899" },
  { id: "mart", label: "Mart", icon: "🏬", color: "#14b8a6" },
  { id: "smart_point", label: "Smart Point", icon: "🏪", color: "#6366f1" },

  // 💪 Health & Fitness
  { id: "health", label: "Health", icon: "🏋️‍♂️", color: "#10b981" },
  { id: "medicine", label: "Medicine", icon: "💊", color: "#04a818" },
  { id: "gym", label: "Gym", icon: "🏋️", color: "#10b981" },
  { id: "insurance", label: "Insurance", icon: "🛡️", color: "#2563eb" },

  // 📚 Education
  { id: "education", label: "Education", icon: "🎓", color: "#14b8a6" },
  { id: "books", label: "Books", icon: "📚", color: "#f97316" },

  // 🎬 Entertainment
  { id: "entertainment", label: "Entertainment", icon: "🎬", color: "#f43f5e" },
  { id: "movie_tickets", label: "Movie Tickets", icon: "🎟️", color: "#f43f5e" },
  { id: "event_tickets", label: "Event Tickets", icon: "🎫", color: "#fb7185" },
  { id: "subscriptions", label: "Subscriptions", icon: "📺", color: "#ef4444" },
  { id: "gifts", label: "Gifts", icon: "🎁", color: "#ec4899" },

  // 💰 Finance
  { id: "investment", label: "Investment", icon: "📈", color: "#22c55e" },
  { id: "tax", label: "Tax", icon: "💰", color: "#dc2626" },

  // 💡 Other
  { id: "other", label: "Other", icon: "💡", color: "#6b7280" },
];

// ── Income Categories ───────────────────────────────────────────────────────
export const INCOME_CATEGORIES = [
  { id: "salary", label: "Salary", icon: "💼", color: "#10b981" },
  { id: "business", label: "Business", icon: "🏢", color: "#3b82f6" },

  { id: "boss", label: "Boss", icon: "👨‍🦳", color: "#3b82f6" },
  { id: "rental", label: "Rental", icon: "🏠", color: "#8b5cf6" },

  { id: "gift", label: "Gift", icon: "🎁", color: "#f59e0b" },
  { id: "refund", label: "Refund", icon: "🔄", color: "#8b5cf6" },
  { id: "cashback", label: "Cashback", icon: "💳", color: "#22c55e" },
  { id: "side_hustle", label: "Side Hustle", icon: "🛠️", color: "#14b8a6" },
  { id: "freelance", label: "Freelance", icon: "💻", color: "#06b6d4" },
  { id: "relative", label: "Relative", icon: "👪", color: "#10b981" },
  { id: "father", label: "Father", icon: "👨‍🍼", color: "#3b82f6" },
  { id: "mother", label: "Mother", icon: "🤱", color: "#ec4899" },
  { id: "sibling", label: "Sibling", icon: "👦👧", color: "#f59e0b" },
  { id: "friend", label: "Friend", icon: "👫", color: "#8b5cf6" },
  { id: "family", label: "Family", icon: "👨‍👩‍👧‍👦", color: "#22c55e" },
  { id: "other_person", label: "Other Person", icon: "🧑", color: "#6b7280" },
  { id: "investment", label: "Investment", icon: "📈", color: "#22c55e" },
  { id: "dividend", label: "Dividend", icon: "📊", color: "#16a34a" },
  { id: "interest", label: "Interest", icon: "🏦", color: "#0ea5e9" },

  { id: "bonus", label: "Bonus", icon: "🎉", color: "#f59e0b" },
  { id: "commission", label: "Commission", icon: "💵", color: "#84cc16" },

  { id: "sale", label: "Sale (Old Items)", icon: "📦", color: "#6366f1" },

  { id: "scholarship", label: "Scholarship", icon: "🎓", color: "#14b8a6" },
  {
    id: "government",
    label: "Government Benefit",
    icon: "🏛️",
    color: "#64748b",
  },
  { id: "pension", label: "Pension", icon: "👴", color: "#f97316" },

  { id: "other_income", label: "Other", icon: "💰", color: "#22c55e" },
];
// ── Group Emojis ────────────────────────────────────────────────────────────
export const GROUP_EMOJIS = [
  "👥",
  "🏖️",
  "🎉",
  "✈️",
  "🏕️",
  "🍕",
  "🎂",
  "🎬",
  "🏋️",
  "🚗",
  "🚢",
  "🏔️",
  "⚽",
  "🎮",
  "🎸",
  "🎭",
  "🏠",
  "🍻",
  "🎓",
  "💼",
  "🛒",
  "🎁",
  "🌍",
  "🏨",
  "🍽️",
  "🎪",
  "🧳",
  "🎯",
  "🏄",
  "🎊",
];

// ── Occasion Emojis ─────────────────────────────────────────────────────────
export const OCCASION_EMOJIS = [
  "✈️",
  "🚗",
  "🏠",
  "🎉",
  "🎓",
  "💒",
  "🏥",
  "🛠️",
  "🎁",
  "🍽️",
  "🎮",
  "💼",
  "🏋️",
  "🐾",
  "📱",
  "🎭",
  "🏖️",
  "🚢",
  "🏔️",
  "🎨",
  "📚",
  "🍕",
  "🎂",
  "⚽",
  "🚀",
  "🛍️",
  "🎸",
  "🌿",
  "👔",
  "🎪",
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
