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
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// stdout is reserved for JSON-RPC framing. The registry module logs an
// initialization banner with console.log; route console.log to stderr *before*
// it is imported (below, dynamically) so the client handshake stays clean.
console.log = (...args: unknown[]) => console.error(...args);

type RegistryModule = typeof import("@/server/mcp-server");

/**
 * A free-form JSON object param (open-ended keys). `z.looseObject({})` emits
 * `{"type":"object","additionalProperties":{}}` — a real `type` keyword, unlike
 * a bare `z.record(z.string(), z.unknown())` which emits `{}` and trips up some
 * MCP clients.
 */
const jsonObject = z.looseObject({});

/** Wrap any JSON-serializable payload as an MCP text-content result. */
function json(payload: unknown) {
  return {
    content: [
      { type: "text" as const, text: JSON.stringify(payload, null, 2) },
    ],
  };
}

function toolError(message: string) {
  return {
    isError: true,
    content: [{ type: "text" as const, text: message }],
  };
}

function buildServer(registry: RegistryModule): McpServer {
  const {
    brokerStateHandoff,
    discoverComponents,
    fetchComponent,
    getInstanceState,
    instantiateComponent,
    listInstallations,
    updateInstanceState,
  } = registry;

  const server = new McpServer({ name: "ioc-patterns", version: "1.0.0" });

  server.registerTool(
    "discover_patterns",
    {
      title: "Discover patterns",
      description:
        "Keyword / natural-language search over the pattern catalogue. Returns ranked pattern metadata (slug, name, description, backing strength, evidence count).",
      inputSchema: {
        query: z.string().min(1).describe("What you're trying to do"),
      },
    },
    async ({ query }) => json(discoverComponents(query)),
  );

  server.registerTool(
    "fetch_pattern",
    {
      title: "Fetch pattern",
      description:
        "Full definition for one pattern: metadata, state schema, handlers, and UI copy sections.",
      inputSchema: { slug: z.string().min(1).describe("Pattern slug") },
    },
    async ({ slug }) => {
      const component = fetchComponent(slug);
      return component ? json(component) : toolError(`Pattern not found: ${slug}`);
    },
  );

  server.registerTool(
    "instantiate_pattern",
    {
      title: "Instantiate pattern",
      description:
        "Create a live instance of a pattern with a unique id and timestamped state.",
      inputSchema: {
        slug: z.string().min(1),
        initial_state: jsonObject.optional(),
        agent_id: z.string().optional(),
        persistent: z.boolean().optional(),
      },
    },
    async ({ slug, initial_state, agent_id, persistent }) => {
      const instance = instantiateComponent(
        slug,
        initial_state ?? {},
        agent_id,
        persistent ?? false,
      );
      return instance ? json(instance) : toolError(`Pattern not found: ${slug}`);
    },
  );

  server.registerTool(
    "update_instance",
    {
      title: "Update instance state",
      description:
        "Deep-merge new fields into an instance's state (nested objects like `workspace` merge key-by-key).",
      inputSchema: {
        instance_id: z.string().min(1),
        updates: jsonObject,
      },
    },
    async ({ instance_id, updates }) => {
      const instance = updateInstanceState(instance_id, updates);
      return instance
        ? json(instance)
        : toolError(`Instance not found: ${instance_id}`);
    },
  );

  server.registerTool(
    "get_instance",
    {
      title: "Get instance state",
      description: "Read the current snapshot for one instance.",
      inputSchema: { instance_id: z.string().min(1) },
    },
    async ({ instance_id }) => {
      const instance = getInstanceState(instance_id);
      return instance
        ? json(instance)
        : toolError(`Instance not found: ${instance_id}`);
    },
  );

  server.registerTool(
    "list_installations",
    {
      title: "List installations",
      description:
        "List pattern installations and their instance ids for one agent, or all agents when agent_id is omitted.",
      inputSchema: { agent_id: z.string().optional() },
    },
    async ({ agent_id }) => json(listInstallations(agent_id)),
  );

  server.registerTool(
    "handoff",
    {
      title: "Broker state handoff",
      description:
        "Create a new instance on a different pattern, inheriting context from the source instance.",
      inputSchema: {
        from_instance_id: z.string().min(1),
        to_component_slug: z.string().min(1),
        to_agent_id: z.string().min(1),
        context_data: jsonObject.optional(),
      },
    },
    async ({
      from_instance_id,
      to_component_slug,
      to_agent_id,
      context_data,
    }) => {
      const instance = brokerStateHandoff(
        from_instance_id,
        to_component_slug,
        to_agent_id,
        context_data,
      );
      return instance
        ? json(instance)
        : toolError(
            `Handoff failed: source instance or target pattern not found (${from_instance_id} → ${to_component_slug})`,
          );
    },
  );

  return server;
}

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
