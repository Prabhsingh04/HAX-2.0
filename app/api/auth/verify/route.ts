import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  signSessionToken,
  verifyMagicToken,
} from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Step 2 of magic-link sign-in: the user clicks the emailed link. We verify the
 * magic token, mint a session token, drop it in an httpOnly cookie, and redirect
 * into the chat. An invalid/expired link bounces to /login with an error flag.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const email = verifyMagicToken(token);

  // Build redirects from the externally-visible host, not request.url — behind
  // the cloudflared tunnel request.url is the internal origin (localhost:3010).
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const base = host ? `${proto}://${host}` : request.nextUrl.origin;

  if (!email) {
    return NextResponse.redirect(`${base}/login?error=expired`);
  }

  const response = NextResponse.redirect(`${base}/advisor`);
  response.cookies.set(SESSION_COOKIE, signSessionToken(email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
