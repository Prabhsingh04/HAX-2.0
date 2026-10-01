import { NextRequest, NextResponse } from "next/server";

/**
 * HTTP Basic Auth gate for hosted deployments.
 *
 * Enabled only when BASIC_AUTH_USER + BASIC_AUTH_PASS are set (production);
 * local dev stays open. The browser prompts once and then attaches the
 * credentials to every same-origin request, including the app's own fetches.
 */
const USER = process.env.BASIC_AUTH_USER;
const PASS = process.env.BASIC_AUTH_PASS;

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

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="HAX 2.0 demo"' },
  });
}
