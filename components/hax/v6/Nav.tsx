"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu as MenuIcon, X } from "lucide-react";

// v3's nav (Figma Nav 106:8169) on white, with v1's latest items (v5, Srishti 14 and 17 Nov):
// Outshift design first, linked to outshift.design, then the HAX logo, linked home; Patterns, Docs
// and MCP. No Research menu and no Blog (they live on the HAX website); components are in the footer.
const SECTIONS: [string, RegExp][] = [
  ["Patterns", /^\/v6\/(patterns|interaction-patterns)(\/|$)/],
  ["Components", /^\/v6\/(library|pattern)(\/|$)/],
  ["Docs", /^\/v6\/hax-docs/],
  ["MCP", /^\/v6\/mcp/],
];
const LINKS: [string, string][] = [["Patterns", "/v4/patterns"], ["Docs", "/v4/hax-docs"], ["MCP", "/v4/mcp"]];
const label = "relative font-medium leading-[20px] text-[14px] whitespace-nowrap";

// Outshift design (v1's light logo, at v3's size) | HAX
function Brand() {
  return (
    <div className="flex shrink-0 items-center gap-[14px] [zoom:0.8] sm:[zoom:1]">
      <a href="https://outshift.design" className="flex items-center" aria-label="Outshift Design">
        <span className="relative h-[40px] w-[97.6px] overflow-clip">
          <span className="absolute inset-[0_0.58%_0_0] block" style={{ maskImage: 'url("/hax/v1/outshift-mask.svg")', maskSize: "97.03px 39.93px", maskRepeat: "no-repeat" }}>
            <img alt="" src="/hax/v1/outshift-logo.svg" className="absolute inset-0 block size-full max-w-none" />
          </span>
        </span>
        <span className="pl-[6.4px] font-extralight text-[23.04px] text-[color:var(--text)]">design</span>
      </a>
      <span className="h-[28px] w-px bg-[var(--edge-2)]" />
      <a href="/v4" aria-label="HAX home" className="flex items-center">
        <img alt="" src="/hax/v1/logo-hax-weave.svg" className="h-[32px] w-[86.9px]" />
      </a>
    </div>
  );
}

// Below 1024px the links move into a panel under the header. The button opens it; Escape, a click
// outside it or following a link closes it (Escape returns focus to the button).
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
  const item = "h6-menuitem flex items-center gap-[6px] rounded-[8px] px-[12px] py-[10px] text-[16px] leading-[24px] text-[color:var(--text)]";
  return (
    <div ref={ref} className="flex items-center lg:hidden">
      <button ref={btn} type="button" aria-expanded={open} aria-controls="h6-mobile-nav" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((o) => !o)}
        className="h6-icon flex size-[40px] shrink-0 items-center justify-center rounded-[999px] text-[color:var(--text)]">
        {open ? <X size={20} aria-hidden="true" /> : <MenuIcon size={20} aria-hidden="true" />}
      </button>
      <nav id="h6-mobile-nav" aria-label="Primary"
        className={`absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-72px)] overflow-y-auto border-b border-[var(--edge-2)] bg-[var(--bg)] px-[24px] pb-[20px] pt-[8px] shadow-[0_16px_40px_rgba(15,17,23,.08)] transition-all duration-200 xl:px-[40px] ${open ? "visible translate-y-0 opacity-100" : "invisible pointer-events-none -translate-y-1 opacity-0"}`}>
        <ul className="flex flex-col">
          {LINKS.map(([l, h]) => (
            <li key={l}><a href={h} aria-current={section === l ? "page" : undefined} onClick={() => setOpen(false)} className={`${item}${section === l ? " font-semibold" : ""}`}>{l}</a></li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export function Nav() {
  const path = usePathname() ?? "/v4";
  const section = SECTIONS.find(([, re]) => re.test(path))?.[0];
  // transparent over the hero; a frosted white bar once the page scrolls under it
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header className={`fixed inset-x-0 top-0 z-40 transition-[background-color,backdrop-filter,box-shadow] duration-300 ${solid ? "bg-[rgba(255,255,255,.9)] backdrop-blur-[14px]" : ""}`} data-node-id="106:8169">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-[24px] xl:px-[40px]">
        <Brand />
        <nav aria-label="Primary" className="hidden items-center gap-[32px] lg:flex">
          {LINKS.map(([l, h]) => (
            <a key={l} href={h} aria-current={section === l ? "page" : undefined} className={`h6-nav ${label}`}>{l}</a>
          ))}
        </nav>
        <MobileNav section={section} />
      </div>
      {/* hairline that fades at both ends (106:8170); shows once the bar is solid */}
      <div className={`h-px w-full transition-opacity duration-300 ${solid ? "opacity-100" : "opacity-0"}`} style={{ backgroundImage: "linear-gradient(90deg, rgba(15,17,23,0) 0%, rgba(15,17,23,.1) 20%, rgba(15,17,23,.1) 80%, rgba(15,17,23,0) 100%)" }} />
    </header>
  );
}
