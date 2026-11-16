import { SiteShell } from "@/components/hax/v1/SiteShell";
import { dsFrom } from "@/components/hax/v1/library/kit/ds-shared";
import { PatternPage } from "@/components/hax/v1/library/PatternPage";

// Figma: HAX · Component · Disclosure 98:25413 — /pattern?id=<pattern>
// ?ds=material draws the components in Material 3 (the sidebar switch); otherwise shadcn/ui.
export default async function Page({ searchParams }: { searchParams: Promise<{ ds?: string | string[] }> }) {
  const { ds } = await searchParams;
  return (
    <SiteShell>
      <PatternPage ds={dsFrom(ds)} />
    </SiteShell>
  );
}
