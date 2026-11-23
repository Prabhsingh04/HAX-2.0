import "@/components/hax/v6/home/setups.css";
import type { CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import { LEVEL_LABEL, LEVEL_ORDER } from "@/lib/v2/levels";
import type { Level } from "@/lib/v2/types";
import { LIBRARY } from "@/components/hax/v1/library112/library";
import { SetupArt, SetupKey } from "@/components/hax/v1/patterns/SetupArt";
import { FibersBackdrop } from "@/components/hax/v6/fx";
import { Eyebrow, H2, btn } from "@/components/hax/v6/ui";

// HAX Studio v2's four setups with v1's data (lib/v2/levels.ts, v1's diagrams), kept minimal (19 Nov:
// the four boxed columns felt heavy): four steps in a row, from one agent to people and teams, each
// with its diagram, name, one line and how many patterns work in it, counted the way the patterns
// page counts them ("Who is involved?"), linking there with that setup picked; then all 112 patterns.
// HAX is patterns now: no components here. Over the ghost fibres again (fx.tsx FibersBackdrop,
// tablets and up). The steps arrive one after another (motion.css
// .h6-seq); hovering one runs its messages. Two by two on phones and tablets, four in a row on desktop.
const LINE: Record<Level, string> = {
  L1: "The agent describes its own action or state.",
  L2: "Agents coordinate with peers or an orchestrator.",
  L3: "One person can follow, guide, or approve the exchange.",
  L4: "People and teams can see decisions and understand who owns them.",
};

// patterns that work in a setup (only agentic patterns carry setups; one can work in several)
const inSetup = (l: Level) => LIBRARY.filter((p) => p.kind === "agentic" && p.dimensions.includes(l)).length;

export function FourSetups() {
  return (
    <section id="setups" className="relative overflow-hidden px-[24px] py-[72px] md:py-[112px]">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-[15%] -bottom-[15%]" data-parallax="16">
        <FibersBackdrop subtle />
      </div>
      <div className="relative mx-auto flex max-w-[1200px] flex-col gap-[44px] md:gap-[64px]">
        <div className="h6-reveal flex flex-col gap-[16px]">
          <Eyebrow>Four setups</Eyebrow>
          <H2>The same patterns work<br />across four setups</H2>
        </div>
        <ol className="h6-reveal h6-seq grid grid-cols-2 gap-x-[20px] gap-y-[48px] lg:grid-cols-4 lg:gap-x-[48px]">
          {LEVEL_ORDER.map((l, i) => {
            const n = inSetup(l);
            return (
              <li key={l} className="su-live h6-step flex flex-col" style={{ "--i": i } as CSSProperties}>
                {/* the diagram, on a soft white glow so it reads over the fibres */}
                <div className="relative mb-[20px] px-[4px] md:mb-[28px] md:px-[12px]">
                  <span aria-hidden className="pointer-events-none absolute inset-[-14%_-4%] rounded-full" style={{ background: "radial-gradient(closest-side, rgba(255,255,255,.95), rgba(255,255,255,.6) 55%, rgba(255,255,255,0))" }} />
                  <SetupArt level={l} className="relative" />
                </div>
                {/* one hairline under all four, a step each, simplest to fullest */}
                <div className="flex items-baseline gap-[10px] border-t border-[var(--edge-2)] pt-[16px]">
                  <span className="font-[family-name:var(--font-mono)] leading-[16px] text-[12px] tracking-[0.96px] text-[color:var(--text-3)]">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="font-semibold leading-[22px] text-[16px] text-[color:var(--text)] md:leading-[26px] md:text-[18px]">{LEVEL_LABEL[l]}</h3>
                </div>
                <p className="mt-[8px] leading-[20px] text-[13px] text-[color:var(--text-2)] md:leading-[24px] md:text-[15px]">{LINE[l]}</p>
                <a href={`/v6/patterns?dimension=${l}`} className="mt-[14px] flex w-fit items-center gap-[6px] font-semibold leading-[18px] text-[13px] text-[color:var(--link)]">
                  <span className="h6-link">{n} {n === 1 ? "pattern" : "patterns"}</span>
                  <ArrowRight size={13} aria-hidden="true" className="h6-arrow" />
                </a>
              </li>
            );
          })}
        </ol>
        <div className="flex flex-col items-start gap-[16px] md:flex-row md:items-center md:justify-between">
          <SetupKey />
          <a href="/v6/patterns" className={`${btn} h6-btn--secondary !text-[14px] !leading-[20px]`}>
            Browse all {LIBRARY.length} patterns
            <ArrowRight size={16} aria-hidden="true" className="h6-arrow" />
          </a>
        </div>
      </div>
    </section>
  );
}
