import { auth } from "@/lib/auth";
import { redis, qstash } from "@/lib/redis";
import { getViewerIp, parseJsonLike, updateAudit } from "@/lib/utils";
import { validateWebhookUrlServer } from "@/lib/webhook-url.server";
import { NextResponse } from "next/server";

async function enqueueWebhook(
  token: string,
  webhookUrl: string,
  viewedAt: string,
  viewerIp: string
) {
  const host = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const url = `${host}/api/webhooks/deliver`;

  await qstash.publishJSON({
    url,
    body: { token, webhookUrl, viewedAt, viewerIp },
  });
  await updateAudit(token, { webhookStatus: "enqueued" });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const auditRaw = await redis.get<string | Record<string, unknown>>(
      `audit:${token}`
    );
    const audit = auditRaw ? parseJsonLike(auditRaw) : null;

    if (audit?.webhookUrl && typeof audit.webhookUrl === "string") {
      const webhookValidation = await validateWebhookUrlServer(audit.webhookUrl);
      if (!webhookValidation.ok) {
        await updateAudit(token, {
          webhookStatus: "blocked",
          webhookFailureReason: webhookValidation.message,
        });

        return NextResponse.json(
          {
            success: false,
            message: "blocked unsafe webhook destination",
            errors: { webhookUrl: [webhookValidation.message] },
          },
          { status: 400 }
        );
      }
    }

    const data = await redis.getdel(`secret:${token}`);
    if (!data) {
      return NextResponse.json(
        { message: "secret not found or already viewed" },
        { status: 404 }
      );
    }

    const viewedAt = new Date().toISOString();
    const viewerIp = getViewerIp(request);

    await updateAudit(token, { viewedAt, viewerIp });

    if (audit?.webhookUrl && typeof audit.webhookUrl === "string") {
      await enqueueWebhook(token, audit.webhookUrl, viewedAt, viewerIp);
    }

    const secretData = parseJsonLike(data as string | Record<string, unknown>);
    return NextResponse.json({ data: secretData }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "something went wrong server side" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "unauthenticated" },
        { status: 401 }
      );
    }

    const { token } = await params;

    const auditRaw = await redis.get<string | Record<string, unknown>>(
      `audit:${token}`
    );
    if (!auditRaw) {
      return NextResponse.json(
        { success: false, message: "secret not found" },
        { status: 404 }
      );
    }

    const audit = parseJsonLike(auditRaw);
    if (audit.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: "forbidden" },
        { status: 403 }
      );
    }

    const deleted = await redis.del(`secret:${token}`);
    if (deleted === 0) {
      return NextResponse.json(
        { success: false, message: "secret already viewed or expired" },
        { status: 410 }
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
      { status: 500 }
    );
  }
}