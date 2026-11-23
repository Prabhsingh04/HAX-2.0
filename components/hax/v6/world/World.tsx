"use client";
import { useEffect, useRef } from "react";
import { drawWorld, heroLift, WALK } from "@/components/hax/v6/world/scene";

// Canvas that fills its parent with the hero world. The floor walks slowly toward you and waves of
// neon liquid flows through its lines toward the horizon; it pauses when off screen and stands still (no light) for reduced motion.

export function World({ className = "" }: { className?: string }) {
  const cv = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = cv.current;
    if (!c) return;
    const x = c.getContext("2d");
    if (!x) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t0 = performance.now();
    let W = 0, H = 0, raf = 0, visible = true;
    const size = () => {
      const b = c.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1);
      W = b.width; H = b.height;
      c.width = Math.round(W * d); c.height = Math.round(H * d);
      x.setTransform(d, 0, 0, d, 0, 0);
    };
    const paint = (now: number) => { const t = (now - t0) / 1000; drawWorld(x, W, H, still ? 1.4 : t, still ? 0 : t * WALK, !still, still ? 0 : heroLift()); };
    const loop = (now: number) => { paint(now); raf = visible && !still ? requestAnimationFrame(loop) : 0; };
    size(); paint(performance.now());
    const ro = new ResizeObserver(() => { size(); paint(performance.now()); });
    ro.observe(c);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf && !still) { raf = requestAnimationFrame(loop); }
    });
    io.observe(c);
    const vis = () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else if (visible && !raf && !still) raf = requestAnimationFrame(loop); };
    document.addEventListener("visibilitychange", vis);
    if (!still) raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); document.removeEventListener("visibilitychange", vis); };
  }, []);
  return <canvas ref={cv} aria-hidden className={`block size-full ${className}`} />;
}
