"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ListItem } from "./data";
import { Eyebrow, Grad } from "../ui";

// The results line says what is shown ("Showing 112 patterns for all involvements and all categories")
// and both parts are switchers: a menu with the same options and counts as the sidebar, so the two
// filters read as one structure (19 Nov, the user: "All patterns" above one chosen category was confusing).
// Same order as the sidebar (20 Nov, the user): its upper group, Who is involved, is the left switcher;
// its lower group, Categories, the right one.
const INVOLVEMENTS = "All involvements"; // her draft says "All patterns"; it reads as the other group's "All categories"
const showLabel = (k: string, l: string) => (k === "all" ? l.toLowerCase() : l);
// "Any agent team" (20 Nov, for the home hero's "Multi-agent patterns" tag): her three "Agent team…"
// options each hold only part of the agent patterns (8, 28, 15), so this one holds every pattern with
// an agent team in any of them (30). It sits right before them.
const TEAM: [string, string] = ["multi-agent", "Any agent team"];
const TEAMS = ["L2", "L3", "L4"];
function involvements(dims: [string, string][]): [string, string][] {
  const out = dims.map(([k, l]): [string, string] => [k, k === "all" ? INVOLVEMENTS : l]);
  const at = out.findIndex(([k]) => TEAMS.includes(k));
  if (at >= 0) out.splice(at, 0, TEAM);
  return out;
}
const inDim = (p: ListItem, d: string) =>
  d === "all" || (d === TEAM[0] ? TEAMS.some((k) => p.dims.includes(k)) : p.dims.includes(d));

function Switcher({ label, value, options, count, onPick }: { label: string; value: string; options: [string, string][]; count: (k: string) => number; onPick: (k: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); btn.current?.focus(); } };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, [open]);
  const cur = options.find(([k]) => k === value) ?? options[0];
  return (
    <span ref={ref} className="relative inline-block">
      <button ref={btn} type="button" aria-haspopup="listbox" aria-expanded={open} aria-label={`${label}: ${cur[1]}`} onClick={() => setOpen((o) => !o)}
        className="h6-chip inline-flex items-center gap-[4px] rounded-full border border-[var(--edge-2)] bg-white px-[10px] py-[2px] align-baseline font-semibold text-[color:var(--text)] aria-expanded:border-[var(--edge-3)] aria-expanded:bg-[var(--panel)]">
        {showLabel(cur[0], cur[1])}
        <svg viewBox="0 0 16 16" aria-hidden className={`size-[14px] transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6.5l4 4 4-4" /></svg>
      </button>
      <ul role="listbox" aria-label={label} className={`absolute left-0 top-[calc(100%+8px)] z-50 min-w-[260px] rounded-[12px] border border-[var(--edge-2)] bg-white p-[6px] shadow-[0_12px_32px_rgba(15,17,23,.12)] transition-all duration-150 ${open ? "visible translate-y-0 opacity-100" : "invisible pointer-events-none -translate-y-1 opacity-0"}`}>
        {options.map(([k, l]) => {
          const n = count(k), sel = k === value;
          return (
            <li key={k} role="option" aria-selected={sel} aria-disabled={n === 0 && !sel ? true : undefined}
              onClick={() => { if (n === 0 && !sel) return; onPick(k); setOpen(false); btn.current?.focus(); }}
              className={`flex cursor-pointer items-center justify-between gap-[16px] rounded-[8px] px-[10px] py-[7px] text-[14px] leading-[20px] ${sel ? "bg-[rgba(10,99,201,.08)] font-semibold text-[color:var(--link)]" : n === 0 ? "cursor-default opacity-40" : "text-[color:var(--text-2)] hover:bg-[rgba(15,17,23,.05)]"}`}>
              <span className="whitespace-nowrap">{l}</span><span className="font-[family-name:var(--font-mono)] text-[12px] opacity-70">{n}</span>
            </li>
          );
        })}
      </ul>
    </span>
  );
}

// The pattern list: Srishti's layout (v3 patterns.html: a title block, a sidebar to browse by who is
// involved and by category, a two-column grid of pattern cards) in v6's type, colour and states.
// Filters live in the URL (?dimension=L2&category=review-approve; ?setup= is read too, the home's;
// ?dimension=multi-agent is the hero tag's "Any agent team").
// On phones the two filter groups become swipe rows above the cards. The cards are two to a row at every
// size (19 Nov, the user's two-grid system); on phones they keep the category, the name and a three-line
// summary, and the whole card is the link.
type ListCopy = { eyebrow: string; title: string; intro: string; labels: string[]; dims: [string, string][]; cats: [string, string][] };

const mono = "font-[family-name:var(--font-mono)] text-[11px] font-medium uppercase leading-[16px] tracking-[0.96px] text-[color:var(--text-3)]";
// one filter option: a full-width row in the sidebar, a chip in the phone's swipe row
const opt = [
  "h6-side flex shrink-0 items-center justify-between gap-[12px] text-left text-[14px] leading-[20px] text-[color:var(--text-2)] transition-colors disabled:pointer-events-none disabled:opacity-40",
  "rounded-full border border-[var(--edge-2)] px-[14px] py-[7px] lg:w-full lg:rounded-[8px] lg:border-0 lg:px-[10px] lg:py-[8px]",
  "hover:bg-[rgba(15,17,23,.05)] aria-[checked=true]:border-[var(--link)] aria-[checked=true]:bg-[rgba(10,99,201,.08)] aria-[checked=true]:font-semibold aria-[checked=true]:text-[color:var(--link)] aria-[pressed=true]:border-[var(--link)] aria-[pressed=true]:bg-[rgba(10,99,201,.08)] aria-[pressed=true]:font-semibold aria-[pressed=true]:text-[color:var(--link)]",
].join(" ");
const count = "font-[family-name:var(--font-mono)] text-[12px] leading-[16px] opacity-70";
const group = "-mx-[24px] flex gap-[8px] overflow-x-auto px-[24px] pb-[2px] [scrollbar-width:none] lg:mx-0 lg:flex-col lg:gap-[2px] lg:overflow-visible lg:px-0";

export function PatternList({ items, list }: { items: ListItem[]; list: ListCopy }) {
  const [dim, setDim] = useState("all");
  const [cat, setCat] = useState("all");
  const dims = useMemo(() => involvements(list.dims), [list]);
  useEffect(() => {
    const s = new URLSearchParams(location.search);
    const d = s.get("dimension") ?? s.get("setup"), c = s.get("category");
    if (d && dims.some(([k]) => k === d)) setDim(d);
    if (c && list.cats.some(([k]) => k === c)) setCat(c);
  }, [dims, list]);
  useEffect(() => {
    const s = new URLSearchParams();
    if (dim !== "all") s.set("dimension", dim);
    if (cat !== "all") s.set("category", cat);
    const qs = s.toString();
    history.replaceState(null, "", location.pathname + (qs ? `?${qs}` : ""));
  }, [dim, cat]);

  const byDim = useMemo(() => items.filter((p) => inDim(p, dim)), [items, dim]);
  const shown = useMemo(() => byDim.filter((p) => cat === "all" || p.categoryId === cat), [byDim, cat]);
  const words = list.title.split(" "), last = words.pop();
  const [browse, who, categories] = list.labels;
  const dimCount = (k: string) => items.filter((p) => inDim(p, k)).length;
  const catCount = (k: string) => (k === "all" ? byDim.length : byDim.filter((p) => p.categoryId === k).length);
  const filtered = dim !== "all" || cat !== "all";
  const clear = () => { setDim("all"); setCat("all"); };

  return (
    <>
      <section className="border-b border-[var(--edge)] px-[24px] pb-[48px] pt-[128px] md:pb-[56px] md:pt-[148px]">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-[16px]">
          <Eyebrow>{list.eyebrow}</Eyebrow>
          <h1 className="h6-rise font-light text-[clamp(40px,5.4vw,72px)] leading-[1.04] tracking-[-0.03em] [text-wrap:balance]">
            {words.join(" ")} <Grad className="font-semibold">{last}</Grad>
          </h1>
          <p className="h6-rise h6-rise--2 max-w-[760px] text-[18px] leading-[28px] text-[color:var(--text-2)] max-md:text-[16px] max-md:leading-[26px]">{list.intro}</p>
        </div>
      </section>

      <section className="px-[24px] pb-[120px] pt-[40px] md:pt-[56px]">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-[28px] lg:flex-row lg:items-start lg:gap-[40px]">
          <aside aria-label="Pattern filters" className="flex min-w-0 flex-col gap-[24px] lg:sticky lg:top-[96px] lg:w-[256px] lg:shrink-0">
            <section className="flex flex-col gap-[10px]">
              <p className={`${mono} max-lg:hidden`}>{browse}</p>
              <p className="text-[15px] font-semibold leading-[20px]" id="h6-dim-label">{who}</p>
              <div role="radiogroup" aria-labelledby="h6-dim-label" className={group}>
                {dims.map(([k, l]) => (
                  <button key={k} type="button" role="radio" aria-checked={dim === k} className={opt} onClick={() => setDim(k)}>
                    <span className="whitespace-nowrap">{l}</span><span className={count}>{dimCount(k)}</span>
                  </button>
                ))}
              </div>
            </section>
            <nav aria-labelledby="h6-cat-label" className="flex flex-col gap-[10px] lg:border-t lg:border-[var(--edge)] lg:pt-[24px]">
              <p className="text-[15px] font-semibold leading-[20px]" id="h6-cat-label">{categories}</p>
              <div className={group}>
                {list.cats.map(([k, l]) => {
                  const n = catCount(k);
                  return (
                    <button key={k} type="button" aria-pressed={cat === k} disabled={n === 0 && cat !== k} className={opt} onClick={() => setCat(k)}>
                      <span className="whitespace-nowrap">{l}</span><span className={count}>{n}</span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col gap-[16px]">
            <div className="flex flex-wrap items-center justify-between gap-x-[16px] gap-y-[8px]">
              {/* a div, not a p: the switchers hold lists */}
              <div role="status" aria-live="polite" className="flex flex-wrap items-center gap-x-[6px] gap-y-[8px] text-[15px] leading-[28px] text-[color:var(--text-2)]">
                Showing <strong className="font-semibold text-[color:var(--text)]">{shown.length}</strong> {shown.length === 1 ? "pattern" : "patterns"} for
                <Switcher label={who} value={dim} options={dims} count={dimCount} onPick={setDim} />
                and
                <Switcher label={categories} value={cat} options={list.cats} count={catCount} onPick={setCat} />
              </div>
              {filtered && <button type="button" onClick={clear} className="text-[13px] font-semibold text-[color:var(--link)]"><span className="h6-link">Clear filters</span></button>}
            </div>
            {shown.length ? (
              <ul className="grid grid-cols-2 gap-[10px] md:gap-[16px]">
                {shown.map((p) => (
                  <li key={p.id} className="flex">
                    <a href={`/v6/interaction-patterns/${p.id}`} className="h6-card group flex w-full flex-col gap-[6px] rounded-[14px] border border-[var(--edge-2)] bg-white p-[14px] md:gap-[10px] md:rounded-[16px] md:p-[24px]">
                      <span className={`${mono} max-md:truncate`}>{p.category}</span>
                      <h2 className="break-words text-[15px] max-md:line-clamp-2 max-md:min-h-[40px] font-semibold leading-[20px] tracking-[-0.01em] md:text-[20px] md:leading-[28px]">{p.name}</h2>
                      <p className="text-[13px] leading-[19px] text-[color:var(--text-2)] max-md:line-clamp-3 md:text-[15px] md:leading-[24px]">{p.summary}</p>
                      <span className="mt-auto flex items-center justify-between gap-[12px] pt-[10px] max-md:hidden">
                        <span className="text-[13px] leading-[18px] text-[color:var(--text-3)]">{p.meta}</span>
                        <span className="flex shrink-0 items-center gap-[6px] text-[14px] font-semibold leading-[20px] text-[color:var(--link)]">
                          <span className="h6-link">{p.link || "Open pattern"}</span>
                          <svg viewBox="0 0 16 16" aria-hidden className="h6-arrow h6-arrow--up size-[14px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 11 11 5M6 5h5v5" /></svg>
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-start gap-[12px] rounded-[16px] border border-dashed border-[var(--edge-2)] p-[32px]">
                <p className="text-[16px] text-[color:var(--text-2)]">No patterns match these filters.</p>
                <button type="button" onClick={clear} className="h6-btn h6-btn--secondary rounded-full px-[16px] py-[6px] text-[14px] font-semibold">Clear filters</button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
