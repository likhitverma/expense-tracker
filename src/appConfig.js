// ─── Feature Flags ───────────────────────────────────────────────────────────
// Toggle auth methods here without touching component code.
const featureFlags = {
  ENABLE_GOOGLE_AUTH: true,
  ENABLE_EMAIL_AUTH: true,
  ENABLE_INCOME_TRACKING: true,
  TABS: {
    daily: true,
    monthly: true,
    dashboard: true,
    occasions: true,
  },
};

export default featureFlags;
