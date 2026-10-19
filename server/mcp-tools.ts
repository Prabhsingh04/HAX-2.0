import "server-only";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  discover as discoverBehavior,
  fetch as fetchBehavior,
} from "@/lib/patterns/catalog-query";

/**
 * Shared registration of the 7 IoC pattern tools onto an McpServer.
 * Used by both the stdio entrypoint (server/mcp-stdio.ts) and the remote
 * Streamable-HTTP endpoint (app/api/mcp/route.ts), so the tool surface is
 * defined once.
 */
export type RegistryModule = typeof import("@/server/mcp-server");

/**
 * A free-form JSON object param (open-ended keys). `z.looseObject({})` emits
 * `{"type":"object","additionalProperties":{}}` — a real `type` keyword, unlike
 * a bare `z.record(...)` which emits `{}` and trips up some MCP clients.
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

export function buildServer(registry: RegistryModule): McpServer {
  const {
    brokerStateHandoff,
    discoverComponentsSmart,
    fetchComponent,
    getInstanceState,
    instantiateComponent,
    listComponents,
    listInstallations,
    updateInstanceState,
  } = registry;

  const server = new McpServer({ name: "ioc-patterns", version: "1.0.0" });

  server.registerTool(
    "discover_patterns",
    {
      title: "Discover patterns",
      description:
        "Semantic (embedding) search over the pattern catalogue, with keyword fallback. Returns pattern metadata ranked best-first (slug, name, description, backing strength, evidence count).",
      inputSchema: {
        query: z.string().min(1).describe("What you're trying to do"),
      },
    },
    async ({ query }) => json(await discoverComponentsSmart(query)),
  );

  server.registerTool(
    "list_patterns",
    {
      title: "List all patterns",
      description:
        "Return metadata for the ENTIRE pattern catalogue (all patterns), unranked. Use this to browse or load the whole library; use discover_patterns to search for the best fit for a specific situation.",
      inputSchema: {},
    },
    async () => json(listComponents()),
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
      const instance = await instantiateComponent(
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
      const instance = await updateInstanceState(instance_id, updates);
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
      const instance = await getInstanceState(instance_id);
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
    async ({ agent_id }) => json(await listInstallations(agent_id)),
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
    async ({ from_instance_id, to_component_slug, to_agent_id, context_data }) => {
      const instance = await brokerStateHandoff(
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

  // ---- Behavior catalog (HAX v2) ----------------------------------------
  // The 23-pattern behavior catalog. `discover` returns the behavioral contract
  // (spec, mode, valid responses, level, channels) so an agent can act without a
  // second call; `fetch` returns one full pattern. These sit alongside the older
  // discover_patterns / fetch_pattern (rendering-oriented) tools.

  server.registerTool(
    "discover",
    {
      title: "Discover behavior patterns",
      description:
        "Find the interaction pattern that fits a situation, from the 23-pattern behavior catalog. All filters optional and AND-combined: mode, level, channel, audience, plus free-text query. Each result carries the behavior to follow (spec sentence, mode, the valid responses to handle, level and channels). Intentionally-empty modes (request, delegate) return an empty list with a gap note; an unknown filter value returns an error naming the field.",
      inputSchema: {
        mode: z.string().optional().describe("declare/signal/explain/request/propose/delegate/coordinate/resolve/commit"),
        level: z.string().optional().describe("L1 (one agent), L2 (agents only), L3 (agents + one person), L4 (agents + many people)"),
        channel: z.string().optional().describe("chat_ui/settings_panel/shared_ui/agent_message/shared_record/state_signal"),
        audience: z.string().optional().describe("self/peer_agent/orchestrator/operator/team"),
        query: z.string().optional().describe("free-text description of the situation"),
      },
    },
    async ({ mode, level, channel, audience, query }) =>
      json(discoverBehavior({ mode, level, channel, audience, query })),
  );

  server.registerTool(
    "fetch",
    {
      title: "Fetch behavior pattern",
      description:
        "Get one full pattern from the behavior catalog by id: the behavior (spec, mode, triggers, audience, channels, responses, level notes) and the rendering (implementation, variants), plus composes_with / conflicts_with. Old/renamed ids resolve automatically.",
      inputSchema: { id: z.string().min(1).describe("Pattern id, e.g. co-editing-surface") },
    },
    async ({ id }) => {
      const result = fetchBehavior(id);
      return result.ok ? json(result) : toolError(result.error.message);
    },
  );

  return server;
}
