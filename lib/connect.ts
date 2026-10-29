import type { NextRequest } from "next/server";

/**
 * Prompt-based MCP connect. A user gets a copy-paste prompt from the Connect
 * page; pasted into any coding agent, it makes the agent provision its own
 * personal token (by exchanging the embedded key at /api/connect/claim) and
 * wire up this MCP server - no manual config or token-copying.
 */

/** Externally-visible origin (behind the cloudflared tunnel, request.url is the
 *  internal :3010 host, so build absolute URLs from the forwarded headers). */
export function originOf(request: NextRequest): string {
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  return host ? `${proto}://${host}` : request.nextUrl.origin;
}

/** The copy-paste prompt. Embeds the unique key; the agent runs it end-to-end. */
export function buildConnectPrompt(key: string, origin: string): string {
  return `Connect this project to the "HAX IoC Patterns" MCP server. Follow these steps exactly.

1) (Optional) Detect my email so usage can be attributed - try running: git config user.email
   This is optional. If you can't get one, continue without it.

2) Provision a personal access token by POSTing the connect key below to the connect endpoint:

   curl -s -X POST ${origin}/api/connect/claim \\
     -H "Content-Type: application/json" \\
     -d '{"key":"${key}","tool":"<the tool you are running in: cursor | claude-code | codex | other>","email":"<the email from step 1, or omit this field>"}'

   The response is JSON like: {"ok":true,"token":"ioc_...","endpoint":"${origin}/api/mcp"}
   Use the returned token and endpoint in the next step. Treat the token as a secret - do not print it.

3) Configure THIS tool's MCP client with that endpoint and token. Do ONLY the one that matches your environment:

   - Cursor - create or merge .cursor/mcp.json:
     {"mcpServers":{"ioc-patterns":{"url":"<endpoint>","headers":{"Authorization":"Bearer <token>"}}}}

   - Claude Code - run:
     claude mcp add --transport http ioc-patterns <endpoint> --header "Authorization: Bearer <token>"

   - Codex - set the token as an env var, then add the server:
     export IOC_MCP_TOKEN="<token>"
     codex mcp add ioc-patterns --url <endpoint> --bearer-token-env-var IOC_MCP_TOKEN

4) Verify by listing the server's tools (you should see discover, fetch, instantiate_pattern, and others), then tell me it's connected.`;
}
