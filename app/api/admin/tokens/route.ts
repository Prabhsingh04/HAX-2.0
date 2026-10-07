import { NextRequest, NextResponse } from "next/server";
import {
  listAccessTokens,
  revokeAccessTokensByEmail,
} from "@/server/state-store";
import { isValidEmail } from "@/lib/access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin view/management of per-user MCP tokens. Already behind the app's shared
 * basic-auth gate (middleware), so this is operator-only. Raw tokens are never
 * stored or shown — only email, created/last-used timestamps, and revoked state.
 *
 *   GET            → list tokens (most recent first)
 *   POST {email}   → revoke all active tokens for that email
 */
export async function GET() {
  try {
    const tokens = await listAccessTokens();
    return NextResponse.json({ count: tokens.length, tokens });
  } catch (error) {
    console.error("Token list read failed:", error);
    return NextResponse.json(
      { error: "Could not read tokens" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  let email: string;
  try {
    const body = await request.json();
    email = String(body?.email ?? "").trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  try {
    const revoked = await revokeAccessTokensByEmail(email);
    return NextResponse.json({ ok: true, email, revoked });
  } catch (error) {
    console.error("Token revoke failed:", error);
    return NextResponse.json(
      { error: "Could not revoke tokens" },
      { status: 500 },
    );
  }
}
