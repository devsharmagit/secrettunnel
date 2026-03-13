import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { NextResponse } from "next/server";

function getViewerIp(request: Request): string {
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

function parseJsonLike(value: string | Record<string, unknown>) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function updateAudit(token: string, patch: Record<string, unknown>) {
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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;

    const data = await redis.getdel(`secret:${token}`);
    if (!data) {
      return NextResponse.json(
        { message: "secret not found or already viewed" },
        { status: 404 },
      );
    }

    await updateAudit(token, {
      viewedAt: new Date().toISOString(),
      viewerIp: getViewerIp(request),
    });

    const secretData = parseJsonLike(data as string | Record<string, unknown>);
    return NextResponse.json({ data: secretData }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "something went wrong server side" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "unauthenticated" },
        { status: 401 },
      );
    }

    const { token } = await params;

    // Verify ownership before deleting
    const auditRaw = await redis.get<string | Record<string, unknown>>(`audit:${token}`);
    if (!auditRaw) {
      return NextResponse.json(
        { success: false, message: "secret not found" },
        { status: 404 },
      );
    }

    const audit = parseJsonLike(auditRaw);
    if (audit.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: "forbidden" },
        { status: 403 },
      );
    }

    const deleted = await redis.del(`secret:${token}`);
    if (deleted === 0) {
      // Secret already burned (viewed or expired) — still a success,
      // the caller just wanted it gone
      return NextResponse.json(
        { success: false, message: "secret already viewed or expired" },
        { status: 410 },
      );
    }

    await updateAudit(token, {
      burnedAt: new Date().toISOString(),
      burnedBy: "owner",
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "something went wrong server side" },
      { status: 500 },
    );
  }
}