// ─── LocalStorage Persistence ───────────────────────────────────────────────────
import { STORAGE_KEY } from "../appConstants";

// Load the full persisted app state from localStorage.
// Returns null if nothing is stored or if JSON is invalid.
export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Save the full app state to localStorage.
// Silently ignores errors (e.g. private browsing quota exceeded).
export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}
