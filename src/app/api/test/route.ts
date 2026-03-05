// /app/api/test-redis/route.ts
import { redis } from "@/lib/redis";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const pong = await redis.ping();

    return NextResponse.json({
      success: true,
      message: pong,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
    });
  }
}