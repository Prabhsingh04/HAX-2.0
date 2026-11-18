import { SiteShell } from "@/components/hax/v3/SiteShell";
import { V1Embed } from "@/components/hax/v3/V1Embed";
import { PatternPage } from "@/components/hax/v1/library/PatternPage";
import { dsFrom } from "@/components/hax/v1/library/kit/ds-shared";

// One component's page: v1's latest (live preview, Code, Copy for AI, Customize), in v1's dark
// theme under v3's nav (V1Embed). /v3/pattern?id=<component>; ?ds=material draws Material 3.
export default async function Page({ searchParams }: { searchParams: Promise<{ ds?: string | string[] }> }) {
  const { ds } = await searchParams;
  return (
    <SiteShell>
      <V1Embed>
        <PatternPage ds={dsFrom(ds)} />
      </V1Embed>
    </SiteShell>
  );
}
