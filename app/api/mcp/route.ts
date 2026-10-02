import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { buildServer, type RegistryModule } from "@/server/mcp-tools";

export const dynamic = "force-dynamic";

/**
 * Remote MCP endpoint — the 7 pattern tools over the MCP Streamable HTTP
 * transport, so any MCP client can connect by URL instead of launching the
 * stdio server locally. Stateless (no per-client sessions); the durable state
 * lives in the shared store. Sits behind the app's basic-auth gate.
 *
 *   Endpoint:  POST/GET/DELETE  /api/mcp
 *   Transport: Streamable HTTP (JSON responses enabled)
 *   Auth:      Authorization: Basic <base64 user:pass>  (via middleware)
 */
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
