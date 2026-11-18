"use client";
import { useEffect, useState } from "react";
import { Intro } from "../intro/Intro";

// Figma: Hero 98:19425
export function Hero() {
  const [copied, setCopied] = useState(false);
  // the intro plays when INTRO_SCRIPT (app/(hax)/page.tsx) marked <html> before paint; when it ends,
  // the hero copy remounts so its rise animation plays as the intro fades
  const [intro, setIntro] = useState(false);
  const [rise, setRise] = useState(0);
  useEffect(() => { if (document.documentElement.dataset.haxIntro === "on") setIntro(true); }, []);
  const copy = () => {
    navigator.clipboard?.writeText("npm install @hax/react").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    }, () => {});
  };
  return (
    // No breadcrumb: the site is only the HAX initiative. pt 42 = Figma's 24 + the 18px
    // breadcrumb row, so the headline keeps its Figma position.
    <section className="flex flex-col items-center pb-[80px] pt-[24px] px-[var(--hx-gutter)] relative w-full overflow-hidden md:pb-[104px] xl:pb-[128px] xl:pt-[42px]" data-node-id="98:19425" data-hx-hero>
      {intro && <Intro onFade={() => setRise((r) => r + 1)} onDone={() => setIntro(false)} />}
      <div key={rise} className="flex flex-col gap-[24px] items-center pt-[48px] relative md:gap-[28px] md:pt-[72px] xl:pt-[88px]">
        <h1 className="hx-rise font-semibold text-[32px] leading-[40px] text-[color:var(--text-primary)] text-center tracking-[-0.4px] md:text-[42px] md:leading-[50px] lg:text-[46px] lg:leading-[54px] lg:whitespace-nowrap xl:text-[50px] xl:leading-[58px] xl:tracking-[-0.6px]">
          {/* Srishti's v3 hero copy (call, 17 Nov) */}
          One pattern library for people and agents{" "}
          <br className="hidden md:block" />
          <span style={{ color: "var(--hx-human)" }}>working together at scale.</span>
        </h1>
        <p className="hx-rise hx-rise--2 max-w-[640px] font-normal leading-[26px] text-[16px] text-[color:var(--text-secondary)] text-center [text-wrap:balance] md:leading-[28px] md:text-[18px]">
          Explore patterns for what agents do and how people experience it, from first interaction to decisions, handoffs, and ongoing work.
        </p>
        <div className="hx-rise hx-rise--3 flex flex-wrap justify-center gap-[12px] items-center">
          <a href="/patterns" className="hx-btn hx-btn--solid bg-[var(--surface-inverse)] flex gap-[6px] h-[40px] items-center justify-center px-[20px] rounded-[var(--radius-pill)]">
            <span className="font-semibold leading-[20px] text-[14px] text-[color:var(--text-on-inverse)] tracking-[0.07px] whitespace-nowrap">Browse patterns</span>
            <img alt="" src="/hax/v1/icon-arrow-right.svg" className="hx-arrow size-[16px]" />
          </a>
          <button type="button" onClick={copy} aria-label="Copy install command"
            className="hx-snippet bg-[var(--surface-page)] border border-[var(--stroke-default)] flex gap-[10px] items-center pl-[18px] pr-[14px] py-[9px] rounded-[var(--radius-pill)]">
            <span className="font-[family-name:var(--font-code)] leading-[22px] text-[13px] text-[color:var(--text-primary)] tracking-[0.2px] whitespace-nowrap">$ npm install @hax/react</span>
            <span className="relative size-[14px]">
              <img alt="" src="/hax/v1/icon-copy.svg" className={`absolute inset-0 size-[14px] transition-all duration-200 ${copied ? "opacity-0 scale-50" : ""}`} />
              <svg viewBox="0 0 24 24" className={`absolute inset-0 size-[14px] text-[color:var(--text-link)] transition-all duration-300 ${copied ? "opacity-100 scale-100" : "opacity-0 scale-50"}`} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
            </span>
            <span className="sr-only" aria-live="polite">{copied ? "Copied" : ""}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
