"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { drawIntro, END } from "./introScene";
import { layout } from "./scene";
import { INTRO_SEEN } from "./script";

// The home intro from website/v3 (the weave lights HAX up like neon, then tips into a floor that
// comes toward you), played full screen over v1's home once a session. v1 keeps its own light hero,
// so instead of v3's hand-over the intro fades out near the end of the shot and the hero text
// rises under it. Skip jumps to the fade. INTRO_SCRIPT (script.ts) hides the page before first paint
// so the home never flashes before the intro starts.
const FADE_AT = 6.2; // seconds: the floor has finished tipping (introScene T_TILT ends at 5.8)
const FADE_MS = 900;
const HERO_H = 860;

export function Intro({ onFade, onDone }: { onFade?: () => void; onDone: () => void }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const t0 = useRef(0);
  const [fading, setFading] = useState(false);
  const done = useRef(onDone);
  done.current = onDone;
  const fade = useRef(onFade);
  fade.current = onFade;

  useEffect(() => {
    const c = cv.current, x = c?.getContext("2d");
    if (!c || !x) return;
    let W = 0, H = 0, raf = 0, faded = false, timer = 0;
    const size = () => {
      const d = Math.min(2, window.devicePixelRatio || 1);
      W = window.innerWidth; H = window.innerHeight;
      c.width = Math.round(W * d); c.height = Math.round(H * d); x.setTransform(d, 0, 0, d, 0, 0);
    };
    const geo = () => {
      const L = layout(W, HERO_H);
      return { horizon: L.horizon, sunR: L.sunR, logoX: 0, logoY: 0, logoW: 86.9 };
    };
    const root = document.documentElement;
    const prev = root.style.overflow;
    const release = () => { root.style.overflow = prev; delete root.dataset.haxIntro; };
    const tick = (now: number) => {
      const t = Math.min(END, (now - t0.current) / 1000);
      if (!document.hidden) drawIntro(x, W, H, t, geo());
      if (t >= FADE_AT && !faded) {
        faded = true;
        try { sessionStorage.setItem(INTRO_SEEN, "1"); } catch {}
        release(); // the page shows under the canvas while it fades
        setFading(true);
        fade.current?.();
        timer = window.setTimeout(() => done.current(), FADE_MS);
      }
      raf = requestAnimationFrame(tick);
    };
    size();
    window.addEventListener("resize", size);
    root.style.overflow = "hidden";
    window.scrollTo(0, 0);
    t0.current = performance.now();
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); clearTimeout(timer); window.removeEventListener("resize", size); release(); };
  }, []);

  // portalled to <body>, above the sticky header (the page content sits in its own z-[1] layer)
  return createPortal(
    <div className="hax-v1 fixed inset-0 z-[60] transition-opacity ease-out" style={{ visibility: "visible", opacity: fading ? 0 : 1, transitionDuration: `${FADE_MS}ms`, pointerEvents: fading ? "none" : undefined }}>
      <canvas ref={cv} role="img" aria-label="HAX intro: the weave lights up HAX like neon, then tips into a floor that comes toward you" className="block h-screen w-screen" />
      {!fading && (
        <button type="button" onClick={() => { t0.current = Math.min(t0.current, performance.now() - FADE_AT * 1000); }}
          className="absolute bottom-[28px] right-[32px] rounded-[999px] border border-[rgba(255,255,255,.18)] px-[14px] py-[8px] font-[family-name:var(--font-code)] font-medium leading-[16px] text-[12px] tracking-[0.1em] text-[rgba(255,255,255,.7)] uppercase transition-colors hover:border-[rgba(255,255,255,.4)] hover:text-white">
          Skip intro
        </button>
      )}
    </div>,
    document.body,
  );
}
