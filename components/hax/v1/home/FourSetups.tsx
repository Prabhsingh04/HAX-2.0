import { ArrowRight } from "lucide-react";
import { LEVEL_LABEL, LEVEL_ORDER } from "@/lib/v2/levels";
import type { Level } from "@/lib/v2/types";
import { BY_COMP, COMPS } from "../library/catalog";
import { FEATURED, compsIn } from "../library/setups";
import { SetupArt, SetupKey } from "../patterns/SetupArt";

// HAX Studio v2's four setups (lib/v2/levels.ts), shown with our own components: each column
// features three from the library and links to their pages; "See all" opens the library
// filtered to that setup (library/setups.ts). One outlined strip with hairline columns, so it
// reads apart from the Families cards. Hovering a column runs its messages (.su-live).
const LINE: Record<Level, string> = {
  L1: "The agent describes its own action or state.",
  L2: "Agents coordinate with peers or an orchestrator.",
  L3: "One person can follow, guide, or approve the exchange.",
  L4: "People and teams can see decisions and understand who owns them.",
};
const eyebrow = "font-semibold leading-[16px] text-[11px] text-[color:var(--text-secondary)] tracking-[1.2px] uppercase";

export function FourSetups() {
  return (
    <section id="setups" className="flex w-full flex-col items-center px-[var(--hx-gutter)] py-[56px] md:py-[96px]">
      <div className="hx-reveal flex flex-col items-center gap-[16px] text-center">
        <h2 className="font-extralight leading-[42px] text-[34px] [text-wrap:balance] md:leading-[52px] md:text-[42px] xl:leading-[60px] xl:text-[50px] xl:whitespace-nowrap">The same patterns work across four setups</h2>
        <p className="max-w-[640px] leading-[26px] text-[16px] text-[color:var(--text-secondary)] [text-wrap:balance]">
          Choose the simplest setup that fits the exchange. As more agents and people join, make responsibilities and decision rights clear.
        </p>
      </div>
      <div className="hx-reveal mt-[28px] grid w-full max-w-[1152px] grid-cols-2 rounded-[var(--radius-2xl)] border border-[var(--stroke-subtle)] md:mt-[40px] xl:mt-[48px] xl:grid-cols-4">
        {LEVEL_ORDER.map((l, i) => {
          const n = compsIn(l).length;
          return (
            // four bands shared across the columns (subgrid), so titles, counts, lists and links line up
            <div key={l} className="su-live row-span-4 grid grid-rows-subgrid border-[var(--stroke-subtle)] p-[12px] md:p-[20px] max-xl:[&:nth-child(even)]:border-l max-xl:[&:nth-child(n+3)]:border-t xl:[&:not(:first-child)]:border-l">
              <SetupArt level={l} />
              <div className="flex flex-col gap-[4px] pt-[10px] md:gap-[6px] md:pt-[20px]">
                <p className={eyebrow}>{String(i + 1).padStart(2, "0")}</p>
                <div className="flex flex-col gap-[4px]">
                  <h3 className="font-semibold leading-[19px] text-[14.5px] md:whitespace-nowrap md:leading-[26px] md:text-[18px]">{LEVEL_LABEL[l]}</h3>
                  <p className="leading-[17px] text-[12px] text-[color:var(--text-secondary)] md:leading-[22px] md:text-[14px]">{LINE[l]}</p>
                </div>
              </div>
              <div className="flex flex-col gap-[8px] pt-[20px] max-md:hidden">
                <p className="font-semibold leading-[18px] text-[13px]">{n} components apply</p>
                <ul className="flex flex-col">
                  {FEATURED[l].map((id) => (
                    <li key={id}>
                      <a href={`/pattern?id=${id}`} className="hx-side -mx-[10px] flex h-[36px] items-center justify-between gap-[8px] rounded-[8px] px-[10px] leading-[20px] text-[14px]">
                        <span className="truncate">{BY_COMP.get(id)!.c.name}</span>
                        <ArrowRight size={14} aria-hidden="true" className="hx-arrow shrink-0 text-[color:var(--text-tertiary)]" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex pt-[10px] md:pt-[12px]">
                <a href={`/library?setup=${l}`} className="flex items-center gap-[4px] font-semibold leading-[18px] text-[13px] text-[color:var(--text-link)]">
                  <span className="hx-link">See all {n}</span>
                  <img alt="" src="/hax/v1/icon-arrow-right-link-12.svg" className="hx-arrow size-[12px]" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-[20px] flex w-full max-w-[1152px] flex-col items-start gap-[16px] md:flex-row md:items-center md:justify-between">
        <SetupKey />
        <a href="/library" className="hx-btn hx-btn--outline hx-btn--sm flex h-[32px] items-center gap-[6px] whitespace-nowrap rounded-[var(--radius-pill)] border border-[var(--stroke-default)] bg-[var(--surface-page)] px-[12px] font-semibold leading-[18px] text-[13px] tracking-[0.07px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
          Browse all {COMPS.length} components
          <img alt="" src="/hax/v1/icon-arrow-right-14.svg" className="hx-arrow size-[14px]" />
        </a>
      </div>
    </section>
  );
}
