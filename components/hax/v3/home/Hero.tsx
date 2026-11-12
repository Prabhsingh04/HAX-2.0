"use client";
import { useEffect, useState } from "react";
import { World } from "../world/World";
import { Intro } from "../world/Intro";
import { Grad, Lede, SkyTag, btn } from "../ui";
import { CopyIcon, useCopy } from "../copy";

// Figma: Hero 106:8114 (world 106:8115, text 106:8143). The intro plays over it once a session
// (Replay brings it back); the text rises when the intro hands over.
const STAGES = ["Enterprise", "Scale Stage", "Growth Stage", "Early Stage", "Prelaunch"];
const SEEN = "hax-v3-intro";

function RotatingStage() {
  const [s, setS] = useState({ i: 1, prev: -1 });
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setS(({ i }) => ({ i: (i + 1) % STAGES.length, prev: i })), 4000);
    return () => clearInterval(t);
  }, []);
  return (
    <>
      <span className="h3-rot" aria-hidden="true">
        {STAGES.map((w, k) => (
          <span key={w} className={`h3-rot__item bg-clip-text text-transparent [-webkit-background-clip:text] ${k === s.i ? "is-in" : k === s.prev ? "is-out" : ""}`}
            style={{ backgroundImage: "linear-gradient(90deg, #c08af0 0%, #ff8a50 100%)" }}>{w}</span>
        ))}
      </span>
      <span className="sr-only">{STAGES[1]}</span>
    </>
  );
}

export function Hero() {
  // null until we know whether to play the intro, so the text never flashes before it
  const [intro, setIntro] = useState<boolean | null>(null);
  const [copied, copy] = useCopy();
  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try { seen = sessionStorage.getItem(SEEN) === "1"; } catch {}
    const force = new URLSearchParams(location.search).has("intro");
    setIntro(!still && (force || !seen));
  }, []);
  // the intro's canvas stays as the hero background once it ends (no hand-over), so remember that it played
  const [played, setPlayed] = useState(false);
  const [replay, setReplay] = useState(0);
  const finish = () => { try { sessionStorage.setItem(SEEN, "1"); } catch {} setPlayed(true); setIntro(false); };

  return (
    <section className="relative h-[max(860px,100vh)] w-full overflow-hidden bg-[var(--bg)]" data-node-id="106:8114">
      {(intro || played) && <Intro key={replay} onDone={finish} />}
      {intro === false && !played && <World portal className="absolute inset-0" />}
      {intro === false && (
        <div className="relative mx-auto flex max-w-[1200px] flex-col items-center gap-[24px] px-[24px] pt-[96px] text-center">
          <SkyTag href="/material-pattern?id=disclosure&device=mobile">
            HAX for iPhone Duo
            <span className="h-[12px] w-px bg-[rgba(255,255,255,.35)]" />
            <span className="text-[color:var(--text-soft)]">Explore mobile patterns</span>
            <img alt="" src="/hax/v3/icon-right-12-white.svg" className="h3-arrow size-[12px]" />
          </SkyTag>
          <h1 className="h3-rise h3-rise--2 font-light text-[clamp(44px,5vw,72px)] leading-[1] tracking-[-0.03em] text-white whitespace-nowrap">
            <span className="block">One pattern library</span>
            <span className="block font-semibold leading-[1.06]">
              <Grad>for the teams in </Grad>
              <RotatingStage />
            </span>
          </h1>
          <Lede className="max-w-[880px]">Give your AI a face people trust. Describe it in a sentence — HAX does the rest.</Lede>
          <div className="h3-rise h3-rise--4 flex flex-wrap justify-center gap-[16px]">
            <a href="/v3/library" className={`${btn} h3-btn--primary`}>
              Browse patterns
              <img alt="" src="/hax/v3/icon-right-16-ink.svg" className="h3-arrow size-[16px]" />
            </a>
            <button type="button" onClick={() => copy("npm install @hax/react")} aria-label="Copy install command"
              className="h3-btn h3-btn--glass inline-flex items-center gap-[12px] rounded-[8px] px-[12px] py-[10px] font-[family-name:var(--font-mono)] leading-[20px] text-[13px] text-white">
              <span><span className="text-[color:var(--cyan)]">$</span> npm install @hax/react</span>
              <CopyIcon copied={copied} src="/hax/v3/icon-copy-16-white.svg" />
              <span className="sr-only" aria-live="polite">{copied ? "Copied" : ""}</span>
            </button>
          </div>
        </div>
      )}
      {intro === false && (
        <button type="button" onClick={() => { window.scrollTo(0, 0); setReplay((r) => r + 1); setIntro(true); }}
          className="h3-btn h3-btn--glass h3-rise h3-rise--4 absolute bottom-[28px] right-[32px] z-10 inline-flex items-center gap-[8px] rounded-[999px] px-[14px] py-[8px] font-[family-name:var(--font-mono)] font-medium leading-[16px] text-[12px] tracking-[0.1em] uppercase">
          <span aria-hidden>↻</span> Replay intro
        </button>
      )}
    </section>
  );
}
