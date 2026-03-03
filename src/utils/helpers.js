// ─── General Helper Utilities ───────────────────────────────────────────────────

// Generate a short unique ID (random + timestamp-based)
export function uid() {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

// Format a timestamp as "Mon DD" (e.g. "Jan 5")
export function fmtDate(ts) {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// Format a timestamp as "HH:MM AM/PM" (e.g. "02:45 PM")
export function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Count words in an HTML string (strips tags first)
export function wordCount(html) {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text ? text.split(" ").length : 0;
}

// Count characters in an HTML string (strips tags first)
export function charCount(html) {
  return html.replace(/<[^>]+>/g, "").length;
}

// Sanitize a string for use as a file name (strips special chars, max 40 chars)
export function sanitizeFileName(str) {
  return (str || "note").replace(/[^a-z0-9_\-]/gi, "_").slice(0, 40);
}
