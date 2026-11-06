import { NextRequest, NextResponse } from "next/server";
import {
  generateClientId,
  isValidRedirectUri,
  SUPPORTED_SCOPE,
} from "@/lib/oauth";
import { saveOAuthClient } from "@/server/state-store";

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

/**
 * RFC 7591 Dynamic Client Registration. Host apps (claude.ai, ChatGPT) register
 * themselves before the authorization flow. Public clients only (no secret) —
 * PKCE is the proof-of-possession. We record the redirect URIs so /authorize can
 * exact-match against them.
 */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "invalid_client_metadata", error_description: "Body must be JSON." },
      { status: 400, headers: CORS },
    );
  }

  const redirectUris = Array.isArray(body.redirect_uris)
    ? (body.redirect_uris as unknown[]).map(String)
    : [];
  if (redirectUris.length === 0 || !redirectUris.every(isValidRedirectUri)) {
    return NextResponse.json(
      {
        error: "invalid_redirect_uri",
        error_description: "redirect_uris must be a non-empty array of absolute http(s) URLs.",
      },
      { status: 400, headers: CORS },
    );
  }

  const clientName =
    typeof body.client_name === "string" ? body.client_name.slice(0, 200) : null;
  const clientId = generateClientId();
  const createdAt = new Date().toISOString();

  try {
    await saveOAuthClient({ clientId, redirectUris, clientName, createdAt });
  } catch (error) {
    console.error("DCR: failed to save client:", error);
    return NextResponse.json(
      { error: "server_error", error_description: "Could not register client." },
      { status: 500, headers: CORS },
    );
  }

  // Echo back the registered metadata (RFC 7591 §3.2.1). No secret — public client.
  return NextResponse.json(
    {
      client_id: clientId,
      client_id_issued_at: Math.floor(Date.now() / 1000),
      redirect_uris: redirectUris,
      client_name: clientName ?? undefined,
      token_endpoint_auth_method: "none",
      grant_types: ["authorization_code"],
      response_types: ["code"],
      scope: SUPPORTED_SCOPE,
    },
    { status: 201, headers: CORS },
  );
}
