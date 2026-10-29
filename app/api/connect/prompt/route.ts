import { NextRequest, NextResponse } from "next/server";
import { generateConnectKey, hashToken, isValidEmail } from "@/lib/access";
import { buildConnectPrompt, originOf } from "@/lib/connect";
import { createConnectKey } from "@/server/state-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Generate a connect key for this person and return the copy-paste prompt that
 * embeds it. Only keys issued here can later claim a token. Email/label are
 * optional metadata for attribution.
 */
export async function POST(request: NextRequest) {
  let email: string | null = null;
  let label: string | null = null;
  try {
    const body = await request.json().catch(() => ({}));
    const e = String(body?.email ?? "").trim().toLowerCase();
    email = e && isValidEmail(e) ? e : null;
    label = (String(body?.label ?? "").trim() || null) as string | null;
  } catch {
    // treat as no metadata
  }

  const key = generateConnectKey();
  try {
    await createConnectKey({ keyHash: hashToken(key), email, label });
  } catch (error) {
    console.error("Failed to create connect key:", error);
    return NextResponse.json(
      { ok: false, error: "Could not generate a connect prompt. Please try again." },
      { status: 500 },
    );
  }

  const origin = originOf(request);
  return NextResponse.json({
    ok: true,
    key,
    endpoint: `${origin}/api/mcp`,
    prompt: buildConnectPrompt(key, origin),
  });
}
