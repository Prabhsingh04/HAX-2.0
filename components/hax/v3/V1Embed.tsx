"use client";
import "../v1/tokens.css";
import "../v1/motion.css";
import { useEffect, useRef, type ReactNode } from "react";

// v1's latest pages inside v3: the component library (/v3/library) and each component's page
// (/v3/pattern) are v1's own Library and PatternPage, the same code v1 ships, drawn in v1's dark
// theme under v3's nav. The dark theme is html[data-hax-theme="dark"] (set before paint by
// app/(hax-v3)/layout.tsx; set here too in case). v1's links point at /library and /pattern, so
// they are rewritten to /v3/library and /v3/pattern to keep people inside v3, including links React
// renders later.
const V1_PATHS = /^\/(library|pattern)(?=[?#/]|$)/;

export function V1Embed({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    document.documentElement.setAttribute("data-hax-theme", "dark");
    const el = root.current;
    if (!el) return;
    const fix = () => el.querySelectorAll<HTMLAnchorElement>("a[href^='/library'], a[href^='/pattern']").forEach((a) => {
      const h = a.getAttribute("href") ?? "";
      if (V1_PATHS.test(h)) a.setAttribute("href", `/v3${h}`);
    });
    fix();
    const mo = new MutationObserver(fix);
    mo.observe(el, { subtree: true, childList: true, attributes: true, attributeFilter: ["href"] });
    return () => mo.disconnect();
  }, []);
  // below v3's fixed 72px nav
  return <div ref={root} className="hax-v1 min-h-screen w-full bg-[var(--surface-page)] pt-[72px] text-[color:var(--text-primary)]">{children}</div>;
}
