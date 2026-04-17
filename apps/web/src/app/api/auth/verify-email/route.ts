import { NextResponse } from "next/server";

import { verifyEmailToken } from "@/lib/email-verification";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const baseUrl = process.env.NEXTAUTH_URL ?? url.origin;

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/signin?verified=missing`);
  }

  const user = await verifyEmailToken(token);

  if (!user) {
    return NextResponse.redirect(`${baseUrl}/signin?verified=invalid`);
  }

  return NextResponse.redirect(`${baseUrl}/signin?verified=success`);
}
