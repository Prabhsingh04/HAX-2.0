"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FAMILIES, COMPS } from "./catalog";
import { withDS, type DS } from "./kit/ds";

// Library sidebar (Figma 98:20057 / 98:25488). The switch on top picks the design system the
// components are drawn in; below it, the components by family.
const SYSTEMS: [DS, string][] = [["shadcn", "shadcn/ui"], ["m3", "Material 3"]];

// Same page in the other system. Keeps the rest of the address (the component, a Home setup,
// Customize's options) and the scroll position, so the two can be compared in place.
export function DSSwitch({ ds }: { ds: DS }) {
  const router = useRouter();
  const pick = (to: DS) => {
    if (to === ds) return;
    const u = new URL(location.href);
    if (to === "m3") u.searchParams.set("ds", "material"); else u.searchParams.delete("ds");
    router.push(u.pathname + u.search + u.hash, { scroll: false });
  };
  return (
    <div role="radiogroup" aria-label="Design system" className="hk-seg hk-seg--full">
      {SYSTEMS.map(([v, label]) => (
        <button key={v} type="button" role="radio" aria-checked={ds === v} aria-selected={ds === v} onClick={() => pick(v)}
          className={`hx-tab hk-seg-btn ${ds === v ? "font-semibold" : ""}`}>{label}</button>
      ))}
    </div>
  );
}

// Below lg the sidebar is hidden: the design system switch and the families as a swipe row of links.
export function MobileBar({ ds, active }: { ds: DS; active?: string }) {
  return (
    <div className="flex w-full flex-col gap-[12px] lg:hidden">
      <div className="max-w-[320px]"><DSSwitch ds={ds} /></div>
      <nav aria-label="Families" className="-mx-[var(--hx-gutter,20px)] flex gap-[6px] overflow-x-auto px-[var(--hx-gutter,20px)] pb-[2px] [scrollbar-width:none]">
        {FAMILIES.map((f) => (
          <a key={f.id} href={withDS(`/library#${f.id}`, ds)} aria-current={active === f.id ? "true" : undefined}
            className="hx-side flex shrink-0 items-center gap-[6px] whitespace-nowrap rounded-[var(--radius-pill)] border border-[var(--stroke-default)] px-[12px] py-[6px] text-[13px] font-medium leading-[18px] aria-[current=true]:border-[var(--text-primary)] aria-[current=true]:bg-[var(--surface-tint)]">
            {f.name}<span className="text-[12px] text-[color:var(--text-tertiary)]">{f.comps.length}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}

export function Count({ n }: { n: number | string }) {
  return <span className="bg-[var(--surface-tint-hover)] flex h-[20px] items-center px-[6px] rounded-[var(--radius-pill)] font-semibold leading-[16px] text-[12px] tracking-[0.06px]">{n}</span>;
}

// Family rows expand and collapse on click (no selected fill). Scrolling into a family opens
// it again, so the list follows the page until you change it.
export function Sidebar({ active, selected, ds = "shadcn" }: { active: string; selected?: string; ds?: DS }) {
  const [open, setOpen] = useState([active]);
  useEffect(() => setOpen([active]), [active]);
  const toggle = (id: string) => setOpen((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));
  return (
      // from lg up; below it the library and component pages carry the switch and a families row (MobileBar)
      <nav aria-label="Components" className="sticky top-[var(--hx-sticky-lg,94px)] max-h-[calc(100vh_-_var(--hx-sticky-lg,94px))] overflow-y-auto shrink-0 w-[280px] border-r border-[var(--stroke-subtle)] hidden lg:flex flex-col gap-[2px] items-start pb-[48px] pl-[20px] pr-[16px] pt-[28px] self-stretch">
        <div className="w-full pb-[24px]"><DSSwitch ds={ds} /></div>
        <div className="flex gap-[8px] items-center pb-[12px] pl-[10px]">
          <p className="font-semibold leading-[20px] text-[14px]">Components</p>
          <Count n={COMPS.length} />
        </div>
        {FAMILIES.map((f) => {
          const isOpen = open.includes(f.id);
          return (
            <div key={f.id} className="w-full flex flex-col gap-[2px]">
              <button type="button" aria-expanded={isOpen} onClick={() => toggle(f.id)}
                className="hx-side flex h-[36px] items-center justify-between px-[10px] rounded-[8px] w-full text-left">
                <span className="font-semibold leading-[20px] text-[14px]">{f.name}</span>
                <span className="flex items-center gap-[8px]">
                  <span className="leading-[16px] text-[12px] text-[color:var(--text-tertiary)]">{f.comps.length}</span>
                  <img alt="" src="/hax/v1/chevron-sidebar.svg" className={`size-[14px] transition-transform duration-300 ${isOpen ? "" : "-rotate-90"}`} />
                </span>
              </button>
              {isOpen && f.comps.map((c) => (
                <a key={c.id} href={withDS(`/pattern?id=${c.id}`, ds)} aria-current={selected === c.id ? "page" : undefined}
                  className={`hx-side flex h-[30px] items-center pl-[18px] pr-[10px] rounded-[6px] leading-[20px] text-[13px] ${selected === c.id ? "bg-[var(--surface-tint)] font-semibold text-[color:var(--text-primary)]" : "text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"}`}>{c.name}</a>
              ))}
            </div>
          );
        })}
      </nav>
  );
}
