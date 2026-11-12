import { SiteShell } from "@/components/hax/v1/SiteShell";
import { Hero } from "@/components/hax/v1/home/Hero";
import { HowCompare } from "@/components/hax/v1/home/HowCompare";
import { HowItWorks } from "@/components/hax/v1/home/HowItWorks";
import { TwoWaysIn } from "@/components/hax/v1/home/TwoWaysIn";
import { FourMoments } from "@/components/hax/v1/home/FourMoments";
import { AgentsAndDevelopers } from "@/components/hax/v1/home/AgentsAndDevelopers";
import { BuiltBy } from "@/components/hax/v1/home/BuiltBy";

// Figma: HAX · Home 98:19357 (🌐 Website v1, file WHKYAV3BKe6iBdrxD4mzKU)
export default function Home() {
  return (
    <SiteShell announcement>
      <Hero />
      <HowCompare />
      <HowItWorks />
      <TwoWaysIn />
      <FourMoments />
      <AgentsAndDevelopers />
      <BuiltBy />
    </SiteShell>
  );
}
