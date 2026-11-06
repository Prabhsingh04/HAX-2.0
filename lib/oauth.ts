import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * OAuth 2.1 authorization-server helpers for the MCP Authorization flow.
 *
 * Host apps (claude.ai web/desktop, ChatGPT) add a remote MCP server through a
 * Connectors UI that speaks OAuth, not a pasted bearer token. This module backs
 * a minimal, spec-compliant authorization server (RFC 8414 metadata, RFC 7591
 * dynamic client registration, authorization-code + PKCE) that bridges to the
 * identity and token systems already here:
 *
 *   - the issued access token IS an `ioc_…` personal token (lib/access +
 *     state-store), so /api/mcp validates it unchanged (resource-server half
 *     already exists);
 *   - the signed-in email (magic-link session) or a self-asserted email on the
 *     consent screen attributes the token to a person, exactly like /connect.
 *
 * Deliberately minimal for the pilot: S256 PKCE only, public clients (no secret),
 * non-expiring access tokens (matching how `ioc_` tokens already behave), no
 * refresh tokens. Refresh + short-lived tokens are a documented follow-up.
 */

export const AUTH_CODE_TTL_SEC = 10 * 60; // authorization codes are short-lived
export const SUPPORTED_SCOPE = "mcp";

/** Externally-visible origin. Behind the cloudflared tunnel, request.url is the
 *  internal :3010 host, so build absolute URLs from the forwarded headers (or an
 *  explicit override). No trailing slash. */
export function publicOrigin(request: Request): string {
  const override = process.env.MCP_PUBLIC_ORIGIN;
  if (override) return override.replace(/\/+$/, "");
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  return host ? `${proto}://${host}` : "https://ioc-patterns.intelligaia.com";
}

/** The MCP resource identifier this authorization server protects. */
export function resourceIdentifier(origin: string): string {
  return `${origin}/api/mcp`;
}

/** RFC 9728 protected-resource metadata — points clients at our AS. */
export function protectedResourceMetadata(origin: string) {
  return {
    resource: resourceIdentifier(origin),
    authorization_servers: [origin],
    bearer_methods_supported: ["header"],
    scopes_supported: [SUPPORTED_SCOPE],
  };
}

/** RFC 8414 authorization-server metadata. */
export function authorizationServerMetadata(origin: string) {
  return {
    issuer: origin,
    authorization_endpoint: `${origin}/api/oauth/authorize`,
    token_endpoint: `${origin}/api/oauth/token`,
    registration_endpoint: `${origin}/api/oauth/register`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["none"],
    scopes_supported: [SUPPORTED_SCOPE],
  };
}

export function generateClientId(): string {
  return `ioc_client_${randomBytes(12).toString("hex")}`;
}

export function generateAuthCode(): string {
  return `ioc_ac_${randomBytes(24).toString("hex")}`;
}

/** Verify a PKCE code_verifier against the stored challenge (S256 only). */
export function verifyPkce(
  verifier: string,
  challenge: string,
  method: string,
): boolean {
  if (method !== "S256") return false;
  if (!verifier || !challenge) return false;
  const computed = createHash("sha256").update(verifier).digest("base64url");
  const a = Buffer.from(computed);
  const b = Buffer.from(challenge);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Exact-match redirect-URI check (OAuth 2.0 Security BCP). No prefix/substring
 * matching — the URI presented must be one the client registered verbatim.
 */
export function redirectUriAllowed(
  uri: string,
  registered: string[],
): boolean {
  return registered.includes(uri);
}

/** A redirect_uri must be an absolute http(s) URL we can safely redirect to. */
export function isValidRedirectUri(uri: string): boolean {
  try {
    const u = new URL(uri);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}
