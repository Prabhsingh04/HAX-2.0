"use client";
import { useEffect, useRef, useState } from "react";
import { drawIntro, END } from "./introScene";
import { layout } from "./scene";
import { INTRO_SEEN } from "./script";

// The Home hero's background when the intro plays (v3's way): one canvas, one clock, forever. It
// starts full screen over the page; when the shot reaches the floor (END) the hero text rises over it
// and the canvas simply stays as the hero background — the floor keeps coming toward you and the
// waves of light keep running out through it, with no cut and no hand-over. Skip jumps the clock to END.
// INTRO_SCRIPT (script.ts) hides the page before its first paint, so nothing flashes first.
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
    const root = document.documentElement;
    const prev = root.style.overflow;
    const release = () => { root.style.overflow = prev; delete root.dataset.hax6Intro; };
    const tick = (now: number) => {
      const t = (now - t0.current) / 1000;
      // once it is the hero background, skip frames while the hero is scrolled away
      const shown = !ended || c.getBoundingClientRect().bottom > 0;
      if (!document.hidden && shown) drawIntro(x, W, H, t, { horizon: layout(W, Math.max(860, H)).horizon });
      if (t >= END && !ended) {
        ended = true;
        try { sessionStorage.setItem(INTRO_SEEN, "1"); } catch {}
        release(); setLive(true); done.current();
      }
      raf = requestAnimationFrame(tick);
    };
    size();
    window.addEventListener("resize", size);
    root.style.overflow = "hidden";
    window.scrollTo(0, 0);
    t0.current = performance.now();
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", size); release(); };
  }, []);

  return (
    // fixed over everything during the intro; afterwards the same element sits in the hero (top 0,
    // same size), so the switch from fixed to absolute is invisible. Visible even while the page
    // under it is still hidden.
    <div className={live ? "absolute left-0 top-0 h-screen w-screen" : "fixed inset-0 z-[60]"} style={{ visibility: "visible" }}>
      <canvas ref={cv} role="img" aria-label="HAX intro: the weave lights up HAX like neon, then tips into a floor where neon light flows through its lines toward the horizon" className="block h-screen w-screen" />
      {!live && (
        <button type="button" onClick={() => { t0.current = Math.min(t0.current, performance.now() - END * 1000); }}
          className="h6-btn absolute bottom-[28px] right-[32px] rounded-[999px] border border-[rgba(15,17,23,.16)] bg-[rgba(255,255,255,.7)] px-[14px] py-[8px] font-[family-name:var(--font-mono)] font-medium leading-[16px] text-[12px] tracking-[0.1em] text-[rgba(15,17,23,.66)] uppercase backdrop-blur-[6px] hover:border-[rgba(15,17,23,.36)] hover:text-[#0f1117]">
          Skip intro
        </button>
      )}
    </div>
  );
}
