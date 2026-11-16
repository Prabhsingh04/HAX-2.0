import { SiteShell } from "@/components/hax/v1/SiteShell";
import { dsFrom } from "@/components/hax/v1/library/kit/ds-shared";
import { asLevel } from "@/components/hax/v1/library/setups";
import { Library } from "@/components/hax/v1/library/Library";

// Figma: HAX · Components 98:19982
// ?ds=material draws the components in Material 3 (the sidebar switch); otherwise shadcn/ui.
// ?setup=L1…L4 lists only the components for one of the four setups on Home.
export default async function Page({ searchParams }: { searchParams: Promise<{ ds?: string | string[]; setup?: string | string[] }> }) {
  const { ds, setup } = await searchParams;
  return (
    <SiteShell>
      <Library ds={dsFrom(ds)} setup={asLevel(setup)} />
    </SiteShell>
  );
}
