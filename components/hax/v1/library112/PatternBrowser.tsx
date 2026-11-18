"use client";
import { useEffect, useMemo, useState } from "react";
import { patternHref } from "../patterns/href";
import { appearsIn, CATEGORIES, CATEGORY_LABEL, DIM_LABEL, DIMS, LIBRARY, previewSrc, type CategoryId, type Dim, type Pattern } from "./library";

// The patterns page from Srishti's v3 draft (/v3/patterns.html): browse by who is involved
// (one agent, agent teams, people) and by eleven categories, with live counts; search is v1's own.
// Three layouts to choose from (promised on the 17 Nov call: one close to hers, a few different):
//   A · Sidebar  her layout: filters down the left, text cards
//   B · Gallery  filters as chips across the top, cards led by each pattern's preview
//   C · Index    one compact list grouped by category, with the setups each pattern applies in
// Everything lives in the URL (?view=gallery&dimension=L2&category=review-approve&q=...).
// Only agentic patterns carry participant dimensions, as in her draft.
type DimF = "all" | Dim;
type CatF = "all" | CategoryId;
type View = "sidebar" | "gallery" | "index";
const VIEWS: [View, string, string][] = [
  ["sidebar", "A · Sidebar", "Close to Srishti's draft"],
  ["gallery", "B · Gallery", "Led by the previews"],
  ["index", "C · Index", "Compact, grouped by category"],
];

const label = "font-semibold leading-[16px] text-[11px] tracking-[1.2px] uppercase text-[color:var(--text-secondary)]";
const count = "font-[family-name:var(--font-code)] text-[12px] leading-[16px] text-[color:var(--text-tertiary)]";
const opt = "flex w-full items-center justify-between gap-[12px] rounded-[8px] px-[10px] py-[7px] text-left text-[14px] leading-[20px] transition-colors hover:bg-[var(--surface-tint)] disabled:pointer-events-none disabled:opacity-40 aria-[pressed=true]:bg-[var(--surface-tint)] aria-[pressed=true]:font-semibold aria-[checked=true]:bg-[var(--surface-tint)] aria-[checked=true]:font-semibold";
const pill = "inline-flex h-[34px] shrink-0 items-center gap-[8px] whitespace-nowrap rounded-full border px-[14px] text-[13px] font-medium leading-[18px] transition-colors disabled:pointer-events-none disabled:opacity-40 border-[var(--stroke-default)] bg-[var(--surface-page)] hover:bg-[var(--surface-tint)] aria-[pressed=true]:border-[var(--surface-inverse)] aria-[pressed=true]:bg-[var(--surface-inverse)] aria-[pressed=true]:text-[color:var(--text-on-inverse)] aria-[checked=true]:border-[var(--surface-inverse)] aria-[checked=true]:bg-[var(--surface-inverse)] aria-[checked=true]:text-[color:var(--text-on-inverse)]";
const input = "h-[40px] w-full rounded-[10px] border border-[var(--stroke-default)] bg-[var(--surface-page)] px-[12px] text-[14px] text-[color:var(--text-primary)] outline-none focus:border-[var(--text-link)]";

const inDim = (p: Pattern, d: DimF) => d === "all" || (p.kind === "agentic" && p.dimensions.includes(d));
const matches = (p: Pattern, q: string) => !q || `${p.name} ${p.summary}`.toLowerCase().includes(q.toLowerCase());

function useFilters() {
  const [view, setView] = useState<View>("sidebar");
  const [dim, setDim] = useState<DimF>("all");
  const [cat, setCat] = useState<CatF>("all");
  const [q, setQ] = useState("");
  useEffect(() => {
    const s = new URLSearchParams(location.search);
    const v = s.get("view"), d = s.get("dimension"), c = s.get("category");
    if (v && VIEWS.some(([k]) => k === v)) setView(v as View);
    if (d && (DIMS as string[]).includes(d)) setDim(d as Dim);
    if (c && CATEGORIES.some((x) => x.id === c)) setCat(c as CategoryId);
    setQ((s.get("q") ?? "").slice(0, 80));
  }, []);
  useEffect(() => {
    const s = new URLSearchParams();
    if (view !== "sidebar") s.set("view", view);
    if (dim !== "all") s.set("dimension", dim);
    if (cat !== "all") s.set("category", cat);
    if (q.trim()) s.set("q", q.trim());
    const qs = s.toString();
    history.replaceState(null, "", location.pathname + (qs ? `?${qs}` : ""));
  }, [view, dim, cat, q]);
  const byDim = useMemo(() => LIBRARY.filter((p) => inDim(p, dim) && matches(p, q)), [dim, q]);
  const shown = useMemo(() => byDim.filter((p) => cat === "all" || p.category === cat), [byDim, cat]);
  const dimCount = (d: DimF) => LIBRARY.filter((p) => inDim(p, d) && matches(p, q)).length;
  const catCount = (c: CategoryId) => byDim.filter((p) => p.category === c).length;
  const filtered = dim !== "all" || cat !== "all" || !!q.trim();
  const clear = () => { setDim("all"); setCat("all"); setQ(""); };
  const pickDim = (d: DimF) => { setDim(d); setCat("all"); };
  return { view, setView, dim, pickDim, cat, setCat, q, setQ, byDim, shown, dimCount, catCount, filtered, clear };
}
type F = ReturnType<typeof useFilters>;

export function PatternBrowser() {
  const f = useFilters();
  return (
    <div className="flex w-full flex-col px-[var(--hx-gutter)] pb-[96px] pt-[48px] md:pt-[64px]">
      <header className="flex flex-col gap-[24px] lg:flex-row lg:items-end lg:justify-between">
        <div className="flex max-w-[760px] flex-col gap-[14px]">
          <p className={label}>The pattern library</p>
          <h1 className="font-semibold leading-[44px] text-[38px] tracking-[-0.5px] md:leading-[58px] md:text-[50px] md:tracking-[-0.6px]">Find the right pattern.</h1>
          <p className="leading-[26px] text-[16px] text-[color:var(--text-secondary)] md:text-[18px] md:leading-[28px]">
            Explore patterns by who is involved: one agent, agent teams, and the people working with them. Patterns can appear in more than one participant dimension.
          </p>
        </div>
        {/* review only: switch between the three layout options */}
        <div role="radiogroup" aria-label="Layout option" className="flex shrink-0 flex-col gap-[8px]">
          <span className={label}>Layout option</span>
          <div className="flex flex-wrap gap-[6px]">
            {VIEWS.map(([k, l, hint]) => (
              <button key={k} type="button" role="radio" aria-checked={f.view === k} title={hint} className={pill} onClick={() => f.setView(k)}>{l}</button>
            ))}
          </div>
        </div>
      </header>
      {f.view === "sidebar" && <SidebarView f={f} />}
      {f.view === "gallery" && <GalleryView f={f} />}
      {f.view === "index" && <IndexView f={f} />}
    </div>
  );
}

function ResultsBar({ f }: { f: F }) {
  return (
    <div className="flex items-center justify-between gap-[12px] border-b border-[var(--stroke-subtle)] pb-[14px]">
      <p aria-live="polite" className="text-[14px] leading-[20px] text-[color:var(--text-secondary)]">
        <strong className="text-[color:var(--text-primary)]">{f.shown.length}</strong> patterns{f.filtered ? ` · filtered from ${LIBRARY.length}` : ""}
      </p>
      {f.filtered && <button type="button" onClick={f.clear} className="hx-link text-[13px] font-semibold text-[color:var(--text-link)]">Clear filters</button>}
    </div>
  );
}
const Empty = () => <p className="py-[40px] text-[15px] text-[color:var(--text-secondary)]">No patterns match these filters. Clear the filters to see all patterns.</p>;

function Meta({ p }: { p: Pattern }) {
  return (
    <p className="flex flex-wrap items-center gap-[8px] text-[12px] leading-[16px] text-[color:var(--text-secondary)]">
      {p.kind === "agentic" && <span className="rounded-[4px] bg-[var(--surface-tint)] px-[6px] py-px font-semibold text-[10.5px] uppercase tracking-[.6px] text-[color:var(--hx-human)]">Agentic</span>}
      {CATEGORY_LABEL[p.category]}
    </p>
  );
}
const OpenLink = () => (
  <span className="flex items-center gap-[4px] font-semibold leading-[18px] text-[13px] text-[color:var(--text-link)]">
    <span className="hx-link">Open pattern</span>
    <img alt="" src="/hax/v1/icon-arrow-right-link-12.svg" className="hx-arrow size-[12px]" />
  </span>
);

/* A · Sidebar: Srishti's layout */
function SidebarView({ f }: { f: F }) {
  return (
    <div className="mt-[40px] flex flex-col gap-[32px] lg:flex-row lg:items-start lg:gap-[48px]">
      <aside aria-label="Pattern filters" className="flex flex-col gap-[28px] lg:sticky lg:top-[118px] lg:w-[272px] lg:shrink-0">
        <label className="flex flex-col gap-[8px]">
          <span className={label}>Search</span>
          <input type="search" value={f.q} onChange={(e) => f.setQ(e.target.value)} placeholder="Name or summary" className={input} />
        </label>
        <section className="flex flex-col gap-[8px]">
          <p className={label} id="hx-dim-label">Who is involved?</p>
          <div role="radiogroup" aria-labelledby="hx-dim-label" className="flex flex-col">
            {(["all", ...DIMS] as DimF[]).map((d) => (
              <button key={d} type="button" role="radio" aria-checked={f.dim === d} className={opt} onClick={() => f.pickDim(d)}>
                <span>{d === "all" ? "All patterns" : DIM_LABEL[d]}</span><span className={count}>{f.dimCount(d)}</span>
              </button>
            ))}
          </div>
        </section>
        <nav aria-labelledby="hx-cat-label" className="flex flex-col gap-[8px]">
          <p className={label} id="hx-cat-label">Categories</p>
          <div className="flex flex-col">
            <button type="button" aria-pressed={f.cat === "all"} className={opt} onClick={() => f.setCat("all")}>
              <span>All categories</span><span className={count}>{f.byDim.length}</span>
            </button>
            {CATEGORIES.map((c) => {
              const n = f.catCount(c.id);
              return (
                <button key={c.id} type="button" aria-pressed={f.cat === c.id} disabled={n === 0} className={opt} onClick={() => f.setCat(c.id)}>
                  <span>{c.label}</span><span className={count}>{n}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </aside>
      <section aria-label="Patterns" className="flex min-w-0 flex-1 flex-col gap-[20px]">
        <ResultsBar f={f} />
        {f.shown.length ? (
          <ul className="grid grid-cols-1 gap-[16px] sm:grid-cols-2 xl:grid-cols-3">
            {f.shown.map((p) => (
              <li key={p.id} className="flex">
                <a href={patternHref(p.id)} className="hx-card group flex w-full flex-col gap-[10px] rounded-[var(--radius-xl)] border border-[var(--stroke-subtle)] bg-[var(--surface-raised)] p-[20px]">
                  <Meta p={p} />
                  <h2 className="font-semibold leading-[26px] text-[18px]">{p.name}</h2>
                  <p className="leading-[21px] text-[14px] text-[color:var(--text-secondary)]">{p.summary}</p>
                  <p className="mt-auto pt-[6px] font-[family-name:var(--font-code)] text-[11.5px] leading-[16px] text-[color:var(--text-tertiary)]">{appearsIn(p).join(" · ")}</p>
                  <OpenLink />
                </a>
              </li>
            ))}
          </ul>
        ) : <Empty />}
      </section>
    </div>
  );
}

/* B · Gallery: chips across the top, preview-led cards */
function GalleryView({ f }: { f: F }) {
  return (
    <div className="mt-[36px] flex flex-col gap-[20px]">
      <div className="sticky top-[64px] z-10 -mx-[var(--hx-gutter)] flex flex-col gap-[12px] border-b border-[var(--stroke-subtle)] bg-[var(--surface-page)] px-[var(--hx-gutter)] py-[14px] lg:top-[94px]">
        <div className="flex flex-col gap-[12px] md:flex-row md:items-center">
          <div role="radiogroup" aria-label="Who is involved?" className="flex gap-[6px] overflow-x-auto pb-[2px]">
            {(["all", ...DIMS] as DimF[]).map((d) => (
              <button key={d} type="button" role="radio" aria-checked={f.dim === d} className={pill} onClick={() => f.pickDim(d)}>
                {d === "all" ? "Everyone" : DIM_LABEL[d]}<span className="opacity-60">{f.dimCount(d)}</span>
              </button>
            ))}
          </div>
          <input type="search" value={f.q} onChange={(e) => f.setQ(e.target.value)} placeholder="Search patterns" aria-label="Search patterns" className={`${input} md:ml-auto md:w-[260px]`} />
        </div>
        <div aria-label="Categories" className="flex gap-[6px] overflow-x-auto pb-[2px]">
          <button type="button" aria-pressed={f.cat === "all"} className={pill} onClick={() => f.setCat("all")}>All categories</button>
          {CATEGORIES.map((c) => {
            const n = f.catCount(c.id);
            return <button key={c.id} type="button" aria-pressed={f.cat === c.id} disabled={n === 0} className={pill} onClick={() => f.setCat(c.id)}>{c.label}<span className="opacity-60">{n}</span></button>;
          })}
        </div>
      </div>
      <ResultsBar f={f} />
      {f.shown.length ? (
        <ul className="grid grid-cols-1 gap-[20px] sm:grid-cols-2 xl:grid-cols-3">
          {f.shown.map((p) => (
            <li key={p.id} className="flex">
              <a href={patternHref(p.id)} className="hx-card group flex w-full flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--stroke-subtle)] bg-[var(--surface-raised)]">
                <div className="flex aspect-[16/10] w-full items-center justify-center overflow-hidden border-b border-[var(--stroke-subtle)] bg-[var(--surface-tint)] p-[12px]">
                  {/* the whole preview, scaled to fit (a crop would cut it at random places) */}
                  <img src={previewSrc(p.id)} alt="" loading="lazy" className="block max-h-full max-w-full rounded-[8px] bg-white object-contain shadow-[0_2px_10px_rgba(41,50,71,.08)] transition-transform duration-500 group-hover:scale-[1.03]" />
                </div>
                <div className="flex flex-1 flex-col gap-[8px] p-[18px]">
                  <Meta p={p} />
                  <h2 className="font-semibold leading-[26px] text-[18px]">{p.name}</h2>
                  <p className="leading-[21px] text-[14px] text-[color:var(--text-secondary)]">{p.summary}</p>
                  <div className="mt-auto pt-[6px]"><OpenLink /></div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      ) : <Empty />}
    </div>
  );
}

/* C · Index: one compact list grouped by category; dots show the setups each agentic pattern applies in */
function IndexView({ f }: { f: F }) {
  const groups = CATEGORIES.map((c) => ({ ...c, items: f.shown.filter((p) => p.category === c.id) })).filter((g) => g.items.length);
  return (
    <div className="mt-[36px] flex flex-col gap-[20px]">
      <div className="grid grid-cols-1 gap-[12px] md:grid-cols-[1fr_240px_240px]">
        <input type="search" value={f.q} onChange={(e) => f.setQ(e.target.value)} placeholder="Search patterns" aria-label="Search patterns" className={input} />
        <select value={f.dim} onChange={(e) => f.pickDim(e.target.value as DimF)} aria-label="Who is involved?" className={input}>
          {(["all", ...DIMS] as DimF[]).map((d) => <option key={d} value={d}>{d === "all" ? "Who is involved: everyone" : DIM_LABEL[d]} ({f.dimCount(d)})</option>)}
        </select>
        <select value={f.cat} onChange={(e) => f.setCat(e.target.value as CatF)} aria-label="Category" className={input}>
          <option value="all">All categories ({f.byDim.length})</option>
          {CATEGORIES.map((c) => <option key={c.id} value={c.id} disabled={!f.catCount(c.id)}>{c.label} ({f.catCount(c.id)})</option>)}
        </select>
      </div>
      <ResultsBar f={f} />
      <div className="hidden items-center gap-[16px] px-[12px] md:flex">
        <span className={`${label} flex-1`}>Pattern</span>
        <span className={`${label} w-[200px]`}>Appears in</span>
        <span className={`${label} w-[132px] text-right`} title="One agent · Agent team only · + one person · + multiple people">Who is involved</span>
      </div>
      {groups.length ? groups.map((g) => (
        <section key={g.id} aria-labelledby={`hx-g-${g.id}`} className="flex flex-col">
          <h2 id={`hx-g-${g.id}`} className="sticky top-[64px] z-[5] flex items-baseline gap-[10px] border-b border-[var(--stroke-default)] bg-[var(--surface-page)] px-[12px] py-[10px] font-semibold text-[15px] lg:top-[94px]">
            {g.label}<span className={count}>{g.items.length}</span>
          </h2>
          <ul>
            {g.items.map((p) => (
              <li key={p.id}>
                <a href={patternHref(p.id)} className="group flex flex-col gap-[4px] border-b border-[var(--stroke-subtle)] px-[12px] py-[12px] transition-colors hover:bg-[var(--surface-tint)] md:flex-row md:items-center md:gap-[16px]">
                  <span className="flex min-w-0 flex-1 flex-col gap-[2px]">
                    <span className="flex items-center gap-[8px] font-semibold text-[15px] leading-[22px]">
                      {p.name}
                      {p.kind === "agentic" && <span className="rounded-[4px] bg-[var(--surface-tint)] px-[5px] py-px font-semibold text-[10px] uppercase tracking-[.6px] text-[color:var(--hx-human)]">Agentic</span>}
                    </span>
                    <span className="truncate text-[13.5px] leading-[20px] text-[color:var(--text-secondary)]">{p.summary}</span>
                  </span>
                  <span className="font-[family-name:var(--font-code)] text-[11.5px] leading-[16px] text-[color:var(--text-tertiary)] md:w-[200px]">{appearsIn(p).join(" · ")}</span>
                  <span className="flex gap-[6px] md:w-[132px] md:justify-end" aria-label={p.kind === "agentic" ? `Applies in: ${p.dimensions.map((d) => DIM_LABEL[d]).join(", ")}` : "No participant setup"}>
                    {p.kind === "agentic" ? DIMS.map((d) => (
                      <span key={d} title={DIM_LABEL[d]} className={`size-[10px] rounded-full ${p.dimensions.includes(d) ? (p.level.primary === d ? "bg-[var(--hx-human)]" : "bg-[color-mix(in_srgb,var(--hx-human)_45%,transparent)]") : "border border-[var(--stroke-default)]"}`} />
                    )) : <span className="text-[12px] text-[color:var(--text-tertiary)]">General</span>}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )) : <Empty />}
      <p className="text-[12.5px] leading-[18px] text-[color:var(--text-tertiary)]">Dots, left to right: one agent, agent team only, agent team + one person, agent team + multiple people. The solid dot is the pattern&apos;s main setup.</p>
    </div>
  );
}
