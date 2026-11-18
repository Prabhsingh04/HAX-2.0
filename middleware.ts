import { NextRequest, NextResponse } from "next/server";

/**
 * Auth gate for hosted deployments. Accepts either:
 *   - HTTP Basic  (BASIC_AUTH_USER + BASIC_AUTH_PASS) — browsers, Cursor,
 *     Claude Code/Desktop; the browser prompts once and reuses it.
 *   - Bearer token (MCP_BEARER_TOKEN) — MCP clients that only support a
 *     bearer token for remote servers (e.g. Codex `--bearer-token-env-var`).
 *
 * Enabled only when BASIC_AUTH_USER + BASIC_AUTH_PASS are set (production);
 * local dev stays open.
 */
const USER = process.env.BASIC_AUTH_USER;
const PASS = process.env.BASIC_AUTH_PASS;
const BEARER = process.env.MCP_BEARER_TOKEN;

export function middleware(request: NextRequest) {
  if (!USER || !PASS) return NextResponse.next();

  const path = request.nextUrl.pathname;

  // Public signup for a personal token — the /access page and its API are
  // reachable without the shared secret, so a new user can be sent the link,
  // sign up, and receive a token by email without ever needing the shared creds.
  if (path === "/access" || path.startsWith("/api/access")) {
    return NextResponse.next();
  }

  // Prompt-based connect — the /connect page issues a connect prompt and the
  // agent calls /api/connect/claim to provision its own token, all without the
  // shared secret (the connect key is the credential).
  if (path === "/connect" || path.startsWith("/api/connect")) {
    return NextResponse.next();
  }

  // Magic-link sign-in. These must be reachable without the shared secret: the
  // verify link is clicked from an email (no cached Basic creds), and /login is
  // where a new user starts. Security here is the signed magic/session token.
  if (path === "/login" || path.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // OAuth for remote MCP connectors (claude.ai, ChatGPT). Discovery documents,
  // dynamic client registration, the authorize/consent screen and the token
  // endpoint must all be reachable without the shared secret — the OAuth flow
  // (PKCE + per-user consent) is the security here, same as the /connect flow.
  if (path.startsWith("/.well-known/") || path.startsWith("/api/oauth")) {
    return NextResponse.next();
  }

  // Brand icons must be public: host apps (claude.ai's connector list, browser
  // tabs) fetch the domain's favicon without credentials.
  if (
    path === "/favicon.ico" ||
    path === "/icon.svg" ||
    path === "/apple-icon.png" ||
    path.startsWith("/brand/")
  ) {
    return NextResponse.next();
  }

  // Public connector docs (the Claude Connectors Directory needs a public docs
  // URL). Self-contained HTML, so it doesn't depend on the gated /_next assets.
  if (path === "/docs" || path === "/privacy") {
    return NextResponse.next();
  }

  // The MCP endpoint does its own auth in the route handler (Node runtime),
  // because per-user tokens need a DB lookup the Edge middleware can't perform.
  // It still accepts the shared Basic/Bearer secret there, so this is not a hole.
  if (path.startsWith("/api/mcp")) return NextResponse.next();

  const auth = request.headers.get("authorization");

  if (auth?.startsWith("Basic ")) {
    try {
      const [user, pass] = atob(auth.slice(6)).split(":");
      if (user === USER && pass === PASS) return NextResponse.next();
    } catch {
      // fall through to the challenge
    }
  }

  if (BEARER && auth?.startsWith("Bearer ") && auth.slice(7) === BEARER) {
    return NextResponse.next();
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="HAX 2.0 demo"' },
  });
}

// Run on Node.js rather than the Edge runtime: on Vercel the Edge invocation failed
// (MIDDLEWARE_INVOCATION_FAILED) and took every page down. Same checks, same behaviour.
export const config = { runtime: "nodejs" };
