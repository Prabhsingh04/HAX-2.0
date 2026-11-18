import { SiteShell } from "@/components/hax/v3/SiteShell";
import { HorizonRule } from "@/components/hax/v3/ui";
import { Hero } from "@/components/hax/v3/home/Hero";
import { HowCompare } from "@/components/hax/v3/home/HowCompare";
import { HowItWorks } from "@/components/hax/v3/home/HowItWorks";
import { FourSetups } from "@/components/hax/v3/home/FourSetups";
import { FourWaysIn } from "@/components/hax/v3/home/FourWaysIn";
import { Families } from "@/components/hax/v3/home/Families";
import { McpSection } from "@/components/hax/v3/home/McpSection";
import { BuiltBy } from "@/components/hax/v3/home/BuiltBy";

// Figma: HAX v3 · Home 105:5876 (🌐 Website v3, file WHKYAV3BKe6iBdrxD4mzKU)
export default function Home() {
  return (
    <SiteShell>
      <Hero />
      <HowCompare />
      <HorizonRule />
      <HowItWorks />
      <HorizonRule />
      <FourSetups />
      <FourWaysIn />
      <Families />
      <HorizonRule />
      <McpSection />
      <HorizonRule />
      <BuiltBy />
    </SiteShell>
  );
}
