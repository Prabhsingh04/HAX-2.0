import "server-only";
import { embed } from "@/lib/llm/gateway";
import { loadCatalog } from "@/lib/patterns/catalog";
import type { CatalogPattern } from "@/lib/patterns/behavior";
import { generalPatterns, generalText } from "@/lib/patterns/general-catalog";

/**
 * Semantic retrieval over the behavior catalog (bge-m3 embeddings,
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

type Index = Map<string, number[]>;

function lazyIndex(items: () => Array<{ id: string; text: string }>) {
  let promise: Promise<Index> | null = null;
  return (): Promise<Index> => {
    if (!promise) {
      promise = (async () => {
        const entries = await Promise.all(
          items().map(async ({ id, text }) => [id, await embed(text)] as const),
        );
        return new Map(entries);
      })().catch((err) => {
        promise = null; // allow retry on the next call
        throw err;
      });
    }
    return promise;
  };
}

const buildIndex = lazyIndex(() =>
  loadCatalog().patterns.map((p) => ({ id: p.id, text: patternText(p) })),
);
const buildGeneralIndex = lazyIndex(() =>
  generalPatterns().map((p) => ({ id: p.id, text: generalText(p) })),
);

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
  return rank(query, buildIndex);
}

/** The v3 general (non-behavior) patterns ranked the same way, or null. */
export async function rankGeneral(
  query: string,
): Promise<RankedCatalogEntry[] | null> {
  return rank(query, buildGeneralIndex);
}

async function rank(
  query: string,
  getIndex: () => Promise<Index>,
): Promise<RankedCatalogEntry[] | null> {
  try {
    const index = await getIndex();
    const qv = await embed(query);
    return [...index.entries()]
      .map(([id, v]) => ({ id, score: cosine(qv, v) }))
      .sort((a, b) => b.score - a.score);
  } catch (err) {
    console.error("[catalog-embedding-index] rank failed, falling back:", err);
    return null;
  }
}
