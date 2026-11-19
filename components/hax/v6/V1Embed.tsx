"use client";
import "@/components/hax/v1/tokens.css";
import "@/components/hax/v6/vendor/components/hax/v1/motion.css";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

// v1's latest pages inside v6, in v1's light theme under v6's nav: the 112-pattern library
// (/v4/patterns) and each pattern's page (/v4/interaction-patterns/<id>), the component library
// (/v4/library) and each component's page (/v4/pattern). The same code v1 ships; its links point at
// /patterns, /interaction-patterns, /library and /pattern, so they are rewritten to stay inside v6,
// including links React renders later.
const V1_PATHS = /^\/(patterns|interaction-patterns|library|pattern)(?=[?#/]|$)/;

export function V1Embed({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    document.documentElement.removeAttribute("data-hax-theme");
    const el = root.current;
    if (!el) return;
    const fix = () => el.querySelectorAll<HTMLAnchorElement>("a[href^='/']").forEach((a) => {
      const h = a.getAttribute("href") ?? "";
      if (V1_PATHS.test(h)) a.setAttribute("href", `/v6${h}`);
    });
    fix();
    const mo = new MutationObserver(fix);
    mo.observe(el, { subtree: true, childList: true, attributes: true, attributeFilter: ["href"] });
    return () => mo.disconnect();
  }, []);
  // below v6's fixed 72px nav. v1's sticky bars (the pattern page's "On this page", the library's
  // filter bar, sidebar and index headings) are set for v1's own header (64px, 94px from lg), which
  // left a strip of scrolling content between v6's nav and them; --hx-sticky(-lg) pins them under it.
  const offsets = { "--hx-sticky": "72px", "--hx-sticky-lg": "72px" } as CSSProperties;
  return <div ref={root} style={offsets} className="hax-v1 min-h-screen w-full bg-[var(--surface-page)] pt-[72px] text-[color:var(--text-primary)]">{children}</div>;
}
