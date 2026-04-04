import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { applySecretsPostRateLimit } from "@/lib/rate-limit";

const authPagePaths = new Set(["/signin", "/signup"]);
type GetTokenRequest = NonNullable<Parameters<typeof getToken>[0]>["req"];

export async function proxy(request :NextRequest ) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-proxy-active", "1");

  if (request.nextUrl.pathname === "/api/secrets" && request.method === "POST") {

    const result = await applySecretsPostRateLimit(request);


    if (!result.allowed) {
      const response = NextResponse.json(
        {
          success: false,
          message: "Rate limit exceeded. Try again later.",
        },
        { status: 429 },
      );

      response.headers.set("Retry-After", String(result.retryAfterSeconds));

      return response;
    }
  }

  const token = await getToken({
    // In monorepos, duplicated `next` installs can make `NextRequest` nominally incompatible.
    req: request as unknown as GetTokenRequest,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  if (authPagePaths.has(pathname) && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname.startsWith("/dashboard") && !token) {
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/api/secrets", "/signin", "/signup", "/dashboard/:path*"],
};
