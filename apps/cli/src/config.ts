const BASE =
  process.env.SECRETTUNNEL_API_URL ||
  "https://secrettunnel.vercel.app";

const clean = BASE.replace(/\/+$/, "");

export const API_URL = clean.endsWith("/api/secrets")
  ? clean
  : `${clean}/api/secrets`;

export const SHARE_BASE_URL = new URL(API_URL).origin;

export const DEFAULT_TTL_SECONDS = 86400;
export const STEP_TIMEOUT_MS = 20000;