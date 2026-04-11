import { NextRequest } from "next/server";
import { redis } from "@/lib/redis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const RATE_LIMIT_MAX_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_KEY_PREFIX = "ratelimit:api:secrets:post";

type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

function unwrapExecResult<T>(value: unknown): T {
  if (Array.isArray(value) && value.length === 2) {
    return value[1] as T;
  }
  return value as T;
}

function getTrustedIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor && typeof forwardedFor === "string") {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

async function getTrustedUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string })?.id ?? null;
}

export async function applySecretsPostRateLimit(
  request: NextRequest
): Promise<RateLimitResult> {
  const ip = getTrustedIp(request);
  const userId = await getTrustedUserId();

  const identity = userId
    ? `user:${userId}:ip:${ip}`
    : `ip:${ip}`;

  const key = `${RATE_LIMIT_KEY_PREFIX}:${identity}`;

  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  const member = `${now}:${crypto.randomUUID()}`;

  const txResults = (await redis
    .multi()
    .zremrangebyscore(key, 0, windowStart)
    .zadd(key, { score: now, member })
    .zcard(key)
    .zrange<string[]>(key, 0, 0)
    .pexpire(key, RATE_LIMIT_WINDOW_MS)
    .exec()) as unknown[];

  const requestCount = Number(unwrapExecResult<number>(txResults[2]) ?? 0);

  const rawOldestEntries = unwrapExecResult<unknown>(txResults[3]);
  const oldestEntries = Array.isArray(rawOldestEntries)
    ? (rawOldestEntries as string[])
    : [];

  const oldestEntry = oldestEntries[0];
  const oldestTimestamp = Number(oldestEntry?.split(":")[0]);

  if (requestCount > RATE_LIMIT_MAX_REQUESTS) {
    await redis.zrem(key, member);

    const retryAfterSeconds = Number.isFinite(oldestTimestamp)
      ? Math.max(
          1,
          Math.ceil(
            (RATE_LIMIT_WINDOW_MS - (now - oldestTimestamp)) / 1000
          )
        )
      : Math.ceil(RATE_LIMIT_WINDOW_MS / 1000);

    return {
      allowed: false,
      retryAfterSeconds,
    };
  }

  return {
    allowed: true,
    retryAfterSeconds: 0,
  };
}