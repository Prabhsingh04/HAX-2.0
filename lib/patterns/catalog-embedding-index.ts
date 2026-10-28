import "server-only";
import { embed } from "@/lib/llm/gateway";
import { loadCatalog } from "@/lib/patterns/catalog";
import type { CatalogPattern } from "@/lib/patterns/behavior";

/**
 * Semantic retrieval over the 23-pattern behavior catalog (bge-m3 embeddings,
 * local via the gateway). Mirrors lib/patterns/embedding-index.ts but over the
 * v2 CatalogPattern set. Vectors are embedded once and cached; a query is
 * embedded and cosine-ranked against them.
 *
 * This is what makes a natural-language query land on the right pattern
 * semantically (e.g. "when security agents disagree" → Convergence Point),
 * which literal token-overlap ranking can't do. Returns null on any failure so
 * discover() falls back to the token scorer.
 */
function patternText(p: CatalogPattern): string {
  return [
    p.name,
    p.summary,
    p.spec,
    (p.triggers ?? []).join(". "),
    (p.merged_from ?? []).join(". "),
  ]
    .filter(Boolean)
    .join(". ");
}

let indexPromise: Promise<Map<string, number[]>> | null = null;

function buildIndex(): Promise<Map<string, number[]>> {
  if (!indexPromise) {
    indexPromise = (async () => {
      const pats = loadCatalog().patterns;
      const entries = await Promise.all(
        pats.map(async (p) => [p.id, await embed(patternText(p))] as const),
      );
      return new Map(entries);
    })().catch((err) => {
      indexPromise = null; // allow retry on the next call
      throw err;
    });
  }
  return indexPromise;
}

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i]! * b[i]!;
    na += a[i]! * a[i]!;
    nb += b[i]! * b[i]!;
  }
  return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
}

export type RankedCatalogEntry = { id: string; score: number };

/** All catalog patterns ranked by cosine similarity to the query (best first),
 *  or null if embeddings are unavailable. */
export async function rankCatalog(
  query: string,
): Promise<RankedCatalogEntry[] | null> {
  try {
    const index = await buildIndex();
    const qv = await embed(query);
    return [...index.entries()]
      .map(([id, v]) => ({ id, score: cosine(qv, v) }))
      .sort((a, b) => b.score - a.score);
  } catch (err) {
    console.error("[catalog-embedding-index] rank failed, falling back:", err);
    return null;
  }
}
