"use client";
import { useEffect, useState } from "react";
import { FAMILIES, COMPS } from "./catalog";

// Library sidebar (Figma 98:20057 / 98:25488). Lists the 45 components by family.
export function Count({ n }: { n: number | string }) {
  return <span className="bg-[var(--surface-tint-hover)] flex h-[20px] items-center px-[6px] rounded-[var(--radius-pill)] font-semibold leading-[16px] text-[12px] tracking-[0.06px]">{n}</span>;
}

// Family rows expand and collapse on click (no selected fill). Scrolling into a family opens
// it again, so the list follows the page until you change it.
export function Sidebar({ active, selected }: { active: string; selected?: string }) {
  const [open, setOpen] = useState([active]);
  useEffect(() => setOpen([active]), [active]);
  const toggle = (id: string) => setOpen((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));
  return (
      <nav aria-label="Components" className="sticky top-[94px] max-h-[calc(100vh-94px)] overflow-y-auto shrink-0 w-[280px] border-r border-[var(--stroke-subtle)] flex flex-col gap-[2px] items-start pb-[48px] pl-[20px] pr-[16px] pt-[28px] self-stretch">
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
                <a key={c.id} href={`/pattern?id=${c.id}`} aria-current={selected === c.id ? "page" : undefined}
                  className={`hx-side flex h-[30px] items-center pl-[18px] pr-[10px] rounded-[6px] leading-[20px] text-[13px] ${selected === c.id ? "bg-[var(--surface-tint)] font-semibold text-[color:var(--text-primary)]" : "text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"}`}>{c.name}</a>
              ))}
            </div>
          );
        })}
      </nav>
  );
}
