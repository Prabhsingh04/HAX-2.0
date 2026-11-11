/**
 * Canonical catalog data source for the loader + validators.
 *
 * This now re-exports the design side's v2 catalog (lib/v2/*), vendored from
 * their `v2-studio-and-patterns-update` branch, plus the seven agentic patterns
 * their v3 library added (lib/v3/new-agentic-details.ts — Pattern-shaped, so
 * they carry the same behavior contract). Their `Pattern`/`ModeDef` types
 * match our behavior contract field-for-field (plus a few extra UI fields), so
 * the cast is structural, not lossy. The validators run over this on load.
 *
 * The v3 library's lighter "general" AI-UX patterns are not behavior patterns
 * (no mode/level/spec); they're served separately by general-catalog.ts.
 *
 * To re-sync after the design side updates their catalog: re-pull lib/v2/
 * catalog.ts + modes.ts (+ types.ts, levels.ts) and lib/v3/{catalog,
 * new-agentic-details,source-patterns}.ts + source-patterns.json from their
 * branch and run `npm run validate:catalog`.
 */
import { patterns } from "@/lib/v2/catalog";
import { modes } from "@/lib/v2/modes";
import { NEW_AGENTIC_DETAILS } from "@/lib/v3/new-agentic-details";
import type { CatalogPattern, ModeDef } from "@/lib/patterns/behavior";

export const catalogPatterns = [
  ...patterns,
  ...NEW_AGENTIC_DETAILS,
] as unknown as CatalogPattern[];
export const modeDefs = modes as unknown as ModeDef[];
