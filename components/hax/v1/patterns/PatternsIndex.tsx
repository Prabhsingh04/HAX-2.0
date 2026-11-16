"use client";
import "./patterns.css";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowRight, ChevronDown, Search, X } from "lucide-react";
import { MODE_FAMILY_DEFINITION, MODE_FAMILY_LABEL, MODE_FAMILY_ORDER, MODE_LABEL, MODE_ORDER, MODE_PLAIN, modes } from "@/lib/v2/modes";
import { CHANNEL_LABEL, CHANNEL_ORDER, LEVEL_LABEL, LEVEL_LONG, LEVEL_ORDER } from "@/lib/v2/levels";
import type { Channel, Level, Mode } from "@/lib/v2/types";
import { SetupArt } from "./SetupArt";
import { patternHref } from "./href";
import { GROUPS, filterQuery, type Filters, type GroupBy } from "./filters";

// /patterns: the 23 interaction patterns as rows, filtered and grouped in place. The filters
// live in the URL (?q, ?does, ?setup, ?surface, ?group), so any view can be linked. The page
// sends a slim copy of the catalog (IndexRow), so the full catalog never ships to the browser.

export type IndexRow = {
  id: string; name: string; summary: string; triggers: string[];
  mode: Mode; level: Level; setups: Level[]; channels: Channel[]; replies: string[];
};

const eyebrow = "font-semibold leading-[16px] text-[11px] text-[color:var(--text-secondary)] tracking-[1.2px] uppercase";
const COLS = "grid grid-cols-[minmax(0,1fr)_200px_264px_16px] gap-x-[32px]";
const FAMILY = new Map(modes.map((m) => [m.id, m.family]));
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const plain = (m: Mode) => cap(MODE_PLAIN[m]);
const many = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
type Facet = "does" | "setup" | "surface";
type Opt<T extends string> = { value: T; label: string; count?: number };

// A pill that opens the system's own list. The list shows how many patterns each choice
// leaves, given the other filters; the pill shows just the choice.
function Pill<T extends string>({ label, value, options, onChange, all, set }: {
  label: string; value: T | ""; options: Opt<T>[]; onChange: (v: T | "") => void; all?: string; set?: boolean;
}) {
  const shown = options.find((o) => o.value === value)?.label ?? all ?? "";
  return (
    <label className={`hx-pill${set ? " is-set" : ""}`}>
      <span aria-hidden="true">{shown}</span>
      <ChevronDown size={14} strokeWidth={2} aria-hidden="true" />
      <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value as T | "")}>
        {all !== undefined && <option value="">{all}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.count === undefined ? o.label : `${o.label} (${o.count})`}</option>
        ))}
      </select>
    </label>
  );
}

function Head({ kicker, title, line, n, art }: { kicker: string; title: string; line: string; n: number; art?: ReactNode }) {
  return (
    <div className={`${art ? "su-live " : ""}flex items-center gap-[24px] pb-[16px] pt-[44px]`}>
      {art && <div className="w-[112px] shrink-0">{art}</div>}
      <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
        <p className={eyebrow}>{kicker}</p>
        <h2 className="font-semibold leading-[28px] text-[20px]">{title}</h2>
        <p className="leading-[20px] text-[14px] text-[color:var(--text-secondary)]">{line}</p>
      </div>
      <p className="shrink-0 leading-[18px] text-[13px] text-[color:var(--text-secondary)]">{many(n, "pattern")}</p>
    </div>
  );
}

function Row({ r }: { r: IndexRow }) {
  return (
    <a href={patternHref(r.id)} className={`hx-side ${COLS} items-start border-t border-[var(--stroke-subtle)] px-[20px] py-[18px]`}>
      <div className="flex min-w-0 flex-col gap-[4px]">
        <h3 className="font-semibold leading-[24px] text-[16px]">{r.name}</h3>
        <p className="leading-[22px] text-[14px] text-[color:var(--text-secondary)]">{r.summary}</p>
      </div>
      <div className="flex flex-col gap-[4px]">
        <p className="font-medium leading-[24px] text-[14px]">{MODE_LABEL[r.mode]}</p>
        <p className="leading-[20px] text-[13px] text-[color:var(--text-secondary)]">{plain(r.mode)}</p>
      </div>
      <div className="flex flex-col gap-[4px]">
        <p className="leading-[24px] text-[14px]">{r.channels.map((c) => CHANNEL_LABEL[c]).join(" · ")}</p>
        <p className="leading-[20px] text-[13px] text-[color:var(--text-secondary)]">{r.replies.join(" · ")}</p>
      </div>
      <ArrowRight size={16} aria-hidden="true" className="hx-arrow mt-[4px] text-[color:var(--text-tertiary)]" />
    </a>
  );
}

const btnSm = "hx-btn hx-btn--outline hx-btn--sm bg-[var(--surface-page)] border border-[var(--stroke-default)] flex shrink-0 gap-[6px] h-[32px] items-center px-[12px] rounded-[var(--radius-pill)] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] font-semibold leading-[18px] text-[13px] tracking-[0.07px] whitespace-nowrap";

export function PatternsIndex({ rows, initial }: { rows: IndexRow[]; initial: Filters }) {
  const [f, setF] = useState<Filters>(initial);
  const set = (patch: Partial<Filters>) => setF((cur) => ({ ...cur, ...patch }));
  const bar = useRef<HTMLDivElement>(null);
  // keep the address in step without adding history entries (Next follows replaceState)
  useEffect(() => { window.history.replaceState(null, "", `${location.pathname}${filterQuery(f)}`); }, [f]);

  const hay = useMemo(() => new Map(rows.map((r) => [r.id, [r.name, r.summary, ...r.triggers].join(" ").toLowerCase()])), [rows]);
  const words = f.q.toLowerCase().split(/\s+/).filter(Boolean);
  const fits = (r: IndexRow, skip?: Facet) =>
    (skip === "does" || !f.does || r.mode === f.does) &&
    (skip === "setup" || !f.setup || r.setups.includes(f.setup)) &&
    (skip === "surface" || !f.surface || r.channels.includes(f.surface)) &&
    words.every((w) => hay.get(r.id)!.includes(w));
  const shown = rows.filter((r) => fits(r));
  const count = (skip: Facet, test: (r: IndexRow) => boolean) => rows.filter((r) => fits(r, skip) && test(r)).length;
  const filtered = !!(words.length || f.does || f.setup || f.surface);
  const clear = () => set({ q: "", does: "", setup: "", surface: "" });

  const groups: { key: string; head?: ReactNode; items: IndexRow[]; note?: ReactNode }[] = [];
  if (f.group === "who") {
    for (const l of LEVEL_ORDER) {
      const items = shown.filter((r) => r.level === l);
      if (!items.length && filtered) continue;
      // a setup no pattern is mainly for (Many agents only) says so, and offers the ones that apply there
      const applies = rows.filter((r) => r.setups.includes(l)).length;
      groups.push({
        key: l, items,
        head: <Head kicker="Main setup" title={LEVEL_LABEL[l]} line={cap(LEVEL_LONG[l])} n={items.length} art={<SetupArt level={l} />} />,
        note: items.length ? undefined : (
          <div className="flex items-center justify-between gap-[24px] border-y border-[var(--stroke-subtle)] px-[20px] py-[16px]">
            <p className="leading-[22px] text-[14px] text-[color:var(--text-secondary)]">
              No pattern is mainly for this setup. {many(applies, "pattern")} also apply here.
            </p>
            <button type="button" className={btnSm}
              onClick={() => { set({ setup: l }); bar.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>
              Show the {applies}
              <ArrowRight size={14} aria-hidden="true" className="hx-arrow" />
            </button>
          </div>
        ),
      });
    }
  } else if (f.group === "does") {
    for (const m of MODE_ORDER) {
      const items = shown.filter((r) => r.mode === m);
      if (items.length) groups.push({ key: m, items, head: <Head kicker={MODE_FAMILY_LABEL[FAMILY.get(m)!]} title={MODE_LABEL[m]} line={plain(m)} n={items.length} /> });
    }
  } else if (f.group === "family") {
    for (const fam of MODE_FAMILY_ORDER) {
      const items = shown.filter((r) => FAMILY.get(r.mode) === fam);
      if (items.length) groups.push({ key: fam, items, head: <Head kicker="Interaction family" title={MODE_FAMILY_LABEL[fam]} line={MODE_FAMILY_DEFINITION[fam]} n={items.length} /> });
    }
  } else groups.push({ key: "all", items: shown });

  return (
    <div className="flex flex-col px-[144px] pb-[112px] pt-[56px]">
      {/* gaps, not margins: tokens.css zeroes every <p> margin inside .hax-v1 */}
      <header className="flex flex-col items-start gap-[12px]">
        <div className="flex flex-col gap-[10px]">
          <p className={eyebrow}>Interaction patterns</p>
          <h1 className="font-semibold leading-[48px] text-[40px] tracking-[-0.5px]">{rows.length} interaction patterns</h1>
        </div>
        <p className="max-w-[640px] leading-[26px] text-[16px] text-[color:var(--text-secondary)]">
          How agents signal, explain, ask and agree, with people, and with each other.
        </p>
      </header>

      <div ref={bar} className="mt-[40px] flex scroll-mt-[118px] flex-wrap items-center gap-[8px]">
        <label className={`hx-find w-[300px]${f.q.trim() ? " is-set" : ""}`}>
          <Search size={16} aria-hidden="true" />
          <input type="search" value={f.q} onChange={(e) => set({ q: e.target.value })} placeholder="Search names and triggers" aria-label="Search names and triggers" />
          {f.q && <button type="button" onClick={() => set({ q: "" })} aria-label="Clear the search"><X size={14} aria-hidden="true" /></button>}
        </label>
        <Pill label="What it does" all="Anything it does" value={f.does} set={!!f.does} onChange={(v) => set({ does: v })}
          options={MODE_ORDER.map((m) => ({ value: m, label: plain(m), count: count("does", (r) => r.mode === m) }))} />
        <Pill label="Who is involved" all="Anyone involved" value={f.setup} set={!!f.setup} onChange={(v) => set({ setup: v })}
          options={LEVEL_ORDER.map((l) => ({ value: l, label: LEVEL_LABEL[l], count: count("setup", (r) => r.setups.includes(l)) }))} />
        <Pill label="Where it shows up" all="Any surface" value={f.surface} set={!!f.surface} onChange={(v) => set({ surface: v })}
          options={CHANNEL_ORDER.map((c) => ({ value: c, label: CHANNEL_LABEL[c], count: count("surface", (r) => r.channels.includes(c)) }))} />
        <span className="ml-auto flex">
          <Pill label="Group the list" value={f.group} onChange={(v) => set({ group: (v || "who") as GroupBy })}
            options={GROUPS.map(([value, label]) => ({ value, label }))} />
        </span>
      </div>
      <div className="mt-[16px] flex h-[20px] items-center gap-[16px]">
        <p aria-live="polite" className="leading-[20px] text-[13px] text-[color:var(--text-secondary)]">{shown.length} of {rows.length} patterns</p>
        {filtered && (
          <button type="button" onClick={clear} className="hx-link font-semibold leading-[20px] text-[13px] text-[color:var(--text-link)]">Clear filters</button>
        )}
      </div>

      <div className="mt-[20px]">
        {/* column labels stay under the site header while the list scrolls */}
        <div aria-hidden="true" className={`${COLS} sticky top-[94px] z-[2] bg-[var(--surface-page)] px-[20px] py-[10px]`}>
          <p className={eyebrow}>Pattern</p>
          <p className={eyebrow}>What it does</p>
          <p className={eyebrow}>Shows up in · Replies</p>
          <span />
        </div>
        {shown.length ? groups.map((g) => (
          <section key={g.key} aria-label={g.head ? undefined : "All patterns"}>
            {g.head}
            {g.note ?? (
              <div className="border-b border-[var(--stroke-subtle)]">
                {g.items.map((r) => <Row key={r.id} r={r} />)}
              </div>
            )}
          </section>
        )) : (
          <div className="flex flex-col items-center gap-[8px] border-y border-[var(--stroke-subtle)] py-[56px] text-center">
            <p className="font-semibold leading-[24px] text-[16px]">No patterns match</p>
            <p className="leading-[22px] text-[14px] text-[color:var(--text-secondary)]">Try fewer filters or a shorter search.</p>
            <button type="button" onClick={clear} className={`${btnSm} mt-[12px]`}>Clear filters</button>
          </div>
        )}
      </div>
    </div>
  );
}
