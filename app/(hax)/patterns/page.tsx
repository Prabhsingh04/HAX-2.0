import type { Metadata } from "next";
import { SiteShell } from "@/components/hax/v1/SiteShell";
import { PatternBrowser } from "@/components/hax/v1/library112/PatternBrowser";

// The full library (112 patterns) with Srishti's filters: who is involved and eleven categories
// (components/hax/v1/library112). Filters are read from and written to the URL by the browser.
export const metadata: Metadata = {
  title: "The pattern library · HAX",
  description: "Find the right pattern: browse by who is involved, one agent, agent teams and the people working with them, or by category.",
};

export default function Page() {
  return (
    <SiteShell>
      <PatternBrowser />
    </SiteShell>
  );
}
