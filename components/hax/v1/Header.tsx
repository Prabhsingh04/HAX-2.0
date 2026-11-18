"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { flushSync } from "react-dom";
import { Menu, X } from "lucide-react";

// Figma: Header 94:18574 (instance 98:19358 on 🌐 Website v1)
type Menu = { label: string; items: { label: string; href: string; ext?: boolean; sub?: boolean }[] };

// No Initiatives menu: this site is only the HAX initiative (the logo links home).
const MENUS: Record<string, Menu> = {
  Research: {
    label: "Research",
    items: [
      { label: "Foundational Principles", href: "https://outshift.design/research/foundational-principles" },
      { label: "Cognitive Frameworks", href: "https://outshift.design/research/cognitive-frameworks" },
      { label: "Societal Impact", href: "https://outshift.design/research/societal-impact" },
      { label: "Security & Privacy", href: "https://outshift.design/research/security-privacy" },
    ],
  },
};

// The nav item for the section you're in shows the current state (see .hx-nav[aria-current]).
// Patterns comes first: the Components rule also matches "/patterns".
const SECTIONS: [string, RegExp][] = [
  ["Patterns", /^\/(patterns|interaction-patterns)(\/|$)/],
  ["Components", /^\/(library|pattern|material-)/],
  ["Docs", /^\/hax-docs/],
  ["MCP", /^\/mcp/],
  ["Blog", /^\/blog/],
];

function NavItem({ label, href, dropdown, current }: { label: string; href?: string; dropdown?: boolean; current?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (ref.current?.contains(document.activeElement)) btn.current?.focus();
      setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, [open]);
  const inner = (
    <>
      <span className="hx-navlabel font-[family-name:var(--font-ui)] font-normal leading-[26px] text-[16px] text-[color:var(--text-primary)] whitespace-nowrap">{label}</span>
      {dropdown && (
        <img alt="" src="/hax/v1/chevron-down.svg" className={`size-[16px] shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      )}
    </>
  );
  const cls = "hx-nav flex gap-[4px] items-center px-[8px] py-[6px] relative rounded-[8px] shrink-0";
  if (!dropdown) return <a href={href} aria-current={current ? "page" : undefined} className={cls}>{inner}</a>;
  const menu = MENUS[label];
  const id = `hx-menu-${label.toLowerCase()}`;
  return (
    // closes when focus tabs out of the menu, so hidden links never take focus
    <div ref={ref} className="relative" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false); }}>
      <button ref={btn} type="button" aria-expanded={open} aria-controls={id} aria-current={current || undefined} className={cls} onClick={() => setOpen((o) => !o)}>{inner}</button>
      <ul
        id={id}
        className={`absolute right-0 top-[calc(100%+10px)] z-50 min-w-[260px] rounded-[12px] border border-[var(--stroke-subtle)] bg-[var(--surface-raised)] p-[8px] shadow-[0px_8px_24px_0px_rgba(41,50,71,0.08)] origin-top transition-all duration-200 ${open ? "visible opacity-100 translate-y-0 scale-100" : "invisible pointer-events-none opacity-0 -translate-y-1 scale-[.98]"}`}
      >
        {menu.items.map((it) => (
          <li key={it.label}>
            <a href={it.href} target={it.ext ? "_blank" : undefined} rel={it.ext ? "noopener noreferrer" : undefined}
              className="hx-menuitem flex items-center gap-[6px] rounded-[8px] px-[12px] py-[8px] text-[14px] leading-[20px] text-[color:var(--text-primary)] hover:bg-[var(--surface-tint)]">
              {it.label}
              {it.ext && <img alt="" src="/hax/v1/icon-arrow-up-right.svg" className="size-[12px]" />}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Light is the default. The switch saves the choice and app/(hax)/layout.tsx applies it
// before first paint; the moon shows in light, the sun in dark (motion.css).
function ThemeSwitch() {
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.dataset.haxTheme === "dark"), []);
  const flip = (e: React.MouseEvent<HTMLButtonElement>) => {
    // read the page, not this switch: the header has a second switch for small screens
    const next = document.documentElement.dataset.haxTheme !== "dark";
    try { localStorage.setItem("hax-theme", next ? "dark" : "light"); } catch {}
    const apply = () => { document.documentElement.dataset.haxTheme = next ? "dark" : "light"; setDark(next); };
    // the new theme spreads out from the switch as a growing circle (view transitions); instant where
    // the browser lacks them or the reader prefers reduced motion
    type VT = { ready: Promise<void>; finished: Promise<void> };
    const doc = document as Document & { startViewTransition?: (cb: () => void) => VT };
    if (!doc.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) { apply(); return; }
    const b = e.currentTarget.getBoundingClientRect();
    const x = b.left + b.width / 2, y = b.top + b.height / 2;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const root = document.documentElement;
    root.classList.add("hx-vt");
    const vt = doc.startViewTransition(() => flushSync(apply));
    vt.ready.then(() => {
      root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 600, easing: "cubic-bezier(.22,1,.36,1)", pseudoElement: "::view-transition-new(root)" });
    }).catch(() => {});
    vt.finished.finally(() => root.classList.remove("hx-vt"));
  };
  return (
    <button type="button" aria-label="Dark mode" aria-pressed={dark} onClick={flip} className="hx-iconbtn flex items-center justify-center rounded-[var(--radius-pill)] size-[36px] shrink-0">
      <img alt="" src="/hax/v1/icon-theme.svg" className="hx-light-only size-[16px]" />
      <img alt="" src="/hax/v1/icon-sun.svg" className="hx-dark-only size-[16px]" />
    </button>
  );
}

// Below 1024px the links move into a menu under the header. The button opens it; Escape, a click
// outside it or following a link closes it (Escape returns focus to the button).
const LINKS: [string, string][] = [["Components", "/library"], ["Docs", "/hax-docs"], ["MCP", "/mcp"], ["Blog", "/blog"]];
function MobileNav({ section }: { section?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); btn.current?.focus(); } };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, [open]);
  const item = "hx-menuitem flex items-center gap-[6px] rounded-[8px] px-[12px] py-[10px] text-[16px] leading-[24px] text-[color:var(--text-primary)] hover:bg-[var(--surface-tint)]";
  return (
    <div ref={ref} className="flex items-center gap-[4px] lg:hidden">
      <ThemeSwitch />
      <button ref={btn} type="button" aria-expanded={open} aria-controls="hx-mobile-nav" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((o) => !o)}
        className="hx-iconbtn flex size-[40px] shrink-0 items-center justify-center rounded-[var(--radius-pill)] text-[color:var(--text-primary)]">
        {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
      </button>
      <nav id="hx-mobile-nav" aria-label="Primary"
        className={`absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-64px)] overflow-y-auto border-b border-[var(--stroke-subtle)] bg-[var(--surface-page)] px-[var(--hx-gutter)] pb-[20px] pt-[8px] shadow-[0px_8px_24px_0px_rgba(41,50,71,0.08)] transition-all duration-200 ${open ? "visible translate-y-0 opacity-100" : "invisible pointer-events-none -translate-y-1 opacity-0"}`}>
        <ul className="flex flex-col">
          {LINKS.map(([l, h]) => (
            <li key={l}><a href={h} aria-current={section === l ? "page" : undefined} onClick={() => setOpen(false)} className={`${item}${section === l ? " font-semibold" : ""}`}>{l}</a></li>
          ))}
        </ul>
        <p className="mt-[12px] px-[12px] pb-[4px] font-semibold leading-[16px] text-[11px] tracking-[1.2px] uppercase text-[color:var(--text-secondary)]">Research</p>
        <ul className="flex flex-col">
          {MENUS.Research.items.map((it) => (
            <li key={it.label}><a href={it.href} onClick={() => setOpen(false)} className={item}>{it.label}</a></li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export function Header() {
  const path = usePathname() ?? "/";
  const section = SECTIONS.find(([, re]) => re.test(path))?.[0];
  return (
    <header className="sticky top-0 z-40 bg-[var(--surface-page)] border-[var(--stroke-subtle)] border-b border-solid" data-node-id="94:18574">
      <div className="relative flex h-[64px] items-center justify-between px-[var(--hx-gutter)] max-w-[1440px] mx-auto lg:h-[94px]">
        <a href="/" className="flex gap-[14px] items-center shrink-0 [zoom:0.72] sm:[zoom:0.86] lg:[zoom:0.92] xl:[zoom:1]" aria-label="HAX by Outshift Design">
          <img alt="" src="/hax/v1/logo-hax-weave.svg" className="h-[32px] w-[86.9px] shrink-0" />
          <span className="bg-[var(--stroke-default)] h-[28px] w-px shrink-0" />
          <span className="relative h-[49.909px] w-[122px] overflow-clip shrink-0">
            <span
              className="absolute inset-[0_0.58%_0_0] block"
              style={{ maskImage: 'url("/hax/v1/outshift-mask.svg")', maskSize: "121.289px 49.909px", maskRepeat: "no-repeat" }}
            >
              <img alt="" src="/hax/v1/outshift-logo.svg" className="hx-light-only absolute inset-0 block size-full max-w-none" />
              <img alt="" src="/hax/v1/outshift-logo-dark.svg" className="hx-dark-only absolute inset-0 block size-full max-w-none" />
            </span>
          </span>
          <span className="font-light leading-[32px] text-[26px] text-[color:var(--text-primary)] tracking-[-0.2px] whitespace-nowrap">design</span>
        </a>
        <nav className="hidden lg:flex gap-[8px] items-center shrink-0 xl:gap-[20px]" aria-label="Primary">
          <NavItem label="Research" dropdown />
          <NavItem label="Components" href="/library" current={section === "Components"} />
          <NavItem label="Docs" href="/hax-docs" current={section === "Docs"} />
          <NavItem label="MCP" href="/mcp" current={section === "MCP"} />
          <NavItem label="Blog" href="/blog" current={section === "Blog"} />
          <ThemeSwitch />
        </nav>
        <MobileNav section={section} />
      </div>
    </header>
  );
}

// Figma: Announcement bar 94:18699 (instance 98:19419)
// Arrives 2s after load: the slot opens while the bar slides down from under the
// header and settles (.hx-announce in motion.css).
export function AnnouncementBar() {
  return (
    <div className="hx-announce">
    <div className="flex h-[40px] items-center justify-center gap-[10px] px-[20px]" style={{ backgroundImage: "var(--gradient-announce)" }} data-node-id="94:18699">
      <p className="font-normal leading-[20px] text-[13px] text-[color:var(--text-primary)] whitespace-nowrap">
        HAX for mobile devices.<span className="hidden md:inline"> The same agentic components. Now adapted for smaller screens.</span>
      </p>
      <a href="/pattern?id=prompt-input&device=mobile" className="hx-link flex gap-[4px] items-center px-[2px] py-px rounded-[4px]">
        <span className="font-medium leading-[18px] text-[13px] text-[color:var(--text-link)] whitespace-nowrap">Explore components</span>
        <img alt="" src="/hax/v1/icon-arrow-up-right.svg" className="hx-arrow size-[12px]" />
      </a>
    </div>
    </div>
  );
}
