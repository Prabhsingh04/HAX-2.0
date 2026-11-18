"use client";
import { useEffect, useMemo, useState } from "react";
import { patternHref } from "../patterns/href";
import { appearsIn, CATEGORIES, CATEGORY_LABEL, DIM_LABEL, DIMS, LIBRARY, type CategoryId, type Dim, type Pattern } from "./library";

// The patterns page from Srishti's v3 draft (/v3/patterns.html): browse by who is involved
// (one agent, agent teams, people) and by eleven categories, with live counts; a search box is
// v1's own. Filters live in the URL (?dimension=L2&category=review-approve&q=...) so a view can be
// shared. Only agentic patterns carry participant dimensions, as in her draft.
type DimF = "all" | Dim;
type CatF = "all" | CategoryId;

const label = "font-semibold leading-[16px] text-[11px] tracking-[1.2px] uppercase text-[color:var(--text-secondary)]";
const count = "font-[family-name:var(--font-code)] text-[12px] leading-[16px] text-[color:var(--text-tertiary)]";
const opt = "flex w-full items-center justify-between gap-[12px] rounded-[8px] px-[10px] py-[7px] text-left text-[14px] leading-[20px] transition-colors hover:bg-[var(--surface-tint)] disabled:pointer-events-none disabled:opacity-40 aria-[pressed=true]:bg-[var(--surface-tint)] aria-[pressed=true]:font-semibold aria-[checked=true]:bg-[var(--surface-tint)] aria-[checked=true]:font-semibold";

const inDim = (p: Pattern, d: DimF) => d === "all" || (p.kind === "agentic" && p.dimensions.includes(d));
const matches = (p: Pattern, q: string) => !q || `${p.name} ${p.summary}`.toLowerCase().includes(q.toLowerCase());

export function PatternBrowser() {
  const [dim, setDim] = useState<DimF>("all");
  const [cat, setCat] = useState<CatF>("all");
  const [q, setQ] = useState("");
  useEffect(() => {
    const s = new URLSearchParams(location.search);
    const d = s.get("dimension"), c = s.get("category");
    if (d && (DIMS as string[]).includes(d)) setDim(d as Dim);
    if (c && CATEGORIES.some((x) => x.id === c)) setCat(c as CategoryId);
    setQ((s.get("q") ?? "").slice(0, 80));
  }, []);
  useEffect(() => {
    const s = new URLSearchParams();
    if (dim !== "all") s.set("dimension", dim);
    if (cat !== "all") s.set("category", cat);
    if (q.trim()) s.set("q", q.trim());
    const qs = s.toString();
    history.replaceState(null, "", location.pathname + (qs ? `?${qs}` : ""));
  }, [dim, cat, q]);

  const byDim = useMemo(() => LIBRARY.filter((p) => inDim(p, dim) && matches(p, q)), [dim, q]);
  const shown = useMemo(() => byDim.filter((p) => cat === "all" || p.category === cat), [byDim, cat]);
  const catCount = (c: CategoryId) => byDim.filter((p) => p.category === c).length;
  const filtered = dim !== "all" || cat !== "all" || !!q.trim();

  return (
    <div className="flex w-full flex-col px-[var(--hx-gutter)] pb-[96px] pt-[48px] md:pt-[64px]">
      <header className="flex max-w-[760px] flex-col gap-[14px]">
        <p className={label}>The pattern library</p>
        <h1 className="font-semibold leading-[44px] text-[38px] tracking-[-0.5px] md:leading-[58px] md:text-[50px] md:tracking-[-0.6px]">Find the right pattern.</h1>
        <p className="leading-[26px] text-[16px] text-[color:var(--text-secondary)] md:text-[18px] md:leading-[28px]">
          Explore patterns by who is involved: one agent, agent teams, and the people working with them. Patterns can appear in more than one participant dimension.
        </p>
      </header>

      <div className="mt-[40px] flex flex-col gap-[32px] lg:flex-row lg:items-start lg:gap-[48px]">
        <aside aria-label="Pattern filters" className="flex flex-col gap-[28px] lg:sticky lg:top-[118px] lg:w-[272px] lg:shrink-0">
          <label className="flex flex-col gap-[8px]">
            <span className={label}>Search</span>
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or summary"
              className="h-[40px] rounded-[10px] border border-[var(--stroke-default)] bg-[var(--surface-page)] px-[12px] text-[14px] text-[color:var(--text-primary)] outline-none focus:border-[var(--text-link)]" />
          </label>
          <section className="flex flex-col gap-[8px]">
            <p className={label} id="hx-dim-label">Who is involved?</p>
            <div role="radiogroup" aria-labelledby="hx-dim-label" className="flex flex-col">
              {(["all", ...DIMS] as DimF[]).map((d) => (
                <button key={d} type="button" role="radio" aria-checked={dim === d} className={opt} onClick={() => { setDim(d); setCat("all"); }}>
                  <span>{d === "all" ? "All patterns" : DIM_LABEL[d]}</span>
                  <span className={count}>{LIBRARY.filter((p) => inDim(p, d) && matches(p, q)).length}</span>
                </button>
              ))}
            </div>
          </section>
          <nav aria-labelledby="hx-cat-label" className="flex flex-col gap-[8px]">
            <p className={label} id="hx-cat-label">Categories</p>
            <div className="flex flex-col">
              <button type="button" aria-pressed={cat === "all"} className={opt} onClick={() => setCat("all")}>
                <span>All categories</span><span className={count}>{byDim.length}</span>
              </button>
              {CATEGORIES.map((c) => {
                const n = catCount(c.id);
                return (
                  <button key={c.id} type="button" aria-pressed={cat === c.id} disabled={n === 0} className={opt} onClick={() => setCat(c.id)}>
                    <span>{c.label}</span><span className={count}>{n}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </aside>

        <section aria-label="Patterns" className="flex min-w-0 flex-1 flex-col gap-[20px]">
          <div className="flex items-center justify-between gap-[12px] border-b border-[var(--stroke-subtle)] pb-[14px]">
            <p aria-live="polite" className="text-[14px] leading-[20px] text-[color:var(--text-secondary)]">
              <strong className="text-[color:var(--text-primary)]">{shown.length}</strong> patterns{filtered ? ` · filtered from ${LIBRARY.length}` : ""}
            </p>
            {filtered && (
              <button type="button" onClick={() => { setDim("all"); setCat("all"); setQ(""); }} className="hx-link text-[13px] font-semibold text-[color:var(--text-link)]">Clear filters</button>
            )}
          </div>
          {shown.length ? (
            <ul className="grid grid-cols-1 gap-[16px] sm:grid-cols-2 xl:grid-cols-3">
              {shown.map((p) => (
                <li key={p.id} className="flex">
                  <a href={patternHref(p.id)} className="hx-card group flex w-full flex-col gap-[10px] rounded-[var(--radius-xl)] border border-[var(--stroke-subtle)] bg-[var(--surface-raised)] p-[20px]">
                    <p className="flex items-center gap-[8px] text-[12px] leading-[16px] text-[color:var(--text-secondary)]">
                      {p.kind === "agentic" && <span className="rounded-[4px] bg-[var(--surface-tint)] px-[6px] py-px font-semibold text-[10.5px] uppercase tracking-[.6px] text-[color:var(--hx-human)]">Agentic</span>}
                      {CATEGORY_LABEL[p.category]}
                    </p>
                    <h2 className="font-semibold leading-[26px] text-[18px]">{p.name}</h2>
                    <p className="leading-[21px] text-[14px] text-[color:var(--text-secondary)]">{p.summary}</p>
                    <p className="mt-auto pt-[6px] font-[family-name:var(--font-code)] text-[11.5px] leading-[16px] text-[color:var(--text-tertiary)]">{appearsIn(p).join(" · ")}</p>
                    <span className="flex items-center gap-[4px] font-semibold leading-[18px] text-[13px] text-[color:var(--text-link)]">
                      <span className="hx-link">Open pattern</span>
                      <img alt="" src="/hax/v1/icon-arrow-right-link-12.svg" className="hx-arrow size-[12px]" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-[40px] text-[15px] text-[color:var(--text-secondary)]">No patterns match these filters. Clear the filters to see all patterns.</p>
          )}
        </section>
      </div>
    </div>
  );
}
