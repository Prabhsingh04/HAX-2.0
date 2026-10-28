/**
 * discover + fetch over the behavior catalog (brief section 8, build step 2).
 * Read-only, no mutable state. These return the brief's contract shapes exactly,
 * so they can back both the MCP tool surface and the HTTP surface unchanged.
 *
 *   discover — find the behavior that fits a situation. Optional AND-combined
 *     filters (mode/level/channel/audience) plus free-text query. Each hit
 *     carries the behavioral contract (spec, mode, valid responses, level/
 *     channel) so an agent can act without a second round-trip. A filter combo
 *     that is a known-empty gap returns a gap note, not a pretend result. An
 *     unknown enum value is a request error naming the bad field (the HTTP layer
 *     maps this to 4xx), distinct from a valid-but-empty result.
 *
 *   fetch — one full pattern by id (behavior + rendering), alias-aware. A
 *     genuinely unknown id is a miss (the HTTP layer maps this to 404).
 */
import {
  AUDIENCES,
  CHANNELS,
  LEVELS,
  MODES,
  type Audience,
  type CatalogPattern,
  type Channel,
  type Level,
  type Mode,
} from "@/lib/patterns/behavior";
import { loadCatalog, type Catalog } from "@/lib/patterns/catalog";

/** Modes the brief documents as intentionally empty (gaps, not errors). */
const EMPTY_MODES: readonly Mode[] = ["request", "delegate"];

export interface DiscoverFilters {
  mode?: string;
  level?: string;
  channel?: string;
  audience?: string;
  query?: string;
}

/** The per-hit behavioral contract — enough to act on without a `fetch`. */
export interface DiscoverHit {
  id: string;
  name: string;
  summary: string;
  spec: string;
  mode: { primary: Mode; secondary?: Mode };
  level: { primary: Level };
  channels: Channel[];
  responses: string[]; // the valid responses the agent must handle
  evidence: CatalogPattern["evidence"];
}

export interface GapNote {
  mode?: Mode;
  level?: Level;
  reason: string;
}

export type DiscoverResult =
  | { ok: true; results: DiscoverHit[]; gap?: GapNote; version: string }
  | { ok: false; error: { field: string; value: string; message: string } };

function hit(catalog: Catalog, p: CatalogPattern): DiscoverHit {
  return {
    id: p.id,
    name: p.name,
    summary: p.summary,
    spec: p.spec,
    mode: p.mode,
    level: { primary: p.level.primary },
    channels: p.channels,
    responses: catalog.responsesFor(p),
    evidence: p.evidence,
  };
}

const QUERY_STOP = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "how", "in",
  "is", "it", "its", "of", "on", "or", "that", "the", "their", "them", "they",
  "this", "to", "want", "what", "when", "which", "with", "you", "your", "need",
  "where", "who", "person", "agent", "agents",
]);

/**
 * Relevance score of a pattern for a free-text query: how many distinct query
 * tokens hit the pattern's text, weighted by where they land (name/id strongest,
 * then triggers, then spec/summary). 0 means no match. Ranks results rather than
 * requiring every token to appear — natural-language queries rarely match all.
 */
function queryScore(p: CatalogPattern, query: string): number {
  const tokens = [
    ...new Set(
      query
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((t) => t.length > 1 && !QUERY_STOP.has(t)),
    ),
  ];
  if (!tokens.length) return 1; // query was all stopwords — don't filter it out

  const strong = `${p.id} ${p.name}`.toLowerCase();
  const mid = (p.triggers ?? []).join(" ").toLowerCase();
  const weak = `${p.summary} ${p.spec} ${(p.merged_from ?? []).join(" ")}`.toLowerCase();

  let score = 0;
  for (const t of tokens) {
    if (strong.includes(t)) score += 4;
    else if (mid.includes(t)) score += 2;
    else if (weak.includes(t)) score += 1;
  }
  return score;
}

/**
 * Order `pool` by semantic (embedding) similarity to the query, best first.
 * Dynamically imports the embedding index so this module stays usable without a
 * hard server-only dependency. Returns null if embeddings are unavailable, so
 * the caller falls back to token-overlap ranking.
 */
async function rankBySemantic(
  query: string,
  pool: CatalogPattern[],
): Promise<CatalogPattern[] | null> {
  try {
    const { rankCatalog } = await import("@/lib/patterns/catalog-embedding-index");
    const ranked = await rankCatalog(query);
    if (!ranked) return null;
    const inPool = new Set(pool.map((p) => p.id));
    const byId = new Map(pool.map((p) => [p.id, p]));
    return ranked
      .filter((r) => inPool.has(r.id))
      .map((r) => byId.get(r.id)!);
  } catch {
    return null;
  }
}

export async function discover(
  filters: DiscoverFilters = {},
  catalog: Catalog = loadCatalog(),
): Promise<DiscoverResult> {
  // Validate enums first — an unknown value is a request error, not empty.
  const checks: Array<[keyof DiscoverFilters, readonly string[]]> = [
    ["mode", MODES],
    ["level", LEVELS],
    ["channel", CHANNELS],
    ["audience", AUDIENCES],
  ];
  for (const [field, allowed] of checks) {
    const value = filters[field];
    if (value != null && !allowed.includes(value)) {
      return {
        ok: false,
        error: {
          field,
          value,
          message: `Unknown ${field} "${value}". Expected one of: ${allowed.join(", ")}.`,
        },
      };
    }
  }

  const mode = filters.mode as Mode | undefined;
  const level = filters.level as Level | undefined;
  const channel = filters.channel as Channel | undefined;
  const audience = filters.audience as Audience | undefined;

  const filtered = catalog.patterns.filter((p) => {
    // Mode membership is by PRIMARY mode (the brief's counts are by-primary,
    // and "delegate/request have zero patterns" only holds if secondary modes
    // don't count as catalog membership). Secondary mode still rides along in
    // each hit for agents that want it.
    if (mode && p.mode.primary !== mode) return false;
    if (level && p.level.primary !== level && !(level in p.level.notes)) return false;
    if (channel && !p.channels.includes(channel)) return false;
    if (audience && !p.audience.includes(audience)) return false;
    return true;
  });

  // Free-text query ranks (and prunes) the structurally-filtered set. Prefer
  // semantic (embedding) ranking so natural-language queries land on the right
  // pattern; fall back to literal token-overlap when embeddings are unavailable.
  let ranked: CatalogPattern[];
  const q = filters.query?.trim();
  if (q && filtered.length > 0) {
    const semantic = await rankBySemantic(q, filtered);
    ranked = (
      semantic ??
      filtered
        .map((p) => ({ p, score: queryScore(p, q) }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((x) => x.p)
    ).slice(0, 10); // like the prior discover_patterns: top matches, not all 23
  } else {
    ranked = filtered;
  }

  const results = ranked.map((p) => hit(catalog, p));

  const version = catalogVersion(catalog);

  // Empty-but-valid: attach a gap note when the emptiness is expected.
  if (results.length === 0) {
    if (mode && EMPTY_MODES.includes(mode)) {
      return {
        ok: true,
        results,
        version,
        gap: { mode, reason: `Mode "${mode}" has no patterns yet.` },
      };
    }
    if (level) {
      const n = catalog.patterns.filter((p) => p.level.primary === level).length;
      if (n === 0) {
        return {
          ok: true,
          results,
          version,
          gap: { level, reason: `No patterns at level ${level} match these filters.` },
        };
      }
    }
  }

  return { ok: true, results, version };
}

export type FetchResult =
  | { ok: true; pattern: CatalogPattern; version: string }
  | { ok: false; error: { field: "id"; value: string; message: string } };

export function fetch(
  id: string,
  catalog: Catalog = loadCatalog(),
): FetchResult {
  const pattern = catalog.getPattern(id); // alias-aware
  if (!pattern) {
    return {
      ok: false,
      error: { field: "id", value: id, message: `No pattern with id "${id}".` },
    };
  }
  return { ok: true, pattern, version: catalogVersion(catalog) };
}

/** A coarse catalog version so caching agents can tell when it changed. Derived
 *  from the catalog shape; replace with a real data-file version once the
 *  canonical files carry one. */
export function catalogVersion(catalog: Catalog = loadCatalog()): string {
  return `catalog-${catalog.patterns.length}p-${catalog.modes.length}m`;
}
