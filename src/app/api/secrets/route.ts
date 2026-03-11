import { CreateSecretSchema } from "@/lib/schema";
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { success, data, error } = CreateSecretSchema.safeParse(body);

    if (!success) {
      return NextResponse.json(
        { success: false, message: "wrong input data", error },
        { status: 400 },
      );
    }

    const token = crypto.randomUUID();
    const ttlSeconds = data.ttl;
    const auditTTLSeconds = ttlSeconds + 86400;
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
    const creatorIp = getCreatorIp(request);

    const secretPayload = {
      ciphertext: data.ciphertext,
      iv: data.iv,
      passwordHash: data.passwordHash,
    };

    const auditPayload = {
      createdAt,
      creatorIp,
      expiresAt,
      viewedAt: null,
      viewerIp: null,
    };

    await Promise.all([
      redis.setex(`secret:${token}`, ttlSeconds, JSON.stringify(secretPayload)),
      redis.setex(`audit:${token}`, auditTTLSeconds, JSON.stringify(auditPayload)),
    ]);

    return NextResponse.json({ token }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "something went wrong server side" },
      { status: 500 },
    );
  }
}
