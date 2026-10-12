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

/** Lowercase tokens for a loose free-text match over a pattern's text fields. */
function matchesQuery(p: CatalogPattern, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    p.id,
    p.name,
    p.summary,
    p.spec,
    ...p.triggers,
    ...p.merged_from,
  ]
    .join(" ")
    .toLowerCase();
  // All query tokens must appear (AND), so a specific query narrows.
  return q
    .split(/\s+/)
    .filter((t) => t.length > 1)
    .every((t) => haystack.includes(t));
}

export function discover(
  filters: DiscoverFilters = {},
  catalog: Catalog = loadCatalog(),
): DiscoverResult {
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

  const results = catalog.patterns
    .filter((p) => {
      // Mode membership is by PRIMARY mode (the brief's counts are by-primary,
      // and "delegate/request have zero patterns" only holds if secondary modes
      // don't count as catalog membership). Secondary mode still rides along in
      // each hit for agents that want it.
      if (mode && p.mode.primary !== mode) return false;
      if (level && p.level.primary !== level && !(level in p.level.notes)) return false;
      if (channel && !p.channels.includes(channel)) return false;
      if (audience && !p.audience.includes(audience)) return false;
      if (filters.query && !matchesQuery(p, filters.query)) return false;
      return true;
    })
    .map((p) => hit(catalog, p));

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
