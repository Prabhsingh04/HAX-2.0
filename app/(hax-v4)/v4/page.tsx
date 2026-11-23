import { SiteShell } from "@/components/hax/v6/SiteShell";
import { INTRO_SCRIPT } from "@/components/hax/v6/world/script";
import { Hero } from "@/components/hax/v6/home/Hero";
import { HowCompare } from "@/components/hax/v6/home/HowCompare";
// 19 Nov: the principles dial (home/Principles.tsx + orbs.ts, kept) gave way to five crystal balls in a row
import { PrinciplesBall } from "@/components/hax/v6/home/PrinciplesBall";
import { HowItWorks } from "@/components/hax/v6/home/HowItWorks";
import { FourSetups } from "@/components/hax/v6/home/FourSetups";
import { FourWaysIn } from "@/components/hax/v6/home/FourWaysIn";
import { FeaturedPatterns } from "@/components/hax/v6/home/FeaturedPatterns";
import { McpSection } from "@/components/hax/v6/home/McpSection";
import { BuiltBy } from "@/components/hax/v6/home/BuiltBy";
import { Parallax } from "@/components/hax/v6/Parallax";

// HAX v4 · Home: v3's design and motion (Figma 🌐 Website v3, Home 105:5876) on white, with v1's
// latest content in v1's latest order (v5, Srishti and Marc's review, 14 and 17 Nov): the intro
// without the sun and horizon, the comparison, five principles, how it works, four setups, four ways
// in, four featured patterns, MCP and the closing panel. No section dividers.
export default function Home() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
      <SiteShell>
        <Hero />
        <HowCompare />
        <PrinciplesBall />
        <HowItWorks />
        <FourSetups />
        <FourWaysIn />
        <FeaturedPatterns />
        <McpSection />
        <BuiltBy />
      </SiteShell>
      <Parallax />
    </>
  );
}
