/**
 * Real MCP stdio server wrapper.
 *
 * Exposes the in-process pattern registry (server/mcp-server.ts) over the
 * Model Context Protocol so any MCP client (Claude Desktop, Cursor, Windsurf,
 * `npx @modelcontextprotocol/inspector`, …) can discover patterns, spin up
 * instances, update state, and broker handoffs.
 *
 * Run:  npm run mcp:stdio
 *
 * Claude Desktop config:
 *   {
 *     "mcpServers": {
 *       "ioc-patterns": {
 *         "command": "node",
 *         "args": [
 *           "--conditions=react-server",
 *           "--import", "tsx",
 *           "/abs/path/to/server/mcp-stdio.ts"
 *         ]
 *       }
 *     }
 *   }
 */

/* eslint-disable no-console */
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { buildServer, type RegistryModule } from "./mcp-tools";

// stdout is reserved for JSON-RPC framing. The registry module logs an
// initialization banner with console.log; route console.log to stderr *before*
// it is imported (below, dynamically) so the client handshake stays clean.
console.log = (...args: unknown[]) => console.error(...args);

async function main() {
  const registry = (await import("@/server/mcp-server")) as RegistryModule;
  const server = buildServer(registry);
  await server.connect(new StdioServerTransport());
  console.error("ioc-patterns MCP server ready on stdio");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
