import { SiteShell } from "@/components/hax/v3/SiteShell";
import { V1Embed } from "@/components/hax/v3/V1Embed";
import { Library } from "@/components/hax/v1/library/Library";
import { dsFrom } from "@/components/hax/v1/library/kit/ds-shared";
import { asLevel } from "@/components/hax/v1/library/setups";

// v3's Components page is v1's latest library (51 components in 8 families, live in shadcn/ui or
// Material 3, with the switch in the sidebar), in v1's dark theme under v3's nav (V1Embed).
// ?ds=material draws Material 3; ?setup=L1…L4 lists one of Home's four setups.
export default async function Page({ searchParams }: { searchParams: Promise<{ ds?: string | string[]; setup?: string | string[] }> }) {
  const { ds, setup } = await searchParams;
  return (
    <SiteShell>
      <V1Embed>
        <Library ds={dsFrom(ds)} setup={asLevel(setup)} />
      </V1Embed>
    </SiteShell>
  );
}
