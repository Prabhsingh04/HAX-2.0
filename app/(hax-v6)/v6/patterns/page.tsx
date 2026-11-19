import type { Metadata } from "next";
import { SiteShell } from "@/components/hax/v6/SiteShell";
import { PatternList } from "@/components/hax/v6/patterns/PatternList";
import { DATA, LIST_ITEMS } from "@/components/hax/v6/patterns/data";

// The pattern library: Srishti's v3 draft (her list, filters and words), in v6's look.
// Synced by scripts/sync-hax-patterns.mjs. Filters live in the URL (?dimension=, ?category=).
export const metadata: Metadata = {
  title: "The pattern library · HAX v6",
  description: DATA.list.intro,
};

export default function Page() {
  return (
    <SiteShell>
      <PatternList items={LIST_ITEMS} list={DATA.list} />
    </SiteShell>
  );
}
