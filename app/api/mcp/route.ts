import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { buildServer, type RegistryModule } from "@/server/mcp-tools";
import { hashToken } from "@/lib/access";
import { publicOrigin } from "@/lib/oauth";
import { findAccessToken, touchAccessToken } from "@/server/state-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Remote MCP endpoint — the 7 pattern tools over the MCP Streamable HTTP
 * transport, so any MCP client can connect by URL instead of launching the
 * stdio server locally. Stateless (no per-client sessions); the durable state
 * lives in the shared store. Sits behind the app's basic-auth gate.
 *
 *   Endpoint:  POST/GET/DELETE  /api/mcp
 *   Transport: Streamable HTTP (JSON responses enabled)
 *   Auth:      shared Basic / shared Bearer (non-breaking) OR a per-user
 *              `ioc_…` token (Bearer, or as the Basic password). Validated here
 *              rather than in middleware because per-user lookup hits the DB,
 *              which the Edge middleware can't do. The shared-secret middleware
 *              lets /api/mcp through so this handler can run per-user checks.
 */

const SHARED_USER = process.env.BASIC_AUTH_USER;
const SHARED_PASS = process.env.BASIC_AUTH_PASS;
const SHARED_BEARER = process.env.MCP_BEARER_TOKEN;

/**
 * Pull any candidate secret out of the Authorization header. Returns the shared
 * user/pass when Basic, and the bare credential (bearer token or Basic password)
 * so we can test it against both the shared secret and per-user tokens.
 */
function readAuth(request: Request): {
  basicUser?: string;
  basicPass?: string;
  bearer?: string;
} {
  const auth = request.headers.get("authorization") ?? "";
  if (auth.startsWith("Bearer ")) return { bearer: auth.slice(7).trim() };
  if (auth.startsWith("Basic ")) {
    try {
      const [user, ...rest] = atob(auth.slice(6)).split(":");
      return { basicUser: user, basicPass: rest.join(":") };
    } catch {
      return {};
    }
  }
  return {};
}

/** True if the request carries a valid shared secret or per-user token. */
async function authorize(request: Request): Promise<boolean> {
  // Local dev (no shared creds configured) stays open, matching middleware.
  if (!SHARED_USER || !SHARED_PASS) return true;

  const { basicUser, basicPass, bearer } = readAuth(request);

  // Shared Basic (cisco:HAX2-Patterns-2026) — unchanged, keeps existing clients.
  if (basicUser === SHARED_USER && basicPass === SHARED_PASS) return true;
  // Shared Bearer (Codex).
  if (SHARED_BEARER && bearer === SHARED_BEARER) return true;

  // Per-user token: accepted as a Bearer token or as the Basic password.
  const candidate = bearer ?? basicPass;
  if (candidate && candidate.startsWith("ioc_")) {
    const record = await findAccessToken(hashToken(candidate));
    if (record && !record.revoked) {
      touchAccessToken(record.tokenHash).catch(() => {});
      return true;
    }
  }
  return false;
}
// The registry (17 patterns + state engine) is a module singleton; only the
// cheap McpServer + transport are rebuilt per request, which stateless mode
// requires (a stateless transport is single-use).
let registryPromise: Promise<RegistryModule> | null = null;
function getRegistry(): Promise<RegistryModule> {
  if (!registryPromise) {
    registryPromise = import("@/server/mcp-server") as Promise<RegistryModule>;
  }
  return registryPromise;
}

async function handle(request: Request): Promise<Response> {
  if (!(await authorize(request))) {
    // Point MCP host apps (claude.ai, ChatGPT) at our OAuth discovery document
    // per RFC 9728, so they can run the Connectors OAuth flow. Coding agents
    // that send a bearer/Basic token never see this — they're already authed —
    // so advertising Bearer here is non-breaking.
    const resourceMetadata = `${publicOrigin(request)}/.well-known/oauth-protected-resource`;
    return new Response("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": `Bearer resource_metadata="${resourceMetadata}"`,
      },
    });
  }
  const registry = await getRegistry();
  const server = buildServer(registry);
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless
    enableJsonResponse: true, // plain JSON responses for simple clients
  });
  await server.connect(transport);
  try {
    return await transport.handleRequest(request);
  } finally {
    await transport.close().catch(() => {});
  }
}

export const POST = handle;
export const GET = handle;
export const DELETE = handle;
