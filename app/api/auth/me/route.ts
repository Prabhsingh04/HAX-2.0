import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Who is signed in (from the session cookie), or null. Drives the UI badge. */
export async function GET(request: NextRequest) {
  const email = verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  return NextResponse.json({ email });
}
