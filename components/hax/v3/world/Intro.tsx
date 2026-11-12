"use client";
import { useEffect, useRef, useState } from "react";
import { drawIntro, END } from "./introScene";
import { layout } from "./scene";

// The Home hero's background when the intro plays: one canvas, one clock, forever. It starts full
// screen over the page; when the shot reaches the floor (END) the hero text rises over it and the
// canvas simply stays as the hero background — the floor keeps coming toward you with no cut, no
// cross-fade and no hand-over to another canvas. Skip jumps the clock to END.
const HERO_H = 860;

export function Intro({ onDone }: { onDone: () => void }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const t0 = useRef(0);
  const [live, setLive] = useState(false); // false: full-screen intro; true: it is now the hero background
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    const c = cv.current, x = c?.getContext("2d");
    if (!c || !x) return;
    let W = 0, H = 0, raf = 0, ended = false;
    const size = () => {
      const d = Math.min(2, window.devicePixelRatio || 1);
      W = window.innerWidth; H = window.innerHeight;
      c.width = Math.round(W * d); c.height = Math.round(H * d); x.setTransform(d, 0, 0, d, 0, 0);
    };
    const geo = () => {
      const L = layout(W, HERO_H), navLeft = Math.max(0, (W - 1440) / 2) + 40;
      return { horizon: L.horizon, sunR: L.sunR, logoX: navLeft, logoY: 20 + (32 - 5 * (86.9 / 17)) / 2, logoW: 86.9 };
    };
    const prev = document.documentElement.style.overflow;
    const release = () => { document.documentElement.style.overflow = prev; };
    const tick = (now: number) => {
      const t = (now - t0.current) / 1000;
      if (!document.hidden) drawIntro(x, W, H, t, geo());
      if (t >= END && !ended) { ended = true; release(); setLive(true); done.current(); }
      raf = requestAnimationFrame(tick);
    };
    size();
    window.addEventListener("resize", size);
    document.documentElement.style.overflow = "hidden";
    window.scrollTo(0, 0);
    t0.current = performance.now();
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", size); release(); };
  }, []);

  return (
    // fixed over everything during the intro; afterwards the same element sits in the hero (top 0,
    // same size), so the switch from fixed to absolute is invisible
    <div className={live ? "absolute left-0 top-0 h-screen w-screen" : "fixed inset-0 z-[60]"}>
      <canvas ref={cv} role="img" aria-label="HAX intro: the weave lights up HAX like neon, then tips into a floor that keeps coming toward you" className="block h-screen w-screen" />
      {!live && (
        <button type="button" onClick={() => { t0.current = Math.min(t0.current, performance.now() - END * 1000); }}
          className="h3-btn absolute bottom-[28px] right-[32px] rounded-[999px] border border-[rgba(255,255,255,.18)] px-[14px] py-[8px] font-[family-name:var(--font-mono)] font-medium leading-[16px] text-[12px] tracking-[0.1em] text-[rgba(255,255,255,.7)] uppercase hover:border-[rgba(255,255,255,.4)] hover:text-white">
          Skip intro
        </button>
      )}
    </div>
  );
}
