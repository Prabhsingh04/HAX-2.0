import { SiteShell } from "@/components/hax/v1/SiteShell";
import { MaterialHtml } from "@/components/hax/v1/library/MaterialHtml";

// Prabh's HAX-2.0 material-pattern.html in the v1 shell, restyled to v1 tokens.
export default function Page() {
  return (
    <SiteShell>
      <MaterialHtml page="pattern" />
    </SiteShell>
  );
}
