"use client";
import { useEffect, useState } from "react";
import { STAGES } from "./data";
import { M3_BUILT } from "./material/data";

// Library sidebar (Figma 98:20057 / 98:25488)
const TOTAL = STAGES.reduce((n, s) => n + s.cats.reduce((m, c) => m + c.patterns.length, 0), 0);

export function Count({ n }: { n: number | string }) {
  return <span className="bg-[var(--surface-tint-hover)] flex h-[20px] items-center px-[6px] rounded-[var(--radius-pill)] font-semibold leading-[16px] text-[12px] tracking-[0.06px]">{n}</span>;
}

// Stage rows expand and collapse on click (no selected fill). Scrolling into a stage opens
// it again, so the list follows the page until you change it.
export function Sidebar({ active, title = "Pattern library", selected, system = "shadcn" }: { active: string; title?: string; selected?: string; system?: "shadcn" | "material" }) {
  const m3 = system === "material";
  const home = m3 ? "/material-agentic" : "/library";
  const base = m3 ? "/material-pattern" : "/pattern";
  const [open, setOpen] = useState([active]);
  useEffect(() => setOpen([active]), [active]);
  const toggle = (id: string) => setOpen((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));
  return (
      <nav aria-label="Pattern library" className="sticky top-[94px] max-h-[calc(100vh-94px)] overflow-y-auto shrink-0 w-[280px] border-r border-[var(--stroke-subtle)] flex flex-col gap-[2px] items-start pb-[48px] pl-[20px] pr-[16px] pt-[28px] self-stretch">
        <div className="flex gap-[8px] items-center pb-[12px] pl-[10px]">
          <p className="font-semibold leading-[20px] text-[14px]">{title}</p>
          <Count n={TOTAL} />
        </div>
        {STAGES.map((s) => {
          const isOpen = open.includes(s.id);
          return (
            <div key={s.id} className="w-full flex flex-col gap-[2px]">
              <button type="button" aria-expanded={isOpen} onClick={() => toggle(s.id)}
                className="hx-side flex h-[36px] items-center justify-between px-[10px] rounded-[8px] w-full text-left">
                <span className="font-semibold leading-[20px] text-[14px]">{s.label}</span>
                <img alt="" src="/hax/v1/chevron-sidebar.svg" className={`size-[14px] transition-transform duration-300 ${isOpen ? "" : "-rotate-90"}`} />
              </button>
              {isOpen && s.cats.map((c) => (
                <div key={c.id} className="flex flex-col gap-[2px] w-full">
                  <a href={`${selected ? home : ""}#${s.id}-${c.id}`} className="flex h-[28px] items-center px-[10px] rounded-[6px] font-semibold leading-[16px] text-[11px] tracking-[1.2px] uppercase">{c.title}</a>
                  {c.patterns.map((p) => m3 && !M3_BUILT.includes(p.id) ? (
                    <span key={p.id} title="Coming soon" className="flex h-[30px] items-center pl-[18px] pr-[10px] rounded-[6px] leading-[20px] text-[13px] text-[color:var(--text-tertiary)] cursor-default">{p.name}</span>
                  ) : (
                    <a key={p.id} href={`${base}?id=${p.id}`} aria-current={selected === p.id ? "page" : undefined} className={`hx-side flex h-[30px] items-center pl-[18px] pr-[10px] rounded-[6px] leading-[20px] text-[13px] ${selected === p.id ? "bg-[var(--surface-tint)] font-semibold text-[color:var(--text-primary)]" : "text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"}`}>{p.name}</a>
                  ))}
                </div>
              ))}
            </div>
          );
        })}
      </nav>
  );
}
