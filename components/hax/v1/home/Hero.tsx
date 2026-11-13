"use client";
import { useEffect, useState } from "react";

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
  const copy = () => {
    navigator.clipboard?.writeText("npm install @hax/react").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    }, () => {});
  };
  return (
    // No breadcrumb: the site is only the HAX initiative. pt 42 = Figma's 24 + the 18px
    // breadcrumb row, so the headline keeps its Figma position.
    <section className="flex flex-col items-center pb-[128px] pt-[42px] px-[144px] relative w-full overflow-hidden" data-node-id="98:19425" data-hx-hero>
      <div className="flex flex-col gap-[28px] items-center pt-[88px] relative">
        <h1 className="hx-rise font-semibold text-[50px] leading-[58px] text-[color:var(--text-primary)] text-center tracking-[-0.6px] whitespace-nowrap">
          One pattern library for the
          <br />
          teams in{" "}
          <RotatingStage />
        </h1>
        <p className="hx-rise hx-rise--2 font-normal leading-[28px] text-[18px] text-[color:var(--text-secondary)] text-center whitespace-nowrap">
          Give your AI a face people trust. Describe it in a sentence and HAX does the rest.
        </p>
        <div className="hx-rise hx-rise--3 flex gap-[12px] items-center">
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
