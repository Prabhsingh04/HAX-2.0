"use client";
import { useEffect, useState } from "react";
import { Intro } from "../intro/Intro";

// Hero stage word rotates like the old v1 headline (Figma shows "Scale Stage"): every 4 s
// the phrase rises out the top and the next rises in from below. The box keeps the width
// of the widest phrase, so "teams in" never moves (see .hx-rot in motion.css).
const STAGES = ["Enterprise", "Scale Stage", "Growth Stage", "Early Stage", "Prelaunch"];
function RotatingStage() {
  const [s, setS] = useState({ i: 1, prev: -1 });
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setS(({ i }) => ({ i: (i + 1) % STAGES.length, prev: i })), 4000);
    return () => clearInterval(t);
  }, []);
  return (
    <>
      <span className="hx-rot" aria-hidden="true">
        {STAGES.map((w, k) => (
          <span key={w} className={`hx-rot__item${k === s.i ? " is-in" : k === s.prev ? " is-out" : ""}`} style={{ color: "var(--hx-human)" }}>{w}</span>
        ))}
      </span>
      {/* screen readers get one stable phrase instead of a ticker */}
      <span className="sr-only">{STAGES[1]}</span>
    </>
  );
}

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
          One pattern library for the{" "}
          <br className="hidden md:block" />
          teams in{" "}
          <RotatingStage />
        </h1>
        <p className="hx-rise hx-rise--2 max-w-[560px] font-normal leading-[26px] text-[16px] text-[color:var(--text-secondary)] text-center [text-wrap:balance] md:leading-[28px] md:text-[18px] lg:max-w-none lg:whitespace-nowrap">
          Give your AI a face people trust. Describe it in a sentence and HAX does the rest.
        </p>
        <div className="hx-rise hx-rise--3 flex flex-wrap justify-center gap-[12px] items-center">
          <a href="/library" className="hx-btn hx-btn--solid bg-[var(--surface-inverse)] flex gap-[6px] h-[40px] items-center justify-center px-[20px] rounded-[var(--radius-pill)]">
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
