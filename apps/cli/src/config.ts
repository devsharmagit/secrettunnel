export const DEFAULT_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://api.woirohs.com"
    : "http://localhost:3000";
export const API_URL = (process.env.SECRETTUNNEL_API_URL || process.env.API_URL || `${DEFAULT_BASE_URL}/api/secrets`).replace(/\/+$/, "");
export const SHARE_BASE_URL = (() => {
  try {
    return new URL(API_URL).origin;
  } catch {
    return DEFAULT_BASE_URL;
  }
})();
export const DEFAULT_TTL_SECONDS = 24 * 60 * 60;
export const STEP_TIMEOUT_MS = 20000;