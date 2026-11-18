"use client";
import { useEffect, useMemo, useState } from "react";
import { Weave, HAX_ROWS, STRONG, type Lit } from "../Weave";
import { ArrowRight, Check, Copy } from "../icons";
import { glowAt, neonAt, useStrikeClock } from "../neon";

// Figma: HAX v2 · Home 103:3135 · Hero 103:3136. HAX is lit in the weave on the logo's own tiles (17, 8).
const HAX: Lit = { rows: HAX_ROWS, q0: 17, r0: 8, stops: STRONG };
// the field runs edge to edge over the whole first screen, then on for BELOW px past the fold, and only
// dissolves there (over the top of the next section), so on load the weave reaches the bottom of the screen
const BELOW = 360, FADE = { top: 0, bottom: BELOW }, NO_FADE = { top: 0, bottom: 0 };

// HAX strikes on like neon tubes (as in the v3 intro): grey weave first, then H, A and X flicker and hold
const ON = [.5, .85, 1.2]; // H, A, X switch on (s after load)
const letterOf = (q: number) => (q < 22 ? 0 : q < 28 ? 1 : 2); // H tiles 17–21, A 23–27, X 29–33

function useNeon() {
  const t = useStrikeClock(ON[2]);
  const glow = glowAt(t, ON[2]);
  const lit = useMemo<Lit>(() => ({ ...HAX, alpha: (q: number) => neonAt(t - ON[letterOf(q)]) }), [t]);
  return { lit, glow };
}
// The stage word rotates like v1's headline (Figma shows "Scale Stage"), coloured like Figma's run
const STAGES = ["Enterprise", "Scale Stage", "Growth Stage", "Early Stage", "Prelaunch"];
const GRAD = "linear-gradient(90deg, #0051af 0%, #0a6bd6 25%, #00bceb 50%, #ff8a50 76%, #ff6d2d 100%)";
const mono = "font-[family-name:var(--font-mono)] text-[12px] uppercase leading-[16px] tracking-[0.04em]";

function RotatingStage() {
  const [s, setS] = useState({ i: 1, prev: -1 });
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setS(({ i }) => ({ i: (i + 1) % STAGES.length, prev: i })), 4000);
    return () => clearInterval(t);
  }, []);
  return (
    <>
      <span className="hx2-rot" aria-hidden="true">
        {STAGES.map((w, k) => (
          <span key={w} className={`hx2-rot__item bg-clip-text text-transparent${k === s.i ? " is-in" : k === s.prev ? " is-out" : ""}`} style={{ backgroundImage: GRAD }}>{w}</span>
        ))}
      </span>
      {/* screen readers get one stable phrase instead of a ticker */}
      <span className="sr-only">{STAGES[1]}</span>
    </>
  );
}

export function Hero() {
  const { lit: neon, glow } = useNeon();
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText("npm install @hax/react").then(() => { setCopied(true); setTimeout(() => setCopied(false), 1400); }, () => {});
  };
  return (
    <section className="relative h-[max(880px,100vh)] px-[120px] pt-[212px]" data-node-id="103:3136">
      {/* grey field (the HAX tiles fade out of it as they light), then the tube glow (a blurred copy), then the tubes */}
      <Weave layer="field" row0={0} opacity={0.16} fade={FADE} lit={neon} className="!bottom-auto !h-[calc(100%+360px)]" />
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ opacity: glow }}><Weave layer="pictures" row0={0} fade={NO_FADE} lit={neon} className="!bottom-auto !h-[calc(100%+360px)] blur-[7px]" /></div>
      <Weave layer="pictures" row0={0} fade={NO_FADE} lit={neon} className="!bottom-auto !h-[calc(100%+360px)]" />
      <div className="relative flex w-[560px] flex-col gap-[24px]">
        <a href="/material-pattern?id=disclosure&device=mobile"
          className={`hx2-rise group flex w-fit items-center gap-[8px] rounded-full border border-[color:var(--line)] bg-[color:var(--card)] px-[12px] py-[4px] font-medium transition-colors duration-300 hover:border-[color:var(--line-strong)] ${mono}`}>
          <span className="size-[8px] rounded-full bg-[color:var(--orange)]" />
          HAX for iPhone Duo
          <span className="h-[12px] w-px bg-[color:var(--line)]" />
          <span className="text-[color:var(--grey)] transition-colors duration-300 group-hover:text-[color:var(--ink)]">Explore mobile patterns</span>
          <ArrowRight className="hx2-arrow size-[12px] text-[color:var(--grey)]" strokeWidth={2} />
        </a>
        <h1 className="hx2-rise text-[60px] font-semibold leading-[60px] tracking-[-0.03em]">
          <span className="hx2-h1 block">One pattern library<br />for the teams in</span>
          <RotatingStage />
        </h1>
        <p className="hx2-rise hx2-rise--2 w-[480px] text-[18px] leading-[28px] text-[color:var(--grey)]">
          Give your AI a face people trust. Describe it in a sentence — HAX does the rest.
        </p>
        <div className="hx2-rise hx2-rise--3 flex items-center gap-[24px]">
          <a href="/v2/library" className="hx2-btn hx2-btn--dark flex items-center gap-[8px] rounded-[8px] bg-[color:var(--btn)] py-[8px] pl-[16px] pr-[12px] text-[16px] font-semibold leading-[24px] text-white">
            Browse patterns
            <ArrowRight className="hx2-arrow size-[16px]" strokeWidth={1.6} />
          </a>
          <button type="button" onClick={copy} aria-label="Copy install command"
            className="hx2-btn flex items-center gap-[12px] rounded-[8px] border border-[color:var(--line)] bg-[color:var(--card)] py-[10px] pl-[14px] pr-[12px] transition-colors hover:border-[color:var(--line-strong)] hover:bg-[color:var(--fill)]">
            <span className="font-[family-name:var(--font-mono)] text-[14px] leading-[20px]">$ npm install @hax/react</span>
            <span className="relative size-[16px] text-[color:var(--grey)]">
              <Copy className={`absolute inset-0 size-[16px] transition-all duration-200 ${copied ? "scale-50 opacity-0" : ""}`} strokeWidth={1.4} />
              <Check className={`absolute inset-0 size-[16px] text-[#0a6bd6] transition-all duration-300 ${copied ? "" : "scale-50 opacity-0"}`} />
            </span>
            <span className="sr-only" aria-live="polite">{copied ? "Copied" : ""}</span>
          </button>
        </div>
        <p className={`hx2-rise hx2-rise--3 text-[color:var(--grey)] ${mono}`}>84 patterns · 4 moments · React · MCP server</p>
      </div>
    </section>
  );
}
