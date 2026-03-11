import { redis } from "@/lib/redis";
import { NextResponse } from "next/server";

function getCreatorIp(request: Request): string {
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
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "token is not available" },
        { status: 500 },
      );
    }

    const data = await redis.getdel(`secret:${token}`);

    if (!data) {
      return NextResponse.json(
        { message: "either removed or not exist" },
        { status: 404 },
      );
    }

    const viewedAt = new Date().toISOString();
    const viewerIp = getCreatorIp(request);
    const secretData = parseJsonLike(data as string | Record<string, unknown>);

    const auditKey = `audit:${token}`;
    const auditData = await redis.get<string | Record<string, unknown>>(auditKey);
    if (auditData) {
      const parsedAuditData = parseJsonLike(auditData);
      const newAuditData = { ...parsedAuditData, viewedAt, viewerIp };
      const remainingAuditTtl = await redis.ttl(auditKey);

      if (typeof remainingAuditTtl === "number" && remainingAuditTtl > 0) {
        await redis.setex(auditKey, remainingAuditTtl, JSON.stringify(newAuditData));
      } else {
        await redis.set(auditKey, JSON.stringify(newAuditData));
      }
    }

    return NextResponse.json({ data: secretData }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "something went wrong server side" },
      { status: 500 },
    );
  }
}
