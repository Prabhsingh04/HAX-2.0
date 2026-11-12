"use client";
import { useEffect, useState } from "react";
import { STAGES } from "./data";
import { Sidebar, Count } from "./Sidebar";
import { M3_BUILT } from "./material/data";

// Figma: HAX · Components 98:19982 (sidebar 98:20057, main 98:20108)
export const TOTAL = STAGES.reduce((n, s) => n + s.cats.reduce((m, c) => m + c.patterns.length, 0), 0);
export const CATS = STAGES.reduce((n, s) => n + s.cats.length, 0);


// system="material": Figma 91:9517 (HAX · Pattern library · Material 3.0). Same stages/categories,
// Material header + placeholder-preview cards; only M3_BUILT patterns link to /material-pattern.
export function Library({ system = "shadcn" }: { system?: "shadcn" | "material" }) {
  const m3 = system === "material";
  const [active, setActive] = useState(STAGES[0].id);
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-120px 0px -70% 0px" },
    );
    STAGES.forEach((s) => { const el = document.getElementById(s.id); if (el) io.observe(el); });
    const q = new URLSearchParams(location.search).get("moment");
    const map: Record<string, string> = { onboarding: "onboarding", initially: "initially", during: STAGES[2].id, "over-time": STAGES[3].id };
    if (q && map[q]) document.getElementById(map[q])?.scrollIntoView();
    return () => io.disconnect();
  }, []);

  return (
    <div className="flex w-full items-start" data-node-id="98:20056">
      <Sidebar active={active} system={system} />
      <div className="flex-1 min-w-0 flex flex-col gap-[40px] px-[64px] pt-[48px] pb-[96px]" data-node-id="98:20108">
        {m3 ? (
          <header className="flex flex-col gap-[16px] items-start" data-node-id="91:9619">
            <nav aria-label="Breadcrumb" className="flex gap-[8px] text-[12px] leading-[15px] whitespace-nowrap">
              <a href="/library" className="hx-link text-[color:var(--surface-accent)]">Components</a><span className="text-[color:var(--text-secondary)]">/</span>
              <a href="/material-agentic" className="hx-link text-[color:var(--surface-accent)]">Material 3.0</a><span className="text-[color:var(--text-secondary)]">/</span>
              <span>Agentic components</span>
            </nav>
            <M3Tag>Material 3 components</M3Tag>
            <h1 className="font-semibold leading-[48px] text-[40px] w-[780px]">A single expressive vocabulary for AI products you actually ship.</h1>
            <p className="leading-[24px] text-[15px] text-[color:var(--text-secondary)] w-[640px]">Browse by stage. Inside each, patterns cluster around a handful of recurring design conversations. Open any pattern to see the full What / Why / When / How, a live example, and the primitives it composes from.</p>
            <div className="flex gap-[12px] whitespace-nowrap">
              {([[TOTAL, "patterns"], [STAGES.length, "stages"], [CATS, "categories"]] as const).map(([n, t]) => (
                <div key={t} className="bg-[var(--surface-tint)] border border-[var(--stroke-subtle)] flex gap-[6px] items-center px-[14px] py-[10px] rounded-[var(--radius-xl)]">
                  <span className="font-semibold text-[16px] leading-[19px]">{n}</span>
                  <span className="text-[13px] leading-[16px] text-[color:var(--text-secondary)]">{t}</span>
                </div>
              ))}
            </div>
          </header>
        ) : (
          <header className="flex flex-col gap-[16px] items-start">
          <h1 className="font-semibold leading-[48px] text-[40px] tracking-[-0.5px] w-[780px]">A single source of design vocabulary for AI products you actually ship.</h1>
          <p className="leading-[22px] text-[14px] text-[color:var(--text-secondary)] w-[640px]">Browse by stage. Inside each, patterns cluster around a handful of recurring design conversations. Open any pattern to see the full What / Why / When / How, a live example, and the primitives it composes from.</p>
          <div className="flex gap-[8px]">
            {[`${TOTAL} patterns`, `${STAGES.length} stages`, `${CATS} categories`].map((t) => (
              <span key={t} className="bg-[var(--surface-tint)] border border-[var(--stroke-default)] px-[12px] py-[4px] rounded-[var(--radius-pill)] font-medium leading-[18px] text-[13px] whitespace-nowrap">{t}</span>
            ))}
          </div>
        </header>
        )}
        {STAGES.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-[94px] flex flex-col gap-[28px] pt-[41px]">
            <div className="flex flex-col gap-[12px] items-start">
              <p className="font-semibold leading-[16px] text-[11px] text-[color:var(--text-secondary)] tracking-[1.2px] uppercase">Stage {s.num}</p>
              <h2 className={`font-semibold leading-[40px] text-[32px] ${m3 ? "" : "tracking-[-0.3px]"}`}>{s.label}.</h2>
              <p className={`${m3 ? "leading-[24px] text-[15px]" : "leading-[22px] text-[14px]"} text-[color:var(--text-secondary)] w-[680px]`}>{s.lede}</p>
            </div>
            {s.cats.map((c) => (
              <div key={c.id} id={`${s.id}-${c.id}`} className="scroll-mt-[110px] flex flex-col gap-[16px]">
                <div className="flex items-center justify-between w-full">
                  <div className="flex gap-[8px] items-center">
                    <h3 className="font-semibold leading-[28px] text-[20px] whitespace-nowrap">{c.title}</h3>
                    {m3 ? <M3Tag>{c.patterns.length}</M3Tag> : <Count n={c.patterns.length} />}
                  </div>
                  <p className="leading-[20px] text-[13px] text-[color:var(--text-secondary)] whitespace-nowrap">{c.desc}</p>
                </div>
                <div className="flex flex-wrap gap-[16px]">
                  {c.patterns.map((p, i) => m3 ? <M3Card key={p.id} p={p} i={i} /> : (
                    <a key={p.id} href={`/pattern?id=${p.id}`} className="hx-card group bg-[var(--surface-tint)] border border-[var(--stroke-subtle)] flex flex-col gap-[8px] items-start overflow-clip px-[22px] py-[20px] rounded-[var(--radius-xl)] w-[333px]">
                      <img alt="" loading="lazy" src={p.img} className="block h-[181px] w-full object-cover rounded-[10px]" />
                      <p className="font-semibold leading-[16px] text-[11px] text-[color:var(--text-secondary)] tracking-[1.2px] uppercase">{String(i + 1).padStart(2, "0")}</p>
                      <h4 className="font-semibold leading-[24px] text-[16px]">{p.name}</h4>
                      <p className="h-[40px] overflow-hidden leading-[20px] text-[13px] text-[color:var(--text-secondary)] w-full line-clamp-2">{p.oneline}</p>
                      <span className="pt-[8px] flex">
                        <span className="hx-btn hx-btn--outline hx-btn--sm bg-[var(--surface-page)] border border-[var(--stroke-default)] flex gap-[4px] h-[28px] items-center px-[10px] rounded-[var(--radius-pill)] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] font-semibold leading-[16px] text-[12px] tracking-[0.06px]">
                          Open
                          <img alt="" src="/hax/v1/icon-arrow-right-12.svg" className="hx-arrow size-[12px]" />
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
    </div>
  );
}

function M3Tag({ children }: { children: React.ReactNode }) {
  return <span className="bg-[rgba(0,188,235,0.1)] border border-[rgba(0,188,235,0.25)] px-[10px] py-[3px] rounded-[var(--radius-pill)] font-medium leading-[15px] text-[12px] text-[color:var(--text-link)] whitespace-nowrap">{children}</span>;
}

// Figma 91:9657 (Pattern card · Material). Unbuilt patterns are not links and read "Coming soon".
function M3Card({ p, i }: { p: { id: string; name: string; oneline: string }; i: number }) {
  const built = M3_BUILT.includes(p.id);
  const inner = (
    <>
      <div className="pt-[14px] px-[14px] w-full">
        <div className="bg-[rgba(255,255,255,0.8)] border border-dashed border-[var(--stroke-default)] flex h-[110px] items-center justify-center rounded-[10px] w-full">
          <p className="text-[12px] leading-[15px] text-center text-[color:var(--text-secondary)] w-[265px]">Placeholder · Preview · {p.name}</p>
        </div>
      </div>
      <div className="flex flex-col gap-[6px] items-start pb-[16px] pt-[14px] px-[16px] w-full">
        <p className="font-semibold leading-[13px] text-[11px] text-[color:var(--text-secondary)] tracking-[1.2px]">{String(i + 1).padStart(2, "0")}</p>
        <h4 className="font-semibold leading-[19px] text-[16px]">{p.name}</h4>
        <p className="h-[40px] overflow-hidden line-clamp-2 leading-[20px] text-[13px] text-[color:var(--text-secondary)] w-full">{p.oneline}</p>
        <div className="flex items-center pt-[8px] w-full">
          {built ? (
            <span className="hx-btn hx-btn--outline hx-btn--sm bg-[rgba(255,255,255,0.7)] border border-[var(--stroke-default)] flex gap-[6px] items-center px-[12px] py-[6px] rounded-[var(--radius-pill)] font-medium leading-[16px] text-[13px]">
              Open
              <img alt="" src="/hax/v1/material/icon-arrow-right-12.svg" width={12} height={12} className="hx-arrow size-[12px]" />
            </span>
          ) : (
            <span className="border border-dashed border-[var(--stroke-default)] flex items-center px-[12px] py-[6px] rounded-[var(--radius-pill)] font-medium leading-[16px] text-[13px] text-[color:var(--text-tertiary)]">Coming soon</span>
          )}
        </div>
      </div>
    </>
  );
  const cls = "bg-[var(--surface-tint)] border border-[var(--stroke-subtle)] flex flex-col items-start overflow-clip rounded-[var(--radius-xl)] w-[333px]";
  return built
    ? <a href={`/material-pattern?id=${p.id}`} className={`hx-card group ${cls}`}>{inner}</a>
    : <div aria-disabled="true" className={cls}>{inner}</div>;
}
