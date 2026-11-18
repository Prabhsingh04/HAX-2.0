import "./setups.css";
import type { CSSProperties } from "react";
import { LEVEL_LABEL, LEVEL_ORDER } from "@/lib/v2/levels";
import type { Level } from "@/lib/v2/types";
import { SetupArt, SetupKey } from "../../v1/patterns/SetupArt";
import { Eyebrow, H2, Sub } from "../ui";
import { FibersBackdrop } from "../fx";

// HAX Studio v2's four setups (lib/v2/levels.ts), as on v1's Home: the same words and v1's own diagrams
// (agents, people, a person in the loop), in v3's look: one dark panel split by hairlines. Hovering a
// setup runs its messages. v3's library data has no setups, so unlike v1 the columns list no components.
// The setups arrive one after another (motion.css .h3-seq). Purple ghost fibres drift behind the
// whole section, edge to edge, and their focus follows the cursor; the hover lives there, so the
// cards themselves stay still and show the fibres through their glass (fx.tsx FibersBackdrop, tablets
// and up). Two columns on phones and tablets, four on desktop.
const LINE: Record<Level, string> = {
  L1: "The agent describes its own action or state.",
  L2: "Agents coordinate with peers or an orchestrator.",
  L3: "One person can follow, guide, or approve the exchange.",
  L4: "People and teams can see decisions and understand who owns them.",
};

// hairlines between setups: 2 × 2 below lg (the second row keeps a top line), four in a row from lg
const edges = (i: number) => [i >= 2 ? "border-t lg:border-t-0" : "", i % 2 ? "border-l" : "", i > 0 ? "lg:border-l" : ""].join(" ");

export function FourSetups() {
  return (
    <section id="setups" className="relative overflow-hidden px-[24px] py-[64px] md:py-[96px]">
      <FibersBackdrop />
      <div className="relative mx-auto flex max-w-[1200px] flex-col gap-[32px] md:gap-[48px]">
        <div className="h3-reveal flex flex-col gap-[16px]">
          <Eyebrow>Four setups</Eyebrow>
          <H2>The same patterns work<br />across four setups</H2>
          <Sub className="max-w-[640px] max-md:text-[16px] max-md:leading-[24px]">Choose the simplest setup that fits the exchange. As more agents and people join, make responsibilities and decision rights clear.</Sub>
        </div>
        <div className="flex flex-col gap-[20px]">
          <div className="h3-reveal h3-seq grid grid-cols-2 overflow-clip rounded-[24px] border border-[var(--edge-2)] bg-[rgba(22,26,33,.62)] backdrop-blur-[8px] lg:grid-cols-4">
            {LEVEL_ORDER.map((l, i) => (
              // four bands shared across the columns (subgrid), so numbers, names and lines sit level
              <div key={l} className={`h3-step row-span-4 grid grid-rows-subgrid content-start border-[var(--edge)] ${edges(i)}`} style={{ "--i": i } as CSSProperties}>
                <div className="px-[16px] pt-[20px] md:px-[40px] md:pt-[40px]"><SetupArt level={l} /></div>
                <p className="px-[16px] pt-[16px] font-[family-name:var(--font-mono)] leading-[16px] text-[12px] tracking-[0.96px] text-[color:var(--text-3)] md:px-[28px] md:pt-[28px]">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="px-[16px] pt-[6px] font-semibold leading-[22px] text-[16px] text-[color:var(--text)] md:px-[28px] md:pt-[8px] md:leading-[28px] md:text-[18px]">{LEVEL_LABEL[l]}</h3>
                <p className="px-[16px] pb-[20px] pt-[4px] leading-[20px] text-[13px] text-[color:var(--text-2)] md:px-[28px] md:pb-[32px] md:pt-[6px] md:leading-[24px] md:text-[15px]">{LINE[l]}</p>
              </div>
            ))}
          </div>
          <SetupKey />
        </div>
      </div>
    </section>
  );
}
