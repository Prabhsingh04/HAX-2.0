import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  signSessionToken,
  verifyMagicTokenWithExp,
} from "@/lib/auth";
import { hashToken } from "@/lib/access";
import { consumeMagicToken } from "@/server/state-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Step 2 of magic-link sign-in: the user clicks the emailed link. We verify the
 * magic token, mark it used (single-use — a replay is rejected), mint a session
 * token, drop it in an httpOnly cookie, and redirect into the chat. An invalid,
 * expired, or already-used link bounces to /login with an error flag.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const verified = verifyMagicTokenWithExp(token);

  // Build redirects from the externally-visible host, not request.url — behind
  // the cloudflared tunnel request.url is the internal origin (localhost:3010).
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const base = host ? `${proto}://${host}` : request.nextUrl.origin;

  if (!verified) {
    return NextResponse.redirect(`${base}/login?error=expired`);
  }

  // Single-use: atomically claim the token. If it was already claimed, reject.
  const expiresAtIso = new Date(verified.exp * 1000).toISOString();
  const firstUse = await consumeMagicToken(hashToken(token!), expiresAtIso);
  if (!firstUse) {
    return NextResponse.redirect(`${base}/login?error=used`);
  }

  const email = verified.email;
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
