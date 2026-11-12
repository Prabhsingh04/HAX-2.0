"use client";
import { useEffect } from "react";
import { STAGES } from "@/components/hax/v1/library/data";
import { TOTAL, CATS } from "@/components/hax/v1/library/Library";
import { H1, Lede, SkyTag, Tag, WorldHero } from "../ui";

// Figma: HAX v3 · Components 114:9032 (hero 114:9033, stage index 114:9074, stages 114:9118…).
// Patterns, stages and categories are v1's data, imported read-only.
const count = (s: (typeof STAGES)[number]) => s.cats.reduce((n, c) => n + c.patterns.length, 0);

export function Library() {
  useEffect(() => {
    const q = new URLSearchParams(location.search).get("moment");
    const map: Record<string, string> = { onboarding: STAGES[0].id, initially: STAGES[1].id, during: STAGES[2].id, "over-time": STAGES[3].id };
    // wait for the web fonts, or the page reflows under the jump
    if (q && map[q]) document.fonts.ready.then(() => document.getElementById(map[q])?.scrollIntoView());
  }, []);
  return (
    <>
      <WorldHero nodeId="114:9033">
        <SkyTag>Pattern library</SkyTag>
        <H1 line1="A single source of design vocabulary" line2="for AI products you actually ship." />
        <Lede className="max-w-[880px]">Browse by stage. Inside each, patterns cluster around a handful of recurring design conversations. Open any pattern to see the full What / Why / When / How, a live example, and the primitives it composes from.</Lede>
        <div className="h3-rise h3-rise--4 flex gap-[8px]">
          {[`${TOTAL} patterns`, `${STAGES.length} stages`, `${CATS} categories`].map((t) => <Tag key={t}>{t}</Tag>)}
        </div>
      </WorldHero>

      {/* Stage index: the page's band (114:9074) */}
      <section className="relative px-[24px] pb-[48px] pt-[24px]" data-node-id="114:9074">
        <div aria-hidden className="absolute inset-x-[32px] bottom-[24px] top-0 rounded-[40px]" style={{ backgroundImage: "var(--grad-band)" }} />
        <nav aria-label="Stages" className="relative mx-auto grid max-w-[1136px] grid-cols-2 py-[48px] md:grid-cols-4">
          {STAGES.map((s, i) => (
            <a key={s.id} href={`#${s.id}`} className={`group flex flex-col gap-[8px] py-[8px] pl-[24px] pr-[4px] ${i ? "md:border-l md:border-[rgba(255,255,255,.2)]" : ""}`}>
              <span className="font-[family-name:var(--font-mono)] font-medium leading-[16px] text-[12px] tracking-[0.96px] text-[color:var(--ice)] uppercase">Stage {s.num}</span>
              <span className="font-light leading-[36px] text-[30px] tracking-[-0.3px] text-white">{s.label}.</span>
              <span className="font-[family-name:var(--font-mono)] leading-[20px] text-[13px] text-[rgba(255,255,255,.72)]">{count(s)} patterns</span>
              <span className="mt-[8px] flex items-center gap-[6px] font-semibold leading-[20px] text-[14px] text-white">
                <span className="h3-link">See the patterns</span>
                <svg viewBox="0 0 16 16" className="h3-arrow h3-arrow--down size-[14px] transition-transform group-hover:translate-y-[3px]" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v10M3.5 8.5 8 13l4.5-4.5" /></svg>
              </span>
            </a>
          ))}
        </nav>
      </section>

      <div className="mx-auto flex max-w-[1248px] flex-col gap-[96px] px-[24px] pb-[96px] pt-[72px]">
        {STAGES.map((s) => (
          <section key={s.id} id={s.id} className="flex scroll-mt-[96px] flex-col gap-[56px]">
            <div className="h3-reveal flex max-w-[680px] flex-col gap-[16px]">
              <p className="font-[family-name:var(--font-mono)] font-medium leading-[16px] text-[12px] tracking-[0.96px] text-[color:var(--cyan)] uppercase">Stage {s.num}</p>
              <h2 className="font-light text-[clamp(40px,4.5vw,56px)] leading-[1] tracking-[-0.03em] text-white">{s.label}.</h2>
              <p className="leading-[28px] text-[18px] text-[color:var(--text-2)]">{s.lede}</p>
            </div>
            {s.cats.map((c) => (
              <div key={c.id} id={`${s.id}-${c.id}`} className="flex scroll-mt-[96px] flex-col gap-[20px]">
                <div className="flex flex-wrap items-end justify-between gap-[12px]">
                  <div className="flex flex-col gap-[4px]">
                    <h3 className="leading-[30px] text-[22px] text-white">{c.title}</h3>
                    <p className="leading-[20px] text-[14px] text-[color:var(--text-2)]">{c.desc}</p>
                  </div>
                  <Tag>{c.patterns.length} patterns</Tag>
                </div>
                <div className="grid grid-cols-1 gap-[24px] lg:grid-cols-2">
                  {c.patterns.map((p, i) => (
                    <a key={p.id} href={`/v3/pattern?id=${p.id}`} className="h3-card group flex gap-[16px] rounded-[16px] border border-[var(--edge)] bg-[var(--panel)] p-[12px]">
                      <img alt="" loading="lazy" src={p.img} className="block h-[120px] w-[192px] shrink-0 rounded-[10px] bg-white object-cover" />
                      <span className="flex min-w-0 flex-col gap-[4px] py-[2px]">
                        <span className="font-[family-name:var(--font-mono)] leading-[16px] text-[12px] text-[color:var(--text-3)]">{String(i + 1).padStart(2, "0")}</span>
                        <span className="leading-[28px] text-[20px] text-white">{p.name}</span>
                        <span className="line-clamp-2 leading-[20px] text-[14px] text-[color:var(--text-2)]">{p.oneline}</span>
                        <span className="mt-auto flex items-center gap-[6px] pt-[4px] font-semibold leading-[20px] text-[14px] text-white">
                          Open<img alt="" src="/hax/v3/icon-right-16-light.svg" className="h3-arrow size-[14px]" />
                        </span>
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </section>
        ))}
      </div>
    </>
  );
}
