import { redis } from "@/lib/redis"
import { validateWebhookUrlServer } from "@/lib/webhook-url.server"
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs"
import axios from "axios"

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

async function handler(req: Request): Promise<Response> {
  const body = await req.json()
  const { token, webhookUrl, viewedAt, viewerIp } = body

  if (typeof token !== "string" || typeof webhookUrl !== "string") {
    return new Response("Invalid payload", { status: 400 })
  }

  const webhookValidation = await validateWebhookUrlServer(webhookUrl)
  if (!webhookValidation.ok) {
    await updateAudit(token, {
      webhookStatus: "blocked",
      webhookFailureReason: webhookValidation.message,
    })
    return new Response("Blocked webhook URL", { status: 400 })
  }

  try {
    await axios.post(webhookUrl, 
      { token, viewedAt, viewerIp },
      { 
        headers: { "Content-Type": "application/json" },
        timeout: 5000,
        maxRedirects: 0,
      }
    )

    await updateAudit(token, { webhookStatus: "delivered" })
    return new Response("OK", { status: 200 })
  } catch {
    await updateAudit(token, { webhookStatus: "failed" })
    throw new Error("Delivery failed")  
  }
}

export const POST = verifySignatureAppRouter(handler)