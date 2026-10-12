/**
 * Backward-compatible slug aliases for the 17→23 catalog merge (2026-10).
 *
 * When the catalog is renamed/merged, existing MCP clients, stored instances,
 * and deep links still reference the OLD slugs. This map lets a lookup fall
 * back from an old slug to its new target, so nothing breaks across the cutover.
 *
 * It is inert until the rename actually lands: while the old slugs still exist
 * in the pattern data, a direct lookup hits first and the alias is never used.
 * Once a pattern is renamed, the old slug misses and resolves here instead.
 *
 * Only confirmed renames belong here. More will be added as the design side
 * finalizes the 23 names — a slug with no entry resolves to itself.
 */
export const PATTERN_ALIASES: Record<string, string> = {
  // Per the MCP server brief, section 7 — the full set of renames/merges.
  "background-work-ledger": "activity-record",
  "signal-to-intent-handshake": "pre-action-handshake",
  "dependency-and-lineage-view": "lineage-view",
  // Decision Record merges two older patterns.
  "decision-ledger": "decision-record",
  "proposed-commits": "decision-record",
};

/** Map an old slug to its new target, or return the slug unchanged. */
export function resolvePatternSlug(slug: string): string {
  return PATTERN_ALIASES[slug] ?? slug;
}
