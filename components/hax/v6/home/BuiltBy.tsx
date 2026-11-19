import type { CSSProperties } from "react";
import ScrollReveal from "@/components/reactbits/ScrollReveal";
import { btn } from "@/components/hax/v6/ui";
import { AcidBackdrop, Spark } from "@/components/hax/v6/fx";

// v3's closing panel (Figma Built by 106:7304) with v1's latest words (v5). The heading's words light
// up one by one once it comes into view (React Bits ScrollReveal), over a floor of rounded squares lit
// in the person's cyan and the agent's orange (AcidSquares, tablets and up). 19 Nov, from the user's
// mock-up: one dark layer at 50% over the squares and under the words, which are white. The buttons
// keep their own fills, throw sparks when pressed, and get a white focus ring on the dark panel.
export function BuiltBy() {
  return (
    <section className="px-[24px] py-[64px] md:py-[96px]" data-node-id="106:7304">
      <div className="h6-reveal relative mx-auto max-w-[1200px] overflow-hidden rounded-[28px] border border-[var(--edge)] bg-[var(--panel)] md:rounded-[32px]" style={{ "--focus-ring": "rgba(255, 255, 255, .9)" } as CSSProperties}>
        <AcidBackdrop />
        {/* the dark layer: over the squares, under the words */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-black/50" />
        <div className="relative flex flex-col items-center gap-[24px] px-[24px] py-[64px] text-center md:px-[96px] md:py-[96px]">
          {/* "enter": the words light up one after another once the heading is in view and stay lit */}
          <ScrollReveal mode="enter" duration={0.9} stagger={0.12} baseOpacity={0.22} enableBlur={false} baseRotation={0}
            containerClassName="!my-0 w-full"
            textClassName="mx-auto max-w-[16ch] !font-light !text-[clamp(34px,5vw,60px)] !leading-[1.05] tracking-[-0.02em] text-white [text-wrap:balance]">
            Built by people who design products with AI agents
          </ScrollReveal>
          <div className="flex flex-wrap justify-center gap-[12px]">
            <Spark>
              <a href="/v4/patterns" className={`${btn} h6-btn--primary`}>
                Browse patterns
                <svg viewBox="0 0 16 16" aria-hidden className="h6-arrow size-[16px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
              </a>
            </Spark>
            <Spark>
              <a href="https://outshift.cisco.com" target="_blank" rel="noreferrer" className={`${btn} h6-btn--secondary`}>
                Explore Outshift
                <img alt="" src="/hax/v6/icon-upright-16-ink.svg" className="h6-arrow h6-arrow--up size-[16px]" />
              </a>
            </Spark>
          </div>
        </div>
      </div>
    </section>
  );
}
