import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { redis } from "./redis";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getViewerIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }
  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

export function parseJsonLike(value: string | Record<string, unknown>) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function updateAudit(token: string, patch: Record<string, unknown>) {
  const auditKey = `audit:${token}`;
  const raw = await redis.get<string | Record<string, unknown>>(auditKey);
  if (!raw) return;

  const parsed = parseJsonLike(raw);
  const updated = { ...parsed, ...patch };

  const ttl = await redis.ttl(auditKey);
  if (typeof ttl === "number" && ttl > 0) {
    await redis.setex(auditKey, ttl, JSON.stringify(updated));
  } else {
    await redis.set(auditKey, JSON.stringify(updated));
  }
}
