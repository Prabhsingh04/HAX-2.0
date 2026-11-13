"use client";

// Home page background, after outshift.design/hax: three blurred colour blobs in a
// layer fixed to the viewport, drifting slowly. SiteShell renders it on the home
// page only (its `blobs` prop), with `drive`, which sets the gradient's strength as
// the page scrolls:
//   - through the hero ([data-hx-hero]): 100% at the top, HERO_STOPS at ¼ and ½;
//   - each later section marked data-hx-blob-o="<0..1>" reaches its own strength as
//     its top meets the top of the viewport, blending over the half viewport before;
//   - sections after the last marked one keep its strength.
//
// The strength lives in one CSS variable on <html> (--hx-blob-o, read by .hx-blobs
// in motion.css), so every copy of the layer matches. A panel with an opaque
// background that should still show the gradient (the stacked "How it works"
// tiles) renders its own copy inside itself, without `drive`, and clips it
// (clip-path: inset(0)); being fixed, the copies line up and animate in step.
import { useEffect } from "react";

/** strength at ¼ and ½ of the way through the hero */
const HERO_STOPS: [number, number][] = [[0.25, 0.82], [0.5, 0.72]];

type Stop = [y: number, o: number];

function stops(): Stop[] {
  const y0 = window.scrollY, vh = window.innerHeight;
  const top = (el: Element) => el.getBoundingClientRect().top + y0;
  const out: Stop[] = [[0, 1]];
  const hero = document.querySelector("[data-hx-hero]");
  if (hero) {
    const end = hero.getBoundingClientRect().bottom + y0;
    for (const [f, o] of HERO_STOPS) out.push([end * f, o]);
  }
  document.querySelectorAll<HTMLElement>("[data-hx-blob-o]").forEach((el) => {
    const o = Number(el.dataset.hxBlobO);
    if (!Number.isFinite(o)) return;
    const y = top(el), last = out[out.length - 1];
    // hold the previous strength until half a viewport before this section
    if (y - vh / 2 > last[0]) out.push([y - vh / 2, last[1]]);
    if (y > out[out.length - 1][0]) out.push([y, o]);
  });
  return out;
}

function strengthAt(y: number, s: Stop[]): number {
  if (y <= s[0][0]) return s[0][1];
  for (let i = 1; i < s.length; i++) {
    const [y1, o1] = s[i], [y0, o0] = s[i - 1];
    if (y <= y1) return o0 + (o1 - o0) * ((y - y0) / (y1 - y0));
  }
  return s[s.length - 1][1];
}

export function BlobLayer({ drive = false }: { drive?: boolean }) {
  useEffect(() => {
    if (!drive) return;
    const root = document.documentElement;
    let raf = 0;
    const update = () => {
      raf = 0;
      root.style.setProperty("--hx-blob-o", strengthAt(window.scrollY, stops()).toFixed(3));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
      root.style.removeProperty("--hx-blob-o");
    };
  }, [drive]);

  return (
    <div aria-hidden className="hx-blobs">
      <div className="hx-blob hx-blob--1" />
      <div className="hx-blob hx-blob--2" />
      <div className="hx-blob hx-blob--3" />
    </div>
  );
}
