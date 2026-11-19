"use client";
import { useEffect, useState } from "react";
import { FAMILIES, COMPS } from "./catalog";
import { MobileBar, Sidebar } from "./Sidebar";
import { Preview } from "./Previews";
import { DSContext, withDS, type DS } from "./kit/ds";
import { SETUPS } from "./setups";
import { LEVEL_LABEL } from "@/lib/v2/levels";
import type { Level } from "@/lib/v2/types";

// Figma: HAX · Components 98:19982 (sidebar 98:20057, main 98:20108). The four stages of
// 89 patterns gave way to 45 components in 8 families; every card draws its component live.
const pad = (n: number) => String(n).padStart(2, "0");

// ds: the design system from the sidebar switch (?ds=material is Material 3).
// setup: one of the four setups on Home (?setup=L2), to list only the components for it.
export function Library({ ds = "shadcn", setup }: { ds?: DS; setup?: Level }) {
  const [active, setActive] = useState(FAMILIES[0].id);
  const shown = (f: (typeof FAMILIES)[number]) => (setup ? f.comps.filter((c) => SETUPS[c.id]?.includes(setup)) : f.comps);
  const families = FAMILIES.filter((f) => shown(f).length);
  const total = families.reduce((s, f) => s + shown(f).length, 0);
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-120px 0px -70% 0px" },
    );
    FAMILIES.forEach((f) => { const el = document.getElementById(f.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  return (
    <DSContext.Provider value={ds}>
    <div className="flex w-full items-start" data-node-id="98:20056">
      <Sidebar active={active} ds={ds} />
      <div className="flex-1 min-w-0 flex flex-col gap-[40px] px-[var(--hx-gutter,20px)] pt-[32px] pb-[96px] lg:px-[64px] lg:pt-[48px]" data-node-id="98:20108">
        <header className="flex flex-col gap-[16px] items-start">
          <MobileBar ds={ds} active={active} />
          <h1 className="font-semibold leading-[38px] text-[30px] tracking-[-0.4px] w-full max-w-[780px] md:leading-[48px] md:text-[40px] md:tracking-[-0.5px]">A single source of design vocabulary for AI products you actually ship.</h1>
          <p className="leading-[22px] text-[14px] text-[color:var(--text-secondary)] w-full max-w-[640px]">Browse by family. Each family is one job the interface does between a person and an agent: taking work, showing results, asking, steering, approving, tracking, explaining and speaking up. Open any component to see it larger and what it brings together.</p>
          <div className="flex items-center gap-[8px]">
            {(setup ? [`${LEVEL_LABEL[setup]} · ${total} components`] : [`${COMPS.length} components`, `${FAMILIES.length} families`]).map((t) => (
              <span key={t} className="bg-[var(--surface-tint)] border border-[var(--stroke-default)] px-[12px] py-[4px] rounded-[var(--radius-pill)] font-medium leading-[18px] text-[13px] whitespace-nowrap">{t}</span>
            ))}
            {setup && <a href={withDS("/library", ds)} className="hx-link pl-[6px] font-semibold leading-[18px] text-[13px] text-[color:var(--text-link)]">Show all {COMPS.length}</a>}
          </div>
        </header>
        {families.map((f) => (
          // the family keeps its own number when the list is filtered
          <section key={f.id} id={f.id} className="scroll-mt-[var(--hx-sticky-lg,94px)] flex flex-col gap-[28px] pt-[41px]">
            <div className="flex flex-col gap-[12px] items-start">
              <p className="font-semibold leading-[16px] text-[11px] text-[color:var(--text-secondary)] tracking-[1.2px] uppercase">Family {pad(FAMILIES.indexOf(f) + 1)} · {shown(f).length} {shown(f).length === 1 ? "component" : "components"}</p>
              <h2 className="font-semibold leading-[40px] text-[32px] tracking-[-0.3px]">{f.name}.</h2>
              <p className="leading-[22px] text-[14px] text-[color:var(--text-secondary)] w-full max-w-[680px]">{f.lede}</p>
            </div>
            <div className="flex flex-wrap gap-[16px]">
              {shown(f).map((c, i) => (
                <a key={c.id} href={withDS(`/pattern?id=${c.id}`, ds)} className="hx-card group bg-[var(--surface-tint)] border border-[var(--stroke-subtle)] flex flex-col gap-[8px] items-start overflow-clip px-[22px] py-[20px] rounded-[var(--radius-xl)] w-full sm:w-[333px]">
                  <Preview id={c.id} />
                  <p className="font-semibold leading-[16px] text-[11px] text-[color:var(--text-secondary)] tracking-[1.2px] uppercase pt-[4px]">{pad(i + 1)}</p>
                  <h3 className="font-semibold leading-[24px] text-[16px]">{c.name}</h3>
                  <p className="h-[40px] overflow-hidden leading-[20px] text-[13px] text-[color:var(--text-secondary)] w-full line-clamp-2">{c.line}</p>
                  <span className="pt-[8px] flex">
                    <span className="hx-btn hx-btn--outline hx-btn--sm bg-[var(--surface-page)] border border-[var(--stroke-default)] flex gap-[4px] h-[28px] items-center px-[10px] rounded-[var(--radius-pill)] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] font-semibold leading-[16px] text-[12px] tracking-[0.06px]">
                      Open
                      <img alt="" src="/hax/v1/icon-arrow-right-12.svg" className="hx-arrow size-[12px]" />
                    </span>
                  </span>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
    </DSContext.Provider>
  );
}
