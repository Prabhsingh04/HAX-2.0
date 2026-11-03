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

  const server = new McpServer({ name: "ioc-patterns", version: "1.0.0" });

  server.registerTool(
    "discover_patterns",
    {
      title: "Discover patterns",
      description:
        "Free-text search over the 23-pattern behavior catalog, ranked best-first. Each result carries the behavior to follow (spec sentence, mode, valid responses, level, channels). Alias of `discover` with just a query; use `discover` for structured mode/level/channel/audience filters.",
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
      description:
        "Return the ENTIRE behavior catalog (all 23 patterns) unranked. Use this to browse the whole library; use discover_patterns or discover to find the best fit for a situation.",
      inputSchema: {},
    },
    async () => json(await discoverBehavior({})),
  );

  server.registerTool(
    "fetch_pattern",
    {
      title: "Fetch pattern",
      description:
        "Full definition for one pattern from the behavior catalog by id/slug: behavior (spec, mode, triggers, audience, channels, responses, level notes), rendering (implementation, variants), and a render_contract. If you render a UI, REPRODUCE the render_contract (include every `must_include` element, follow `layout`, show `explanation.text` with the visual, respect `do_not`) rather than designing your own. Old/renamed ids resolve automatically. Alias of `fetch`.",
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
      description:
        "Create a live instance of a pattern, and get its render_contract. When you render a UI for this pattern, REPRODUCE the render_contract: include every element in `must_include`, follow `layout`, show `explanation.text` alongside the visual, and respect `do_not`. Adapt only the scenario content to the user and restyle to match their app — do not redesign or omit elements. This keeps the render faithful to the pattern and close to the canonical website UI; the user can then ask you to change it.",
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
      json(await discoverBehavior({ mode, level, channel, audience, query })),
  );

  server.registerTool(
    "fetch",
    {
      title: "Fetch behavior pattern",
      description:
        "Get one full pattern from the behavior catalog by id: the behavior (spec, mode, triggers, audience, channels, responses, level notes), the rendering (implementation, variants), composes_with / conflicts_with, and a render_contract. If you render a UI, REPRODUCE the render_contract (include every `must_include` element, follow `layout`, show `explanation.text` with the visual, respect `do_not`) rather than designing your own. Old/renamed ids resolve automatically.",
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
