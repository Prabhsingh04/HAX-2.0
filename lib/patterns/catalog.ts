/**
 * Catalog loader (brief section 11, step 1). Reads the typed data files, runs
 * the validators once, and exposes the catalog + lookups behind an alias-aware
 * accessor. Invalid data is surfaced, not silently served: `loadCatalog` throws
 * on contract errors when `strict`, so a bad catalog fails fast at boot.
 */
import {
  type CatalogPattern,
  type ModeDef,
  type Mode,
} from "@/lib/patterns/behavior";
import { resolvePatternSlug } from "@/lib/patterns/aliases";
import { catalogPatterns, modeDefs } from "@/lib/patterns/catalog-data";
import {
  validateCatalog,
  type ValidationReport,
} from "@/lib/patterns/catalog-validate";

export interface Catalog {
  patterns: CatalogPattern[];
  modes: ModeDef[];
  byId: Map<string, CatalogPattern>;
  modeById: Map<Mode, ModeDef>;
  report: ValidationReport;
  /** Look up a pattern by id, resolving renamed/merged ids through the alias
   *  table (brief section 7 — old ids must resolve, not 404). */
  getPattern(id: string): CatalogPattern | undefined;
  /** Valid responses for a pattern: its own narrowing if present, else the
   *  primary mode's responses. */
  responsesFor(pattern: CatalogPattern): string[];
}

function build(patterns: CatalogPattern[], modes: ModeDef[]): Catalog {
  const byId = new Map(patterns.map((p) => [p.id, p]));
  const modeById = new Map(modes.map((m) => [m.id, m]));
  const report = validateCatalog(patterns, modes);

  const getPattern = (id: string): CatalogPattern | undefined =>
    byId.get(id) ?? byId.get(resolvePatternSlug(id));

  const responsesFor = (pattern: CatalogPattern): string[] =>
    pattern.responses ?? modeById.get(pattern.mode.primary)?.responses ?? [];

  return { patterns, modes, byId, modeById, report, getPattern, responsesFor };
}

let cached: Catalog | null = null;

/**
 * Load (and cache) the catalog. `strict` throws if validation found contract
 * errors — use it at server boot so bad data can't be served. Pass custom data
 * to validate an alternative source (e.g. the design side's files under test).
 */
export function loadCatalog(
  opts: {
    strict?: boolean;
    patterns?: CatalogPattern[];
    modes?: ModeDef[];
  } = {},
): Catalog {
  if (opts.patterns || opts.modes) {
    const c = build(opts.patterns ?? catalogPatterns, opts.modes ?? modeDefs);
    if (opts.strict && !c.report.ok) {
      throw new Error(
        `Catalog validation failed:\n- ${c.report.errors.join("\n- ")}`,
      );
    }
    return c;
  }
  if (!cached) cached = build(catalogPatterns, modeDefs);
  if (opts.strict && !cached.report.ok) {
    throw new Error(
      `Catalog validation failed:\n- ${cached.report.errors.join("\n- ")}`,
    );
  }
  return cached;
}
