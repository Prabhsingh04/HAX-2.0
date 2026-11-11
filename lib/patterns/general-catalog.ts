/**
 * The v3 library's "general" AI-UX patterns (the broader Nucleux map), served
 * alongside the behavior catalog. These aren't behavior patterns — no mode,
 * level, spec or responses — so they live outside the validated catalog and
 * never match a mode/level/channel/audience filter. Each one carries the
 * authored guidance from the design side's reference catalog: what/why/when/
 * how, the components it's composed of, variants, related patterns and a
 * markup sketch.
 *
 * Data is vendored unchanged from the design side's branch (lib/v3/).
 */
import { loadCatalog } from "@/lib/patterns/catalog";
import { getV3PatternsByCategory, type NucleuxCluster, type NucleuxStage } from "@/lib/v3/catalog";
import {
  getSourcePatternForV3Id,
  getV3IdForSourcePattern,
} from "@/lib/v3/source-patterns";

/** Compact entry, as listed by discover/list. */
export interface GeneralHit {
  id: string;
  name: string;
  summary: string;
  category: "general";
  stage: NucleuxStage;
  cluster: NucleuxCluster;
}

/** Full entry, as returned by fetch. */
export interface GeneralPattern extends GeneralHit {
  priority?: "crit" | "high" | "med" | "low";
  what?: string;
  why?: string;
  when?: string;
  how?: string;
  composed_of: string[];
  variants: { id: string; name: string; note?: string }[];
  related: string[];
  code: string;
}

function build(): GeneralPattern[] {
  return getV3PatternsByCategory("general").map((card) => {
    const src = getSourcePatternForV3Id(card.id);
    return {
      id: card.id,
      name: card.name,
      summary: card.summary,
      category: "general" as const,
      stage: card.nucleuxStage,
      cluster: card.nucleuxCluster,
      priority: src?.value,
      what: src?.what,
      why: src?.why,
      when: src?.when,
      how: src?.how,
      composed_of: src?.composed ?? [],
      variants: src?.variants ?? [],
      // Related ids in the source catalog are its short ids; expose v3 ids so
      // they can be passed straight back to fetch (unresolvable ones are
      // dropped in load()).
      related: (src?.related ?? []).map((r) => getV3IdForSourcePattern(r) ?? r),
      code: src?.code ?? "",
    };
  });
}

let cached: { list: GeneralPattern[]; byId: Map<string, GeneralPattern> } | null = null;

function load() {
  if (!cached) {
    const list = build();
    const byId = new Map(list.map((p) => [p.id, p]));
    const behavior = loadCatalog();
    for (const p of list) {
      p.related = p.related
        .map((r) => (byId.has(r) ? r : behavior.getPattern(r)?.id))
        .filter((r): r is string => Boolean(r));
    }
    cached = { list, byId };
  }
  return cached;
}

export function generalPatterns(): GeneralPattern[] {
  return load().list;
}

/** By v3 id ("nx-disclosure") or the source catalog's short id ("disclosure"). */
export function getGeneralPattern(id: string): GeneralPattern | undefined {
  const { byId } = load();
  return byId.get(id) ?? byId.get(getV3IdForSourcePattern(id) ?? `nx-${id}`);
}

export function generalHit(p: GeneralPattern): GeneralHit {
  return {
    id: p.id,
    name: p.name,
    summary: p.summary,
    category: p.category,
    stage: p.stage,
    cluster: p.cluster,
  };
}

/** Text used for search ranking (embeddings and token overlap). */
export function generalText(p: GeneralPattern): string {
  return [p.name, p.summary, p.what, p.when].filter(Boolean).join(". ");
}
