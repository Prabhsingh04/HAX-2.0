"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { flushSync } from "react-dom";

// Figma: Nav 99:28985 (🌐 Website v2). The Wave nav: a floating bar, white at 78% over a blur.
// Same items and links as v1 (no Initiatives: the logo links home); routes stay inside /v2.
type Item = { label: string; href: string; ext?: boolean };
const MENUS: Record<string, Item[]> = {
  Research: [
    { label: "Foundational Principles", href: "https://outshift.design/research/foundational-principles", ext: true },
    { label: "Cognitive Frameworks", href: "https://outshift.design/research/cognitive-frameworks", ext: true },
    { label: "Societal Impact", href: "https://outshift.design/research/societal-impact", ext: true },
    { label: "Security & Privacy", href: "https://outshift.design/research/security-privacy", ext: true },
  ],
  Components: [
    { label: "ShadCN · Agentic Components", href: "/v2/library" },
    { label: "Material 3.0 · Agentic Components", href: "/material-agentic" },
  ],
};
const SECTIONS: [string, RegExp][] = [
  ["Components", /^\/v2\/(library|pattern)/],
  ["Docs", /^\/v2\/hax-docs/],
  ["MCP", /^\/v2\/mcp/],
  ["Blog", /^\/v2\/blog/],
];
const item = "group relative flex items-center gap-[6px] rounded-[8px] px-[10px] py-[8px] text-[14px] leading-[20px] transition-colors duration-300 hover:bg-[color:var(--fill)]";

function Menu({ label, current }: { label: string; current: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close); document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, [open]);
  const id = `hx2-menu-${label.toLowerCase()}`;
  return (
    <div ref={ref} className="relative" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false); }}>
      <button type="button" aria-expanded={open} aria-controls={id} aria-current={current || undefined} onClick={() => setOpen((o) => !o)}
        className={`${item} ${current ? "font-medium text-[color:var(--nav-ink)]" : "text-[color:var(--nav-muted)] hover:text-[color:var(--nav-ink)]"}`}>
        {label}
        <svg viewBox="0 0 8 4" className={`h-[4px] w-[8px] transition-transform duration-300 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M.75.75 4 3.25 7.25.75" /></svg>
        {current && <span className="absolute inset-x-[10px] bottom-[2px] h-[2px] rounded-full bg-[color:var(--nav-ink)]" />}
      </button>
      <ul id={id} className={`absolute right-0 top-[calc(100%+12px)] z-50 min-w-[280px] origin-top rounded-[12px] border border-[color:var(--nav-line)] bg-[color:var(--card)] p-[8px] shadow-[0_12px_32px_var(--shadow)] transition-all duration-200 ${open ? "visible translate-y-0 scale-100 opacity-100" : "pointer-events-none invisible -translate-y-1 scale-[.98] opacity-0"}`}>
        {MENUS[label].map((it) => (
          <li key={it.label}>
            <a href={it.href} target={it.ext ? "_blank" : undefined} rel={it.ext ? "noopener noreferrer" : undefined}
              className="flex items-center justify-between gap-[8px] rounded-[8px] px-[12px] py-[10px] text-[14px] leading-[20px] text-[color:var(--nav-ink)] transition-colors hover:bg-[color:var(--fill)]">
              {it.label}
              {it.ext && <svg viewBox="0 0 24 24" className="size-[12px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h10v10" /><path d="M7 17 17 7" /></svg>}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Lockup({ footer = false }: { footer?: boolean }) {
  return (
    <span className="flex items-center gap-[14px]">
      <img alt="" src="/hax/v1/logo-hax-weave.svg" className={footer ? "h-[24px] w-[65px]" : "h-[28px] w-[76px]"} />
      <span className="h-[24px] w-px bg-[color:var(--nav-line)]" />
      <span className={`relative block overflow-clip ${footer ? "h-[40px] w-[98px]" : "h-[40px] w-[98px]"}`}>
        <span className="absolute inset-0 block" style={{ maskImage: 'url("/hax/v1/outshift-mask.svg")', maskSize: "97.2px 40px", maskRepeat: "no-repeat", WebkitMaskImage: 'url("/hax/v1/outshift-mask.svg")', WebkitMaskSize: "97.2px 40px", WebkitMaskRepeat: "no-repeat" }}>
          <img alt="" src={footer ? "/hax/v1/outshift-logo-footer.svg" : "/hax/v1/outshift-logo.svg"} className="hx2-light-only absolute inset-0 block size-full max-w-none" />
          <img alt="" src="/hax/v1/outshift-logo-dark.svg" className="hx2-dark-only absolute inset-0 block size-full max-w-none" />
        </span>
      </span>
      {!footer && <span className="text-[22px] font-light leading-[28px] tracking-[-0.2px] text-[color:var(--nav-ink)]">design</span>}
    </span>
  );
}

export function Nav() {
  const path = usePathname() ?? "/v2";
  const section = SECTIONS.find(([, re]) => re.test(path))?.[0];
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const f = () => setScrolled(window.scrollY > 8); f(); window.addEventListener("scroll", f, { passive: true }); return () => window.removeEventListener("scroll", f); }, []);
  return (
    <header className="pointer-events-none fixed inset-x-0 top-[16px] z-40 flex justify-center px-[16px]">
      <div className={`pointer-events-auto flex h-[58px] w-full max-w-[1200px] items-center justify-between rounded-[16px] border border-[color:var(--nav-line)] bg-[color:var(--nav-bg)] pl-[16px] pr-[8px] backdrop-blur-[16px] transition-shadow duration-300 ${scrolled ? "shadow-[0_8px_24px_rgba(17,17,17,0.06)]" : ""}`}>
        <a href="/v2" aria-label="HAX by Outshift Design, home"><Lockup /></a>
        <nav aria-label="Primary" className="flex items-center gap-[4px]">
          <Menu label="Research" current={false} />
          <Menu label="Components" current={section === "Components"} />
          {[["Docs", "/v2/hax-docs"], ["MCP", "/v2/mcp"], ["Blog", "/v2/blog"]].map(([l, h]) => (
            <a key={l} href={h} aria-current={section === l ? "page" : undefined}
              className={`${item} ${section === l ? "font-medium text-[color:var(--nav-ink)]" : "text-[color:var(--nav-muted)] hover:text-[color:var(--nav-ink)]"}`}>
              {l}
              {section === l && <span className="absolute inset-x-[10px] bottom-[2px] h-[2px] rounded-full bg-[color:var(--nav-ink)]" />}
            </a>
          ))}
          <ThemeSwitch />
        </nav>
      </div>
    </header>
  );
}

function ThemeSwitch() {
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(document.documentElement.dataset.hax2Theme === "dark"); }, []);
  const flip = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next = !dark;
    try { localStorage.setItem("hax-v2-theme", next ? "dark" : "light"); } catch {}
    const apply = () => { document.documentElement.dataset.hax2Theme = next ? "dark" : "light"; setDark(next); };
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
    if (!doc.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) { apply(); return; }
    // the new theme grows out of the switch as a circle, ~600 ms
    const b = e.currentTarget.getBoundingClientRect(), x = b.left + b.width / 2, y = b.top + b.height / 2;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const vt = doc.startViewTransition(() => { flushSync(apply); });
    vt.ready.then(() => document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
      { duration: 600, easing: "cubic-bezier(.22, 1, .36, 1)", pseudoElement: "::view-transition-new(root)" },
    )).catch(() => {});
  };
  return (
          <button type="button" onClick={flip} aria-pressed={dark} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} className="ml-[12px] flex size-[36px] items-center justify-center rounded-[8px] border border-[color:var(--nav-line)] text-[color:var(--nav-ink)] transition-colors hover:bg-[color:var(--fill)] active:bg-[color:var(--fill-2)]">
            {dark
              ? <svg viewBox="0 0 24 24" className="size-[14px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></svg>
              : <svg viewBox="0 0 24 24" className="size-[14px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>}
          </button>
  );
}
