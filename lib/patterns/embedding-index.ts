import "server-only";
import { patterns, type Pattern } from "@/lib/patterns";
import { embed } from "@/lib/llm/gateway";

/**
 * Deterministic semantic retrieval over the 17 patterns (bge-m3 embeddings,
 * local via the gateway). The 17 vectors are embedded once and cached in
 * memory; a query is embedded and cosine-ranked against them.
 *
 * This is the RETRIEVAL layer: it reliably surfaces the right pattern into the
 * top few, but doesn't always rank it #1 on subtle conceptual distinctions —
 * so callers use it to pick candidates, then an LLM reranks + explains.
 * Returns null on any failure so callers fall back to the keyword scorer.
 */

function patternText(p: Pattern): string {
  return [p.title, p.oneliner, p.explanation, p.whatItSolves, p.example]
    .filter(Boolean)
    .join(". ");
}

let indexPromise: Promise<Map<string, number[]>> | null = null;

function buildIndex(): Promise<Map<string, number[]>> {
  if (!indexPromise) {
    indexPromise = (async () => {
      const entries = await Promise.all(
        patterns.map(
          async (p) => [p.slug, await embed(patternText(p))] as const,
        ),
      );
      return new Map(entries);
    })().catch((err) => {
      indexPromise = null; // let it retry on the next call
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

export type RankedPattern = { slug: string; score: number };

/** Top-N patterns by cosine similarity, or null if embeddings are unavailable. */
export async function rankPatterns(
  query: string,
  limit = 5,
): Promise<RankedPattern[] | null> {
  try {
    const index = await buildIndex();
    const qv = await embed(query);
    return [...index.entries()]
      .map(([slug, v]) => ({ slug, score: cosine(qv, v) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch (err) {
    console.error("[embedding-index] rank failed, caller should fall back:", err);
    return null;
  }
}
