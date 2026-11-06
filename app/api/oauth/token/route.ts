import { NextRequest, NextResponse } from "next/server";
import { generateToken, hashToken } from "@/lib/access";
import { SUPPORTED_SCOPE, verifyPkce } from "@/lib/oauth";
import { consumeAuthCode, saveAccessToken } from "@/server/state-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

function err(code: string, description: string, status = 400): NextResponse {
  return NextResponse.json(
    { error: code, error_description: description },
    { status, headers: { ...CORS, "Cache-Control": "no-store" } },
  );
}

/** Accept both form-encoded (the OAuth default) and JSON bodies. */
async function readBody(request: NextRequest): Promise<Record<string, string>> {
  const ct = request.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    try {
      const j = (await request.json()) as Record<string, unknown>;
      return Object.fromEntries(
        Object.entries(j).map(([k, v]) => [k, String(v ?? "")]),
      );
    } catch {
      return {};
    }
  }
  const form = await request.formData();
  const out: Record<string, string> = {};
  for (const [k, v] of form.entries()) out[k] = String(v);
  return out;
}

/**
 * OAuth 2.1 token endpoint. Exchanges a single-use authorization code (bound to
 * a PKCE challenge) for an access token. The access token IS an `ioc_…` personal
 * token, so /api/mcp validates it unchanged. Non-expiring and no refresh token in
 * this version (matching how `ioc_` tokens already behave).
 */
export async function POST(request: NextRequest) {
  const body = await readBody(request);

  if (body.grant_type !== "authorization_code") {
    return err("unsupported_grant_type", "Only authorization_code is supported.");
  }

  const code = body.code ?? "";
  const redirectUri = body.redirect_uri ?? "";
  const clientId = body.client_id ?? "";
  const codeVerifier = body.code_verifier ?? "";

  if (!code || !redirectUri || !clientId || !codeVerifier) {
    return err(
      "invalid_request",
      "code, redirect_uri, client_id and code_verifier are required.",
    );
  }

  // Single-use: this both fetches and deletes the code.
  const record = await consumeAuthCode(hashToken(code));
  if (!record) {
    return err("invalid_grant", "Authorization code is invalid or expired.");
  }
  if (record.clientId !== clientId || record.redirectUri !== redirectUri) {
    return err("invalid_grant", "client_id or redirect_uri does not match the code.");
  }
  if (!verifyPkce(codeVerifier, record.codeChallenge, record.codeChallengeMethod)) {
    return err("invalid_grant", "PKCE verification failed.");
  }

  // Mint the personal token the resource server already understands.
  const token = generateToken();
  try {
    await saveAccessToken({
      email: record.email,
      tokenHash: hashToken(token),
      connectKey: null,
      tool: "oauth",
    });
  } catch (error) {
    console.error("token: failed to mint access token:", error);
    return err("server_error", "Could not issue an access token.", 500);
  }

  return NextResponse.json(
    {
      access_token: token,
      token_type: "Bearer",
      scope: record.scope ?? SUPPORTED_SCOPE,
    },
    { headers: { ...CORS, "Cache-Control": "no-store" } },
  );
}
