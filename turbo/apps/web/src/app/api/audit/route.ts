import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { NextResponse } from "next/server";

function parseJsonLike(value: string | Record<string, unknown>) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "unauthenticated" },
        { status: 401 },
      );
    }

    const userId = session.user.id;
    const tokens = await redis.lrange(`user:${userId}:secrets`, 0, -1);

    if (tokens.length === 0) {
      return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }

    const auditEntries = await Promise.all(
      tokens.map(async (token) => {
        const raw = await redis.get<string | Record<string, unknown>>(
          `audit:${token}`,
        );

        if (!raw) {
          // Audit record expired — secret is long gone
          return {
            token,
            expired: true,
            createdAt: null,
            expiresAt: null,
            viewedAt: null,
            burnedAt: null,
          };
        }

        const audit = parseJsonLike(raw);

        return {
          token,
          expired: false,
          createdAt: audit.createdAt ?? null,
          expiresAt: audit.expiresAt ?? null,
          viewedAt: audit.viewedAt ?? null,
          burnedAt: audit.burnedAt ?? null,
        };
      }),
    );

    return NextResponse.json(
      { success: true, data: auditEntries },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "something went wrong server side" },
      { status: 500 },
    );
  }
}