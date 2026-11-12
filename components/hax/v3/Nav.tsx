"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// Figma: Nav 106:8169. Items follow the user's v1 decision (Research, Components, Docs, MCP,
// Blog and the theme toggle; no Initiatives menu, the logo links home), not the frame.
type Item = { label: string; href: string };
const MENUS: Record<string, Item[]> = {
  Research: [
    { label: "Foundational Principles", href: "https://outshift.design/research/foundational-principles" },
    { label: "Cognitive Frameworks", href: "https://outshift.design/research/cognitive-frameworks" },
    { label: "Societal Impact", href: "https://outshift.design/research/societal-impact" },
    { label: "Security & Privacy", href: "https://outshift.design/research/security-privacy" },
  ],
  Components: [
    { label: "ShadCN · Agentic Components", href: "/v3/library" },
    { label: "Material 3.0 · Agentic Components", href: "/material-agentic" },
  ],
};
const SECTIONS: [string, RegExp][] = [
  ["Components", /^\/v3\/(library|pattern)/],
  ["Docs", /^\/v3\/hax-docs/],
  ["MCP", /^\/v3\/mcp/],
  ["Blog", /^\/v3\/blog/],
];
const label = "relative font-medium leading-[20px] text-[14px] whitespace-nowrap";

function Menu({ name, current }: { name: string; current: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") { btn.current?.focus(); setOpen(false); } };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, [open]);
  const id = `h3-menu-${name.toLowerCase()}`;
  return (
    <div ref={ref} className="relative" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false); }}>
      <button ref={btn} type="button" aria-expanded={open} aria-controls={id} aria-current={current || undefined}
        className={`h3-nav ${label} flex gap-[4px] items-center`} onClick={() => setOpen((o) => !o)}>
        {name}
        <img alt="" src="/hax/v3/icon-chevron-down.svg" className={`size-[14px] transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <ul id={id}
        className={`absolute right-0 top-[calc(100%+14px)] z-50 min-w-[280px] rounded-[12px] border border-[var(--edge-2)] bg-[var(--panel)] p-[8px] shadow-[0_16px_40px_rgba(0,0,0,.5)] origin-top transition-all duration-200 ${open ? "visible opacity-100 translate-y-0" : "invisible pointer-events-none opacity-0 -translate-y-1"}`}>
        {MENUS[name].map((it) => {
          const ext = it.href.startsWith("http");
          return (
            <li key={it.label}>
              <a href={it.href} target={ext ? "_blank" : undefined} rel={ext ? "noopener noreferrer" : undefined}
                className="h3-menuitem flex items-center gap-[6px] rounded-[8px] px-[12px] py-[8px] text-[14px] leading-[20px] text-[color:var(--text)]">
                {it.label}
                {ext && <img alt="" src="/hax/v3/icon-upright-12.svg" className="size-[12px]" />}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Nav() {
  const path = usePathname() ?? "/v3";
  const section = SECTIONS.find(([, re]) => re.test(path))?.[0];
  // transparent over the hero; a dark glass bar once the page scrolls under it
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header className={`fixed inset-x-0 top-0 z-40 transition-[background-color,backdrop-filter] duration-300 ${solid ? "bg-[rgba(15,17,23,.78)] backdrop-blur-[14px]" : ""}`} data-node-id="106:8169">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-[40px]">
        <a href="/v3" className="flex gap-[16px] items-center shrink-0" aria-label="HAX by Outshift Design, home">
          <img alt="" src="/hax/v3/logo-hax-weave-dark.svg" className="h-[32px] w-[86.9px]" />
          <span className="h-[28px] w-px bg-[rgba(255,255,255,.2)]" />
          <span className="flex items-center">
            <span className="relative h-[40px] w-[97.775px] overflow-clip">
              <span className="absolute inset-[0_0.58%_0_0] block" style={{ maskImage: 'url("/hax/v3/outshift-mask.svg")', maskSize: "97.205px 39.999px", maskRepeat: "no-repeat" }}>
                <img alt="" src="/hax/v3/outshift-logo.svg" className="absolute inset-0 block size-full max-w-none" />
              </span>
            </span>
            <span className="pl-[6.4px] font-extralight text-[23.04px] text-[color:var(--text)]">design</span>
          </span>
        </a>
        <nav aria-label="Primary" className="flex gap-[32px] items-center">
          <Menu name="Research" current={false} />
          <Menu name="Components" current={section === "Components"} />
          {(["Docs", "MCP", "Blog"] as const).map((n) => (
            <a key={n} href={n === "Docs" ? "/v3/hax-docs" : `/v3/${n.toLowerCase()}`} aria-current={section === n ? "page" : undefined} className={`h3-nav ${label}`}>{n}</a>
          ))}
          <button type="button" aria-label="Switch theme" className="h3-icon flex size-[36px] items-center justify-center rounded-[18px] border border-[rgba(255,255,255,.24)] bg-[rgba(255,255,255,.12)]">
            <img alt="" src="/hax/v3/icon-sun.svg" className="size-[16px]" />
          </button>
        </nav>
      </div>
      {/* hairline that fades at both ends (106:8170) */}
      <div className="h-px w-full" style={{ backgroundImage: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.14) 20%, rgba(255,255,255,.14) 80%, rgba(255,255,255,0) 100%)" }} />
    </header>
  );
}
