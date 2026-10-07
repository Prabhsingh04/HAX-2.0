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
