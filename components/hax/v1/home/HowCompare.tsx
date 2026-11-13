"use client";
import { useEffect, useRef } from "react";

// Prabh's "With and without HAX" section (HAX-2.0 index.html #how), run as-is: his markup (vs.html),
// his script (vs.js) and his styles scoped under .hx-vs (vs.css). callouts.css/js (ours) turn his pattern legend into callouts. Refresh: node scripts/build-hax-compare.mjs <HAX-2.0>
const V = "6";

export function HowCompare() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = ref.current!;
    let cancelled = false, script: HTMLScriptElement | null = null, extra: HTMLScriptElement | null = null, io: IntersectionObserver | null = null;
    (async () => {
      const html = await (await fetch(`/hax/v1/compare/vs.html?v=${V}`)).text();
      if (cancelled) return;
      host.innerHTML = html;
      host.parentElement!.classList.toggle("ln-still", matchMedia("(prefers-reduced-motion: reduce)").matches);
      // his scroll reveal (.ln-rv → .is-in), then the class is dropped once settled
      io = new IntersectionObserver((es) => es.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target as HTMLElement; el.classList.add("is-in"); io!.unobserve(el);
        setTimeout(() => el.classList.remove("ln-rv", "is-in"), 1300);
      }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
      host.querySelectorAll(".ln-rv").forEach((el) => io!.observe(el));
      script = document.createElement("script");
      script.src = `/hax/v1/compare/vs.js?v=${V}`;
      // then our callouts over his legend (callouts.js, hand-written, survives a rebuild)
      script.onload = () => {
        if (cancelled) return;
        extra = document.createElement("script");
        extra.src = `/hax/v1/compare/callouts.js?v=${V}`;
        document.body.appendChild(extra);
      };
      document.body.appendChild(script);
    })();
    return () => { cancelled = true; io?.disconnect(); script?.remove(); extra?.remove(); host.innerHTML = ""; };
  }, []);
  return (
    <>
      <link rel="stylesheet" href={`/hax/v1/compare/vs.css?v=${V}`} />
      <link rel="stylesheet" href={`/hax/v1/compare/callouts.css?v=${V}`} />
      <div className="hx-vs ln-js landing-dark landing-light" data-hx-blob-o="0.52">
        <div ref={ref} className="ln-wrap" />
      </div>
    </>
  );
}
