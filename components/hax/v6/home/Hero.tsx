"use client";
import { useEffect, useState } from "react";
import { World } from "../world/World";
import { Intro } from "../world/Intro";
import { SkyTag, btn } from "../ui";
import { CopyIcon, useCopy } from "../copy";

// v3's hero (Figma Hero 106:8114) on white, with v1's latest words (v5: Srishti's v3 hero copy, her
// call of 17 Nov) and v1's announcement as the tag. The intro plays over it once a session (Replay
// brings it back) and ends on the hero's own floor; the text rises when it hands over. "people" and
// "agents" carry their colours, the same blue and orange as the two sides of the floor.
export function Hero() {
  // null until we know whether to play the intro, so the text never flashes before it
  const [intro, setIntro] = useState<boolean | null>(null);
  const [copied, copy] = useCopy();
  useEffect(() => { setIntro(document.documentElement.dataset.hax6Intro === "on"); }, []);
  // the intro's canvas stays as the hero background once it ends (no hand-over), so remember that it played
  const [played, setPlayed] = useState(false);
  const [replay, setReplay] = useState(0);
  const finish = () => { setPlayed(true); setIntro(false); };

  return (
    <section className="relative h-[max(860px,100vh)] w-full overflow-hidden bg-[var(--bg)] max-md:h-[max(760px,100svh)]" data-node-id="106:8114">
      {/* the floor tilts up toward you as the page scrolls (scene.ts heroLift); the words rise away (Parallax.tsx) */}
      <div className="absolute inset-0">
        {(intro || played) && <Intro key={replay} onDone={finish} />}
        {intro === false && !played && <World className="absolute inset-0" />}
      </div>
      {intro === false && (
        <div data-parallax="-22" data-parallax-from="top" className="relative mx-auto flex max-w-[1200px] flex-col items-center gap-[32px] px-[24px] pt-[128px] text-center md:gap-[36px] md:pt-[136px]">
          {/* every pattern with an agent team (30); it opened "Agent team only" (8) until the 20 Nov audit */}
          <SkyTag href="/v4/patterns?dimension=multi-agent">
            Multi-agent patterns
            <span className="h-[12px] w-px bg-[var(--edge-3)] max-sm:hidden" />
            <span className="text-[color:var(--link)] max-sm:hidden">Explore</span>
            <svg viewBox="0 0 12 12" aria-hidden className="h6-arrow size-[12px] text-[color:var(--link)]" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 6h7M6.5 3l3 3-3 3" /></svg>
          </SkyTag>
          <h1 className="h6-rise h6-rise--2 max-w-[1080px] font-light text-[clamp(40px,5.2vw,72px)] leading-[1.16] tracking-[-0.022em] text-[color:var(--text)] [text-wrap:balance]">
            One pattern library for <span className="font-semibold text-[color:var(--human)]">people</span> and <span className="font-semibold text-[color:var(--agent)]">agents</span>
            <span className="block font-semibold">working together at scale.</span>
          </h1>
          <div className="h6-rise h6-rise--3 mt-[4px] flex flex-wrap justify-center gap-[12px] md:mt-[12px] md:gap-[16px]">
            <a href="/v4/patterns" className={`${btn} h6-btn--primary`}>
              Browse patterns
              <svg viewBox="0 0 16 16" aria-hidden className="h6-arrow size-[16px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
            </a>
            <button type="button" onClick={() => copy("npm install @hax/react")} aria-label="Copy install command"
              className="h6-btn h6-btn--glass inline-flex items-center gap-[12px] rounded-[8px] px-[12px] py-[10px] font-[family-name:var(--font-mono)] leading-[20px] text-[13px] max-sm:hidden">
              <span><span className="text-[color:var(--link)]">$</span> npm install @hax/react</span>
              <CopyIcon copied={copied} src="/hax/v6/icon-copy-16-ink.svg" />
              <span className="sr-only" aria-live="polite">{copied ? "Copied" : ""}</span>
            </button>
          </div>
        </div>
      )}
      {intro === false && (
        <button type="button" onClick={() => { window.scrollTo(0, 0); setReplay((r) => r + 1); setIntro(true); }}
          className="h6-btn h6-btn--glass h6-rise h6-rise--4 absolute bottom-[28px] right-[32px] z-10 inline-flex items-center gap-[8px] rounded-[999px] px-[14px] py-[8px] font-[family-name:var(--font-mono)] font-medium leading-[16px] text-[12px] tracking-[0.1em] uppercase max-md:hidden">
          <span aria-hidden>↻</span> Replay intro
        </button>
      )}
    </section>
  );
}
