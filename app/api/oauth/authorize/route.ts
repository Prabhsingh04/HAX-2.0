import { NextRequest, NextResponse } from "next/server";
import { hashToken, isValidEmail } from "@/lib/access";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import {
  AUTH_CODE_TTL_SEC,
  generateAuthCode,
  publicOrigin,
  redirectUriAllowed,
  resourceIdentifier,
  SUPPORTED_SCOPE,
} from "@/lib/oauth";
import { findOAuthClient, saveAuthCode } from "@/server/state-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * OAuth 2.1 authorization endpoint for the MCP flow.
 *
 *   GET  — validate the request, then render a consent screen. The user confirms
 *          (and supplies/confirms the email the token is attributed to).
 *   POST — on "Allow", mint a single-use authorization code bound to the PKCE
 *          challenge and redirect back to the client. On "Deny", redirect with
 *          error=access_denied.
 *
 * Client and redirect_uri are validated before any redirect; a bad client or an
 * unregistered redirect_uri renders an error page rather than redirecting, so we
 * never bounce a code or error to an attacker-controlled URL.
 */

interface AuthParams {
  clientId: string;
  redirectUri: string;
  responseType: string;
  state: string;
  scope: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  resource: string;
}

function readParams(sp: URLSearchParams): AuthParams {
  return {
    clientId: sp.get("client_id") ?? "",
    redirectUri: sp.get("redirect_uri") ?? "",
    responseType: sp.get("response_type") ?? "",
    state: sp.get("state") ?? "",
    scope: sp.get("scope") ?? SUPPORTED_SCOPE,
    codeChallenge: sp.get("code_challenge") ?? "",
    codeChallengeMethod: sp.get("code_challenge_method") ?? "",
    resource: sp.get("resource") ?? "",
  };
}

function sessionEmail(request: NextRequest): string {
  const cookie = request.cookies.get(SESSION_COOKIE)?.value;
  return verifySessionToken(cookie) ?? "";
}

/** Append query params to a redirect_uri, preserving any it already carries. */
function redirectBack(
  redirectUri: string,
  params: Record<string, string>,
): NextResponse {
  const url = new URL(redirectUri);
  for (const [k, v] of Object.entries(params)) {
    if (v) url.searchParams.set(k, v);
  }
  return NextResponse.redirect(url.toString());
}

export async function GET(request: NextRequest) {
  const p = readParams(request.nextUrl.searchParams);
  const check = await validate(p);
  if (!check.ok) return check.response;

  return htmlResponse(
    consentPage({
      params: p,
      email: sessionEmail(request),
      clientName: check.clientName,
      resource: resourceIdentifier(publicOrigin(request)),
    }),
  );
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const p: AuthParams = {
    clientId: String(form.get("client_id") ?? ""),
    redirectUri: String(form.get("redirect_uri") ?? ""),
    responseType: String(form.get("response_type") ?? "code"),
    state: String(form.get("state") ?? ""),
    scope: String(form.get("scope") ?? SUPPORTED_SCOPE),
    codeChallenge: String(form.get("code_challenge") ?? ""),
    codeChallengeMethod: String(form.get("code_challenge_method") ?? ""),
    resource: String(form.get("resource") ?? ""),
  };
  const decision = String(form.get("decision") ?? "");
  const email = String(form.get("email") ?? "").trim().toLowerCase();

  const check = await validate(p);
  if (!check.ok) return check.response;

  if (decision !== "allow") {
    return redirectBack(p.redirectUri, {
      error: "access_denied",
      state: p.state,
    });
  }

  if (!isValidEmail(email)) {
    // Re-render consent with an error rather than redirecting — the user stays
    // on our page to fix the email.
    return htmlResponse(
      consentPage({
        params: p,
        email,
        clientName: check.clientName,
        resource: resourceIdentifier(publicOrigin(request)),
        error: "Enter a valid email so this connection can be attributed to you.",
      }),
    );
  }

  const code = generateAuthCode();
  const now = Date.now();
  try {
    await saveAuthCode({
      codeHash: hashToken(code),
      clientId: p.clientId,
      redirectUri: p.redirectUri,
      codeChallenge: p.codeChallenge,
      codeChallengeMethod: p.codeChallengeMethod,
      email,
      scope: p.scope || SUPPORTED_SCOPE,
      resource: p.resource || null,
      expiresAt: new Date(now + AUTH_CODE_TTL_SEC * 1000).toISOString(),
      createdAt: new Date(now).toISOString(),
    });
  } catch (error) {
    console.error("authorize: failed to persist code:", error);
    return redirectBack(p.redirectUri, {
      error: "server_error",
      state: p.state,
    });
  }

  return redirectBack(p.redirectUri, { code, state: p.state });
}

/**
 * Validate the request. Returns the client name on success; on failure returns
 * a ready-made response: an HTML error page when the client/redirect_uri can't
 * be trusted, or a redirect-with-error when they can.
 */
async function validate(
  p: AuthParams,
): Promise<
  | { ok: true; clientName: string }
  | { ok: false; response: NextResponse }
> {
  if (!p.clientId) {
    return { ok: false, response: htmlResponse(errorPage("Missing client_id."), 400) };
  }
  const client = await findOAuthClient(p.clientId);
  if (!client) {
    return {
      ok: false,
      response: htmlResponse(errorPage("Unknown client_id. Register first."), 400),
    };
  }
  if (!p.redirectUri || !redirectUriAllowed(p.redirectUri, client.redirectUris)) {
    return {
      ok: false,
      response: htmlResponse(
        errorPage("redirect_uri does not match a registered URI for this client."),
        400,
      ),
    };
  }
  // From here the redirect_uri is trusted, so protocol errors go back to it.
  if (p.responseType !== "code") {
    return {
      ok: false,
      response: redirectBack(p.redirectUri, {
        error: "unsupported_response_type",
        state: p.state,
      }),
    };
  }
  if (!p.codeChallenge || p.codeChallengeMethod !== "S256") {
    return {
      ok: false,
      response: redirectBack(p.redirectUri, {
        error: "invalid_request",
        error_description: "PKCE with code_challenge_method=S256 is required.",
        state: p.state,
      }),
    };
  }
  return { ok: true, clientName: client.clientName ?? "An application" };
}

/* ---- HTML -------------------------------------------------------------- */

function htmlResponse(html: string, status = 200): NextResponse {
  return new NextResponse(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const SHELL = (title: string, body: string) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<style>
  :root { color-scheme: light dark; }
  body { margin:0; min-height:100vh; display:grid; place-items:center;
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
    background:#f4f4f5; color:#18181b; padding:24px; }
  @media (prefers-color-scheme: dark) { body { background:#0b0b0d; color:#f4f4f5; } .card { background:#161618 !important; border-color:#27272a !important; } .muted{color:#a1a1aa !important;} input{background:#0b0b0d !important;color:#f4f4f5 !important;border-color:#3f3f46 !important;} }
  .card { width:100%; max-width:420px; background:#fff; border:1px solid #e4e4e7;
    border-radius:16px; padding:28px; box-shadow:0 8px 30px rgba(0,0,0,.06); }
  h1 { font-size:19px; margin:0 0 6px; }
  p { font-size:14px; line-height:1.55; margin:0 0 14px; }
  .muted { color:#71717a; }
  .scopes { background:#fafafa; border:1px solid #e4e4e7; border-radius:10px;
    padding:12px 14px; font-size:13px; margin:0 0 18px; }
  @media (prefers-color-scheme: dark) { .scopes { background:#0b0b0d; border-color:#27272a; } }
  label { display:block; font-size:13px; font-weight:600; margin:0 0 6px; }
  input { width:100%; box-sizing:border-box; padding:10px 12px; font-size:14px;
    border:1px solid #d4d4d8; border-radius:9px; margin:0 0 16px; }
  .row { display:flex; gap:10px; }
  button { flex:1; padding:11px 14px; font-size:14px; font-weight:600;
    border-radius:9px; border:1px solid transparent; cursor:pointer; }
  .allow { background:#0b5fff; color:#fff; }
  .deny { background:transparent; border-color:#d4d4d8; color:inherit; }
  .err { color:#dc2626; font-size:13px; margin:0 0 14px; }
  code { font-size:12px; word-break:break-all; }
</style></head><body><div class="card">${body}</div></body></html>`;

function consentPage(opts: {
  params: AuthParams;
  email: string;
  clientName: string;
  resource: string;
  error?: string;
}): string {
  const { params: p, email, clientName, resource, error } = opts;
  const hidden = (name: string, value: string) =>
    `<input type="hidden" name="${name}" value="${esc(value)}" />`;
  return SHELL(
    "Authorize connection · HAX IoC Patterns",
    `
    <h1>Connect to HAX IoC Patterns</h1>
    <p class="muted"><strong>${esc(clientName)}</strong> is requesting access to the
      HAX IoC Patterns MCP server.</p>
    <div class="scopes">
      This lets the app discover, fetch, and instantiate interaction patterns on
      your behalf.<br /><span class="muted">Resource: <code>${esc(resource)}</code></span>
    </div>
    ${error ? `<p class="err">${esc(error)}</p>` : ""}
    <form method="post" action="/api/oauth/authorize">
      <label for="email">Email (for attribution)</label>
      <input id="email" name="email" type="email" value="${esc(email)}"
        placeholder="you@company.com" autocomplete="email" required />
      ${hidden("client_id", p.clientId)}
      ${hidden("redirect_uri", p.redirectUri)}
      ${hidden("response_type", p.responseType)}
      ${hidden("state", p.state)}
      ${hidden("scope", p.scope)}
      ${hidden("code_challenge", p.codeChallenge)}
      ${hidden("code_challenge_method", p.codeChallengeMethod)}
      ${hidden("resource", p.resource)}
      <div class="row">
        <button class="deny" type="submit" name="decision" value="deny">Deny</button>
        <button class="allow" type="submit" name="decision" value="allow">Allow</button>
      </div>
    </form>
    `,
  );
}

function errorPage(message: string): string {
  return SHELL(
    "Authorization error · HAX IoC Patterns",
    `<h1>Can't complete this request</h1><p class="muted">${esc(message)}</p>`,
  );
}
