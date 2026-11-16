import { SiteShell } from "@/components/hax/v1/SiteShell";
import { Hero } from "@/components/hax/v1/home/Hero";
import { HowCompare } from "@/components/hax/v1/home/HowCompare";
import { HowItWorks } from "@/components/hax/v1/home/HowItWorks";
import { FourSetups } from "@/components/hax/v1/home/FourSetups";
import { FourWaysIn } from "@/components/hax/v1/home/FourWaysIn";
import { Families } from "@/components/hax/v1/home/Families";
import { AgentsAndDevelopers } from "@/components/hax/v1/home/AgentsAndDevelopers";
import { BuiltBy } from "@/components/hax/v1/home/BuiltBy";

// Figma: HAX · Home 98:19357 (🌐 Website v1, file WHKYAV3BKe6iBdrxD4mzKU)
// FourSetups and FourWaysIn bring in HAX Studio v2's four setups and four audiences.
export default function Home() {
  return (
    <SiteShell announcement blobs>
      <Hero />
      <HowCompare />
      <HowItWorks />
      <FourSetups />
      <FourWaysIn />
      <Families />
      <AgentsAndDevelopers />
      <BuiltBy />
    </SiteShell>
  );
}
