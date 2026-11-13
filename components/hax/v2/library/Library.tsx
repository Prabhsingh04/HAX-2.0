"use client";
import { useEffect, useState } from "react";
import { STAGES } from "../../v1/library/data";
import { onTabKeys } from "../../v1/tabKeys";
import { Weave } from "../Weave";
import { ArrowRight } from "../icons";

// Figma: HAX v2 · Components 103:3839 (🌐 Website v2). v1's pattern data, read only. Stage tabs filter the
// list (v2 has no sidebar); stages alternate white and #F5F5F5 bands; every card opens /v2/pattern?id=.
const TOTAL = STAGES.reduce((n, s) => n + s.cats.reduce((m, c) => m + c.patterns.length, 0), 0);
const CATS = STAGES.reduce((n, s) => n + s.cats.length, 0);
const KEYS = ["all", ...STAGES.map((s) => s.id)];
const MOMENT: Record<string, string> = { onboarding: STAGES[0].id, initially: STAGES[1].id, during: STAGES[2].id, "over-time": STAGES[3].id };
const FADE = { top: 140, bottom: 200 };
const mono = "font-[family-name:var(--font-mono)] text-[12px] font-medium uppercase leading-[16px] tracking-[0.06em] text-[color:var(--grey)]";

export function Library() {
  const [tab, setTab] = useState("all");
  useEffect(() => {
    const q = new URLSearchParams(location.search), m = q.get("moment"), s = q.get("stage");
    const pick = (s && KEYS.includes(s) ? s : null) ?? (m ? MOMENT[m] : null);
    if (pick) setTab(pick);
  }, []);
  const choose = (k: string) => {
    setTab(k);
    const u = new URL(location.href); u.searchParams.delete("moment");
    if (k === "all") u.searchParams.delete("stage"); else u.searchParams.set("stage", k);
    history.replaceState(null, "", u);
  };
  const shown = STAGES.filter((s) => tab === "all" || s.id === tab);
  return (
    <>
      <header className="relative flex h-[660px] flex-col gap-[24px] px-[120px] pt-[168px]" data-node-id="103:3839">
        <Weave row0={0} fade={FADE} />
        <p className="hx2-rise relative flex w-fit items-center gap-[8px] rounded-full border border-[color:var(--line)] bg-[color:var(--card)] px-[12px] py-[4px] font-[family-name:var(--font-mono)] text-[12px] font-medium uppercase leading-[16px] tracking-[0.04em]">
          <span className="size-[8px] rounded-full bg-[color:var(--orange)]" />Pattern library
        </p>
        <h1 className="hx2-h1 hx2-rise relative w-fit text-[60px] font-semibold leading-[60px] tracking-[-0.03em]">A single source of design vocabulary<br />for AI products you actually ship.</h1>
        <p className="hx2-rise hx2-rise--2 relative w-[680px] text-[18px] leading-[28px] text-[color:var(--grey)]">Browse by stage. Inside each, patterns cluster around a handful of recurring design conversations. Open any pattern to see the full What / Why / When / How, a live example, and the primitives it composes from.</p>
        <p className={`hx2-rise hx2-rise--2 relative tracking-[0.04em] ${mono} font-normal`}>{TOTAL} patterns · {STAGES.length} stages · {CATS} categories</p>
        <span className="h-[16px]" />
        <div role="tablist" aria-label="Stages" onKeyDown={onTabKeys(KEYS, tab, choose)}
          className="hx2-rise hx2-rise--3 relative flex w-fit items-center gap-[4px] rounded-[12px] border border-[color:var(--line)] bg-[color:var(--card)] p-[4px]">
          {KEYS.map((k) => {
            const s = STAGES.find((x) => x.id === k), sel = tab === k;
            return (
              <button key={k} type="button" role="tab" aria-selected={sel} aria-controls="hx2-stages" tabIndex={sel ? 0 : -1} onClick={() => choose(k)}
                className={`hx2-tab rounded-[8px] px-[16px] py-[8px] text-[14px] font-semibold leading-[20px] ${sel ? "bg-[color:var(--btn)] text-[color:var(--btn-ink)]" : "text-[color:var(--grey)] hover:bg-[color:var(--fill)] hover:text-[color:var(--ink)]"}`}>
                {s ? `${s.num} ${s.label}` : "All patterns"}
              </button>
            );
          })}
        </div>
      </header>
      <div id="hx2-stages" role="tabpanel">
        {shown.map((s) => {
          const band = STAGES.indexOf(s) % 2 === 1;
          return (
            <section key={s.id} id={s.id} className="relative flex scroll-mt-[96px] flex-col gap-[64px] px-[120px] py-[96px]">
              {band && <div aria-hidden className="absolute inset-y-0 left-1/2 w-screen max-w-none -translate-x-1/2 bg-[color:var(--fill)]" />}
              <div className="hx2-reveal relative flex w-[680px] flex-col gap-[16px]">
                <p className={mono}>Stage {s.num}</p>
                <h2 className="text-[48px] font-semibold leading-[48px] tracking-[-0.02em]">{s.label}.</h2>
                <p className="text-[18px] leading-[28px] text-[color:var(--grey)]">{s.lede}</p>
              </div>
              {s.cats.map((c) => (
                <div key={c.id} id={`${s.id}-${c.id}`} className="relative flex scroll-mt-[96px] flex-col gap-[24px]">
                  <div className="hx2-reveal flex items-end justify-between">
                    <div className="flex flex-col gap-[4px]">
                      <h3 className="text-[24px] font-semibold leading-[32px] tracking-[-0.02em]">{c.title}</h3>
                      <p className="text-[16px] leading-[24px] text-[color:var(--grey)]">{c.desc}</p>
                    </div>
                    <p className={mono}>{c.patterns.length} {c.patterns.length === 1 ? "pattern" : "patterns"}</p>
                  </div>
                  <div className="flex flex-wrap gap-[24px]">
                    {c.patterns.map((p, i) => (
                      <a key={p.id} href={`/v2/pattern?id=${p.id}`} className="hx2-card hx2-reveal group flex w-[282px] flex-col rounded-[16px] border border-[color:var(--line)] bg-[color:var(--card)] p-[8px]">
                        <span className="block h-[166px] overflow-hidden rounded-[8px]"><img alt="" loading="lazy" src={p.img} className="hx2-zoom block size-full object-cover" /></span>
                        <span className="flex flex-col gap-[4px] px-[8px] pb-[8px] pt-[16px]">
                          <span className={mono}>{String(i + 1).padStart(2, "0")}</span>
                          <span className="text-[16px] font-semibold leading-[24px]">{p.name}</span>
                          <span className="line-clamp-2 h-[40px] text-[14px] leading-[20px] text-[color:var(--grey)]">{p.oneline}</span>
                          <span className="flex items-center gap-[6px] pt-[8px] text-[14px] font-semibold leading-[20px]">Open<ArrowRight className="hx2-arrow size-[14px]" strokeWidth={1.8} /></span>
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          );
        })}
      </div>
    </>
  );
}
