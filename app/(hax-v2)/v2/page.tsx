import { SiteShell } from "@/components/hax/v2/SiteShell";
import { Hero } from "@/components/hax/v2/home/Hero";
import { HowCompare } from "@/components/hax/v2/home/HowCompare";
import { HowItWorks } from "@/components/hax/v2/home/HowItWorks";
import { TwoWaysIn } from "@/components/hax/v2/home/TwoWaysIn";
import { FourMoments } from "@/components/hax/v2/home/FourMoments";
import { McpBand } from "@/components/hax/v2/home/McpBand";
import { BuiltBy } from "@/components/hax/v2/home/BuiltBy";

// Figma: HAX v2 · Home 103:3135 (🌐 Website v2, file WHKYAV3BKe6iBdrxD4mzKU)
export default function Home() {
  return (
    <SiteShell>
      <Hero />
      <HowCompare />
      <HowItWorks />
      <TwoWaysIn />
      <FourMoments />
      <McpBand />
      <BuiltBy />
    </SiteShell>
  );
}
