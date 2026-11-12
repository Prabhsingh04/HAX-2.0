"use client";
import { useEffect, useRef } from "react";

// Prabh's HAX-2.0 Material 3.0 pages (material-agentic.html / material-pattern.html), run as-is inside the
// v1 shell: same markup, same scripts (public/hax/v1/m3/js, links rewritten to v1 routes), with the styles
// scoped under .hx-m3 and remapped to v1 tokens (scripts/build-hax-m3-css.mjs).
const PAGES = {
  agentic: {
    html: `<div class="shell"><aside class="sidebar" id="sidebar" aria-label="Material 3.0 library navigation"></aside><main class="main" id="main"></main></div>`,
    scripts: ["material-nav", "material-patterns", "!mount", "material-home"],
  },
  pattern: {
    html: `<div class="detail-shell"><aside class="sidebar" id="sidebar" aria-label="Material 3.0 library navigation"></aside><main class="detail" id="detail"></main><aside class="toc" id="toc" aria-label="On this page"></aside></div>`,
    scripts: ["material-nav", "material-patterns", "material-voice", "material-attach", "material-connect", "material-mcp", "material-kb", "material-model", "material-sim", "material-preview", "material-pattern"],
  },
} as const;

export function MaterialHtml({ page }: { page: keyof typeof PAGES }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = ref.current!;
    host.innerHTML = PAGES[page].html;
    const added: HTMLScriptElement[] = [];
    let cancelled = false;
    (async () => {
      for (const s of PAGES[page].scripts) {
        if (cancelled) return;
        const el = document.createElement("script");
        if (s === "!mount") el.text = "window.MaterialNav.mount(null);";
        else el.src = `/hax/v1/m3/js/${s}.js?v=1`;
        const done = new Promise((r) => { el.onload = el.onerror = r; });
        document.body.appendChild(el); added.push(el);
        if (s !== "!mount") await done;
      }
    })();
    return () => { cancelled = true; added.forEach((e) => e.remove()); };
  }, [page]);
  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" />
      <link rel="stylesheet" href="/hax/v1/m3/m3.css?v=3" />
      <div ref={ref} className="hx-m3" />
    </>
  );
}
