import { CreateSecretSchema } from "@/lib/schema";
import { redis } from "@/lib/redis";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { getViewerIp } from "@/lib/utils";
import { validateWebhookUrlServer } from "@/lib/webhook-url.server";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { success, data, error } = CreateSecretSchema.safeParse(body);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body",
          errors: error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    if (data.webhookUrl) {
      const webhookValidation = await validateWebhookUrlServer(data.webhookUrl);
      if (!webhookValidation.ok) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid request body",
            errors: { webhookUrl: [webhookValidation.message] },
          },
          { status: 400 }
        );
      }
    }

    const token = crypto.randomUUID();
    const ttlSeconds = data.ttl;
    const auditTTLSeconds = ttlSeconds + 86400;

    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
    const creatorIp = getViewerIp(request);

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
      userId: session?.user.id ?? null,
      webhookUrl: data.webhookUrl ?? null,
    };

    const multi = redis.multi();

    multi.setex(
      `secret:${token}`,
      ttlSeconds,
      JSON.stringify(secretPayload)
    );

    multi.setex(
      `audit:${token}`,
      auditTTLSeconds,
      JSON.stringify(auditPayload)
    );

    const results = await multi.exec();

    if (!results) {
      throw new Error("Redis transaction failed");
    }

    if (session?.user.id) {
      redis
        .lpush(`user:${session.user.id}:secrets`, token)
        .catch((err) => {
          console.error("Failed to push user secret index:", err);
        });
    }

    return NextResponse.json({ token }, { status: 201 });
  } catch (error) {
    console.error("Create secret error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "something went wrong server side",
      },
      { status: 500 }
    );
  }
}