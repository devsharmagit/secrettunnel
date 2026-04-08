import { redis } from "@/lib/redis"
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs"
import axios from "axios"

async function handler(req: Request): Promise<Response> {
  const body = await req.json()
  const { token, webhookUrl, viewedAt, viewerIp } = body

  try {
    await axios.post(webhookUrl, 
      { token, viewedAt, viewerIp },
      { 
        headers: { "Content-Type": "application/json" },
        timeout: 5000
      }
    )

    await redis.hset(`audit:${token}`, { webhookStatus: "delivered" })
    return new Response("OK", { status: 200 })
  } catch {
    await redis.hset(`audit:${token}`, { webhookStatus: "failed" })
    throw new Error("Delivery failed")  
  }
}

export const POST = verifySignatureAppRouter(handler)