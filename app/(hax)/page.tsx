import { SiteShell } from "@/components/hax/v1/SiteShell";
import { Hero } from "@/components/hax/v1/home/Hero";
import { HowCompare } from "@/components/hax/v1/home/HowCompare";
import { HowItWorks } from "@/components/hax/v1/home/HowItWorks";
import { Principles } from "@/components/hax/v1/home/Principles";
import { FourSetups } from "@/components/hax/v1/home/FourSetups";
import { FourWaysIn } from "@/components/hax/v1/home/FourWaysIn";
import { FeaturedPatterns } from "@/components/hax/v1/home/FeaturedPatterns";
import { INTRO_SCRIPT } from "@/components/hax/v1/intro/script";
import { AgentsAndDevelopers } from "@/components/hax/v1/home/AgentsAndDevelopers";
import { BuiltBy } from "@/components/hax/v1/home/BuiltBy";

// Figma: HAX · Home 98:19357 (🌐 Website v1, file WHKYAV3BKe6iBdrxD4mzKU)
// FourSetups and FourWaysIn bring in HAX Studio v2's four setups and four audiences.
// 17 Nov (Srishti and Marc): v3's intro plays over the hero once a session (INTRO_SCRIPT hides the
// page before it paints), and four featured patterns replace the eight component families.
export default function Home() {
  return (
    <>
    <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
    <SiteShell announcement blobs>
      <Hero />
      <HowCompare />
      <Principles />
      <HowItWorks />
      <FourSetups />
      <FourWaysIn />
      <FeaturedPatterns />
      <AgentsAndDevelopers />
      <BuiltBy />
    </SiteShell>
    </>
  );
}
