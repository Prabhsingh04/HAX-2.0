"use client";
import { useEffect, useState, type RefObject } from "react";

// Neon-tube strike for words lit in the weave (Hero HAX, MCP band), as in the v3 intro: each letter
// flickers a few times and then holds. Brightness over the first 0.75 s after a letter switches on.
const STRIKE: [number, number][] = [[0, 0], [.04, .9], [.08, .1], [.13, .55], [.17, .05], [.28, .05], [.31, 1], [.35, .35], [.42, .8], [.47, .6], [.75, 1]];
export function neonAt(dt: number) {
  if (dt <= 0) return 0; if (dt >= .75) return 1;
  for (let i = 1; i < STRIKE.length; i++) if (dt <= STRIKE[i][0]) { const [a, va] = STRIKE[i - 1], [b, vb] = STRIKE[i]; return va + (vb - va) * (dt - a) / (b - a); }
  return 1;
}

// seconds since the strike started; starts on mount, or when `watch` first scrolls into view
export function useStrikeClock(last: number, watch?: RefObject<Element | null>) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setT(99); return; }
    let raf = 0, io: IntersectionObserver | null = null;
    // the clock runs until the glow has faded too (glowAt: last + 0.75 + 0.6)
    const start = () => {
      const t0 = performance.now();
      const tick = (now: number) => { const s = (now - t0) / 1000; setT(s); if (s < last + 1.5) raf = requestAnimationFrame(tick); };
      raf = requestAnimationFrame(tick);
    };
    if (watch?.current) {
      io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io?.disconnect(); start(); } }, { threshold: .35 });
      io.observe(watch.current);
    } else start();
    return () => { cancelAnimationFrame(raf); io?.disconnect(); };
  }, [last, watch]);
  return t;
}

// the tubes' ambient glow: softer (50%) while they strike, then it fades away over 0.6 s once the
// last letter has settled, so the word rests as plain lines
export function glowAt(t: number, last: number) {
  const k = Math.max(0, Math.min(1, (t - (last + .75)) / .6));
  return .5 * (1 - k * k * (3 - 2 * k));
}
