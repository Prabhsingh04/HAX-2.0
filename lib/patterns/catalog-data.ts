/**
 * Canonical catalog data source for the loader + validators.
 *
 * This now re-exports the design side's v2 catalog (lib/v2/*), vendored from
 * their `v2-studio-and-patterns-update` branch. Their `Pattern`/`ModeDef` types
 * match our behavior contract field-for-field (plus a few extra UI fields), so
 * the cast is structural, not lossy. The validators run over this on load.
 *
 * To re-sync after the design side updates their catalog: re-pull lib/v2/
 * catalog.ts + modes.ts (+ types.ts, levels.ts) from their branch and run
 * `npm run validate:catalog`.
 */
import { patterns } from "@/lib/v2/catalog";
import { modes } from "@/lib/v2/modes";
import type { CatalogPattern, ModeDef } from "@/lib/patterns/behavior";

export const catalogPatterns = patterns as unknown as CatalogPattern[];
export const modeDefs = modes as unknown as ModeDef[];
