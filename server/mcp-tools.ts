import "server-only";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  discover as discoverBehavior,
  fetch as fetchBehavior,
} from "@/lib/patterns/catalog-query";
import { loadCatalog } from "@/lib/patterns/catalog";
import { buildRenderContract } from "@/lib/patterns/render-contract";

/**
 * The render contract for a pattern, or null if the slug isn't a catalog
 * pattern. Attached to instantiate/fetch results so the agent reproduces the
 * canonical UI (required elements + layout + explanation) instead of inventing
 * one that drifts from the website and drops required layers.
 */
function renderContractFor(slug: string) {
  const catalog = loadCatalog();
  const pattern = catalog.getPattern(slug);
  if (!pattern) return null;
  return buildRenderContract(pattern, catalog.responsesFor(pattern));
}

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
    getInstanceState,
    instantiateComponent,
    listInstallations,
    updateInstanceState,
  } = registry;

  // The HAX mark, so host apps that read serverInfo.icons show it in their
  // connector lists. Absolute URL (stdio clients have no origin to resolve against).
  const origin = process.env.MCP_PUBLIC_ORIGIN ?? "https://ioc-patterns.intelligaia.com";
  const server = new McpServer({
    name: "ioc-patterns",
    title: "HAX IoC Patterns",
    version: "1.0.0",
    icons: [
      { src: `${origin}/brand/hax-icon.svg`, mimeType: "image/svg+xml", sizes: ["any"] },
      { src: `${origin}/brand/hax-icon-512.png`, mimeType: "image/png", sizes: ["512x512"] },
    ],
  });

  server.registerTool(
    "discover_patterns",
    {
      title: "Discover patterns",
      annotations: { readOnlyHint: true, openWorldHint: false },
      description:
        "Free-text search over the 23-pattern behavior catalog, ranked best-first. Each result includes the pattern's behavior spec, mode, valid responses, level and channels.",
      inputSchema: {
        query: z.string().min(1).describe("What you're trying to do"),
      },
    },
    async ({ query }) => json(await discoverBehavior({ query })),
  );

  server.registerTool(
    "list_patterns",
    {
      title: "List all patterns",
      annotations: { readOnlyHint: true, openWorldHint: false },
      description:
        "Returns the entire behavior catalog (all 23 patterns), unranked.",
      inputSchema: {},
    },
    async () => json(await discoverBehavior({})),
  );

  server.registerTool(
    "fetch_pattern",
    {
      title: "Fetch pattern",
      annotations: { readOnlyHint: true, openWorldHint: false },
      description:
        "Full definition of one pattern by id or slug: behavior (spec, mode, triggers, audience, channels, responses, level notes), rendering (implementation, variants), and a render contract describing the pattern's canonical UI elements, layout, explanation and a Mermaid flow diagram of its steps. Old or renamed ids resolve automatically.",
      inputSchema: { slug: z.string().min(1).describe("Pattern id/slug") },
    },
    async ({ slug }) => {
      const result = fetchBehavior(slug);
      if (!result.ok) return toolError(result.error.message);
      const render_contract = renderContractFor(result.pattern.id);
      return json(render_contract ? { ...result, render_contract } : result);
    },
  );

  server.registerTool(
    "instantiate_pattern",
    {
      title: "Instantiate pattern",
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
      description:
        "Creates a live instance of a pattern with optional initial state, and returns the instance together with the pattern's render contract (canonical UI elements, layout, explanation and a Mermaid flow diagram of its steps).",
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
      if (!instance) return toolError(`Pattern not found: ${slug}`);
      const render_contract = renderContractFor(instance.slug);
      return json(render_contract ? { ...instance, render_contract } : instance);
    },
  );

  server.registerTool(
    "update_instance",
    {
      title: "Update instance state",
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
      description:
        "Deep-merges new fields into an instance's state (nested objects merge key by key).",
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
      annotations: { readOnlyHint: true, openWorldHint: false },
      description: "Returns the current state of one instance.",
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
      annotations: { readOnlyHint: true, openWorldHint: false },
      description:
        "Lists pattern installations and their instance ids for one agent, or for all agents when agent_id is omitted.",
      inputSchema: { agent_id: z.string().optional() },
    },
    async ({ agent_id }) => json(await listInstallations(agent_id)),
  );

  server.registerTool(
    "handoff",
    {
      title: "Broker state handoff",
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
      description:
        "Creates a new instance on a different pattern, inheriting context from the source instance.",
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
      annotations: { readOnlyHint: true, openWorldHint: false },
      description:
        "Finds the interaction patterns that fit a situation, from the 23-pattern behavior catalog. All filters are optional and combined: mode, level, channel, audience, plus a free-text query. Each result includes the pattern's behavior spec, mode, valid responses, level and channels. Intentionally empty modes (request, delegate) return an empty list with a gap note; an unknown filter value returns an error naming the field.",
      inputSchema: {
        mode: z.string().optional().describe("declare/signal/explain/request/propose/delegate/coordinate/resolve/commit"),
        level: z.string().optional().describe("L1 (one agent), L2 (agents only), L3 (agents + one person), L4 (agents + many people)"),
        channel: z.string().optional().describe("chat_ui/settings_panel/shared_ui/agent_message/shared_record/state_signal"),
        audience: z.string().optional().describe("self/peer_agent/orchestrator/operator/team"),
        query: z.string().optional().describe("free-text description of the situation"),
      },
    },
    async ({ mode, level, channel, audience, query }) =>
      json(await discoverBehavior({ mode, level, channel, audience, query })),
  );

  server.registerTool(
    "fetch",
    {
      title: "Fetch behavior pattern",
      annotations: { readOnlyHint: true, openWorldHint: false },
      description:
        "One full pattern from the behavior catalog by id: behavior (spec, mode, triggers, audience, channels, responses, level notes), rendering (implementation, variants), related patterns (composes_with, conflicts_with), and a render contract describing the canonical UI elements, layout, explanation and a Mermaid flow diagram of its steps. Old or renamed ids resolve automatically.",
      inputSchema: { id: z.string().min(1).describe("Pattern id, e.g. co-editing-surface") },
    },
    async ({ id }) => {
      const result = fetchBehavior(id);
      if (!result.ok) return toolError(result.error.message);
      const render_contract = renderContractFor(result.pattern.id);
      return json(render_contract ? { ...result, render_contract } : result);
    },
  );

  return server;
}
