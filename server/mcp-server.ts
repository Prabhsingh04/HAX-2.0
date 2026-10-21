/**
 * IoC Pattern Library MCP Server (No Anthropic Dependency)
 *
 * Registry logic lives in lib/pattern-registry-core.ts (shared with static/Reviewa).
 * Instance state is durable (SQLite via server/state-store.ts): it survives
 * restarts and hot-reloads, and is shared between the stdio MCP server and
 * the Next.js API routes.
 */

import "server-only";

import {
  buildComponentFromPattern,
  deepMerge,
  discoverComponents as discoverFromCore,
  fetchComponent as fetchFromCore,
  getPatternRegistry,
  type ComponentDefinition,
  type ComponentMetadata,
} from "@/lib/pattern-registry-core";
import { patterns } from "@/lib/patterns";
import { resolvePatternSlug } from "@/lib/patterns/aliases";
import { loadCatalog } from "@/lib/patterns/catalog";
import { rankPatterns } from "@/lib/patterns/embedding-index";
import {
  listInstancesByAgent,
  loadInstance,
  saveInstance,
  type StoredInstance,
} from "@/server/state-store";

export type { ComponentDefinition, ComponentMetadata } from "@/lib/pattern-registry-core";

export type Installation = {
  componentSlug: string;
  agentId: string;
  installedAt: string;
  instanceIds: string[];
  version: string;
};

type ComponentInstanceInternal = StoredInstance;

export type { ComponentInstanceInternal as ComponentInstance };

const componentRegistry = getPatternRegistry();

function initializeRegistry() {
  console.log("📚 Importing patterns from lib/patterns.ts...\n");

  for (const pattern of patterns) {
    componentRegistry.set(pattern.slug, buildComponentFromPattern(pattern));
    console.log(`✓ Registered: ${pattern.title} (${pattern.slug})`);
  }

  console.log(
    `\n✅ Registry initialized with ${componentRegistry.size} patterns\n`,
  );
}

export function discoverComponents(
  query: string,
  _context?: Record<string, unknown>,
): ComponentMetadata[] {
  return discoverFromCore(query);
}

/**
 * Retrieval with embedding similarity (deterministic, local) and a keyword
 * fallback. Returns pattern metadata ranked best-first. This is the retrieval
 * layer behind discover_patterns and the advisor's candidate list.
 */
export async function discoverComponentsSmart(
  query: string,
  limit = 10,
): Promise<ComponentMetadata[]> {
  const ranked = await rankPatterns(query, limit);
  if (ranked && ranked.length > 0) {
    const out: ComponentMetadata[] = [];
    for (const { slug } of ranked) {
      const meta = componentRegistry.get(slug)?.metadata;
      if (meta) out.push(meta);
    }
    if (out.length > 0) return out;
  }
  // Embeddings unavailable → keyword scorer.
  return discoverFromCore(query).slice(0, limit);
}

export function fetchComponent(slug: string): ComponentDefinition | null {
  return fetchFromCore(slug);
}

/** The entire catalogue, unranked — for "load the whole library" (vs search). */
export function listComponents(): ComponentMetadata[] {
  return Array.from(componentRegistry.values()).map((c) => c.metadata);
}

export async function instantiateComponent(
  rawSlug: string,
  initialState: Record<string, unknown> = {},
  agentId?: string,
  persistent: boolean = false,
): Promise<ComponentInstanceInternal | null> {
  // Accept old slugs post-rename; instantiate (and store) under the canonical.
  const slug = componentRegistry.has(rawSlug)
    ? rawSlug
    : resolvePatternSlug(rawSlug);
  // A pattern is instantiable if it's in the legacy registry OR the v2 behavior
  // catalog. The instance itself only needs a valid id + state, so this is all
  // that gates it — update/get/list then work off the stored instance id.
  const known =
    componentRegistry.has(slug) || Boolean(loadCatalog().getPattern(slug));
  if (!known) return null;

  const instanceId = `${slug}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  const instance: ComponentInstanceInternal = {
    instanceId,
    slug,
    state: {
      pattern_slug: slug,
      ...initialState,
      createdAt: now,
      updatedAt: now,
    },
    createdAt: now,
    lastModified: now,
    agentId,
    persistent,
  };

  await saveInstance(instance);

  return instance;
}

export async function updateInstanceState(
  instanceId: string,
  updates: Record<string, unknown>,
): Promise<ComponentInstanceInternal | null> {
  const instance = await loadInstance(instanceId);
  if (!instance) return null;

  const now = new Date().toISOString();
  instance.state = { ...deepMerge(instance.state, updates), updatedAt: now };
  instance.lastModified = now;
  await saveInstance(instance);

  return instance;
}

export async function getInstanceState(
  instanceId: string,
): Promise<ComponentInstanceInternal | null> {
  return loadInstance(instanceId);
}

/**
 * Installations are derived from the durable instances: one installation per
 * (pattern, agent) pair, carrying that pair's instance ids. Matching is by
 * exact agentId (the old Map version substring-matched, so "agent-1" also
 * matched "agent-10").
 */
export async function listInstallations(
  agentId?: string,
): Promise<Installation[]> {
  const grouped = new Map<string, Installation>();
  for (const instance of await listInstancesByAgent(agentId)) {
    if (!instance.agentId) continue;
    const key = `${instance.slug}::${instance.agentId}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.instanceIds.push(instance.instanceId);
    } else {
      grouped.set(key, {
        componentSlug: instance.slug,
        agentId: instance.agentId,
        installedAt: instance.createdAt,
        instanceIds: [instance.instanceId],
        version:
          componentRegistry.get(instance.slug)?.metadata.version ?? "1.0.0",
      });
    }
  }
  return Array.from(grouped.values());
}

export async function brokerStateHandoff(
  fromInstanceId: string,
  toComponentSlug: string,
  toAgentId: string,
  contextData?: Record<string, unknown>,
): Promise<ComponentInstanceInternal | null> {
  const fromInstance = await loadInstance(fromInstanceId);
  if (!fromInstance) return null;

  const inheritedState = {
    ...contextData,
    _handoffFrom: fromInstanceId,
    _handoffTimestamp: new Date().toISOString(),
  };

  const toInstance = await instantiateComponent(
    toComponentSlug,
    inheritedState,
    toAgentId,
    true,
  );

  if (toInstance) {
    console.log(
      `[HANDOFF] ${fromInstanceId} → ${toInstance.instanceId} (${toComponentSlug})`,
    );
  }

  return toInstance;
}

initializeRegistry();

export { componentRegistry };
