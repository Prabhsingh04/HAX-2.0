import type { Metadata } from "next";
import { SiteShell } from "@/components/hax/v1/SiteShell";
import { PatternsIndex, type IndexRow } from "@/components/hax/v1/patterns/PatternsIndex";
import { PATTERNS, repliesOf, setupsOf } from "@/components/hax/v1/patterns/model";
import { parseFilters } from "@/components/hax/v1/patterns/filters";

// The 23 interaction patterns from HAX Studio v2 (lib/v2/catalog.ts), with their filters in the
// URL. Each pattern's own page is at /interaction-patterns/<id> (see patterns/href.ts).
export const metadata: Metadata = {
  title: "Interaction patterns · HAX",
  description: "How agents signal, explain, ask and agree, with people, and with each other.",
};

const ROWS: IndexRow[] = PATTERNS.map((p) => ({
  id: p.id, name: p.name, summary: p.summary, triggers: p.triggers,
  mode: p.mode.primary, level: p.level.primary, setups: setupsOf(p), channels: p.channels, replies: repliesOf(p),
}));

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const initial = parseFilters((k) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  });
  return (
    <SiteShell>
      <PatternsIndex rows={ROWS} initial={initial} />
    </SiteShell>
  );
}
