import { NextRequest, NextResponse } from "next/server";
import { generateToken, hashToken, isValidEmail } from "@/lib/access";
import { originOf } from "@/lib/connect";
import { findConnectKey, saveAccessToken } from "@/server/state-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The agent calls this while running the connect prompt. It validates the key,
 * mints a personal access token tied to that key, and returns the token +
 * endpoint for the agent to wire into its MCP client. Email/tool are optional
 * attribution the agent supplies.
 */
export async function POST(request: NextRequest) {
  let key = "";
  let email = "";
  let tool: string | null = null;
  try {
    const body = await request.json();
    key = String(body?.key ?? "").trim();
    email = String(body?.email ?? "").trim().toLowerCase();
    const t = String(body?.tool ?? "").trim().toLowerCase();
    tool = t ? t.slice(0, 40) : null;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  if (!key.startsWith("ioc_key_")) {
    return NextResponse.json({ ok: false, error: "Missing or malformed connect key" }, { status: 400 });
  }

  const record = await findConnectKey(hashToken(key));
  if (!record || record.revoked) {
    return NextResponse.json(
      { ok: false, error: "Unknown or revoked connect key. Get a fresh prompt from the Connect page." },
      { status: 403 },
    );
  }

  // Email is optional/best-effort: the agent's value, else what the key carried.
  const resolvedEmail =
    email && isValidEmail(email) ? email : (record.email ?? "");

  const token = generateToken();
  try {
    await saveAccessToken({
      email: resolvedEmail,
      tokenHash: hashToken(token),
      connectKey: record.keyHash,
      tool,
    });
  } catch (error) {
    console.error("Failed to mint connect token:", error);
    return NextResponse.json(
      { ok: false, error: "Could not provision a token. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    token,
    endpoint: `${originOf(request)}/api/mcp`,
  });
}
