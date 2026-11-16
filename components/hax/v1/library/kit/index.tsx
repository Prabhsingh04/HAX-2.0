"use client";
import "./kit.css";
import "./ds-shadcn.css";
import "./ds-m3.css";
import "@/components/ui/shadcn.css";
import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Check, Code2, Copy, Eye, RotateCcw, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { BY_COMP } from "../catalog";
import { DETAILS } from "../details";
import { componentCode, signature } from "./code";
import { DSFonts, InertContext, useDS, type DS } from "./ds";
import { defaults, type Entry, type Opt, type Props, type State } from "./ui";
import { COMPOSERS } from "./composers";
import { ARTIFACTS } from "./artifacts";
import { COLLECTORS } from "./collectors";
import { CONTROLLERS } from "./controllers";
import { APPROVALS } from "./approvals";
import { WORKFLOWS } from "./workflows";
import { EXPLORERS } from "./explorers";
import { NOTIFIERS } from "./notifiers";

// The HAX v1 component kit: one real-size component per catalog id, with options.
export const KIT: Record<string, Entry> = { ...COMPOSERS, ...ARTIFACTS, ...COLLECTORS, ...CONTROLLERS, ...APPROVALS, ...WORKFLOWS, ...EXPLORERS, ...NOTIFIERS };

// Library card / Home: the component with its default options, at half size, drawn in the
// design system the page has chosen (shadcn/ui unless it says Material 3).
export function KitCard({ id, flush }: { id: string; flush?: boolean }) {
  const e = KIT[id];
  const ds = useDS();
  if (!e) return null;
  return (
    <InertContext.Provider value={true}>
      <div aria-hidden="true" inert data-ds={ds} className={`hk hk-stage hk-card ${flush ? "hk-card--flush" : ""}`}>
        <DSFonts ds={ds} />
        <div className="hk-scale" style={e.card ? { width: 289 / e.card, height: 181 / e.card, transform: `translate(-50%, -50%) scale(${e.card})` } : undefined}><e.C o={defaults(e.opts)} /></div>
      </div>
    </InertContext.Provider>
  );
}

// Component page: the component at 1× under a bar with Preview / Code, Copy for AI and
// Customize. Customize opens a panel on the right (in the page's side column) with the
// component's states and every option it takes; Code prints the code for what is on the stage.
export function KitPlayground({ id }: { id: string }) {
  const e = KIT[id];
  const ds = useDS();
  const comp = BY_COMP.get(id)?.c, d = DETAILS[id];
  const [o, setO] = useState<Props>(() => (e ? defaults(e.opts) : {}));
  const [view, setView] = useState<"preview" | "code">("preview");
  const [panel, setPanel] = useState(false);
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  const [copied, setCopied] = useState<"" | "ai" | "code">("");
  // ?o.effort=false&o.surface=Image opens the page on that version, so a version can be linked
  useEffect(() => {
    if (!e) return;
    const q = new URLSearchParams(location.search), next: Props = {};
    e.opts.forEach((x) => { const v = q.get(`o.${x.key}`); if (v !== null) next[x.key] = x.kind === "toggle" ? v === "true" : v; });
    if (Object.keys(next).length) setO((p) => ({ ...p, ...next }));
  }, [e]);
  // keep the address in step with the options, so the link is always this version
  useEffect(() => {
    if (!e) return;
    const q = new URLSearchParams(location.search), def = defaults(e.opts);
    e.opts.forEach((x) => (o[x.key] === def[x.key] ? q.delete(`o.${x.key}`) : q.set(`o.${x.key}`, String(o[x.key]))));
    history.replaceState(history.state, "", `${location.pathname}?${q.toString().replace(/%2C/g, ",")}${location.hash}`);
  }, [e, o]);
  useEffect(() => { setSlot(document.getElementById("hk-custom-slot")); }, []);
  useEffect(() => {
    if (!panel) return;
    const k = (ev: KeyboardEvent) => ev.key === "Escape" && setPanel(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [panel]);
  const code = useMemo(() => (e && view === "code" ? componentCode(e.C, o, ds, comp?.name ?? id) : ""), [e, o, ds, view, comp, id]);
  const plan = useMemo(() => (e && panel ? planFor(e, o, ds, d?.states ?? []) : null), [e, o, ds, panel, d]);
  if (!e) return null;
  const flash = (k: typeof copied) => { setCopied(k); setTimeout(() => setCopied(""), 1600); };
  const copyAI = () => { navigator.clipboard?.writeText(aiBrief(id, e, o, ds, planFor(e, o, ds, d?.states ?? []))); flash("ai"); };
  const dsName = ds === "m3" ? "Material 3" : "shadcn/ui";
  return (
    <div className="hk flex flex-col gap-[12px] w-full">
      <div className="hk-frame">
        <div className="hk-bar" role="toolbar" aria-label={`${comp?.name ?? "Component"} tools`}>
          <div className="hk-seg" role="tablist" aria-label="View">
            {(["preview", "code"] as const).map((v) => (
              <button key={v} type="button" role="tab" aria-selected={view === v} onClick={() => setView(v)} className={`hx-tab hk-seg-btn ${view === v ? "font-semibold" : ""}`}>
                {v === "preview" ? <Eye size={14} strokeWidth={2} /> : <Code2 size={14} strokeWidth={2} />}{v === "preview" ? "Preview" : "Code"}
              </button>
            ))}
          </div>
          <span className="hk-bar-ds">{dsName}</span>
          <div className="ml-auto flex items-center gap-[8px]">
            <button type="button" onClick={copyAI} className="hx-btn hx-btn--outline hk-bar-btn" aria-live="polite">
              {copied === "ai" ? <Check size={14} strokeWidth={2.4} /> : <Sparkles size={14} strokeWidth={2} />}{copied === "ai" ? "Copied" : "Copy for AI"}
            </button>
            <button type="button" onClick={() => setPanel((p) => !p)} aria-expanded={panel} aria-controls="hk-customize" className={`hx-btn hx-btn--outline hk-bar-btn ${panel ? "hk-bar-btn--on" : ""}`}>
              <SlidersHorizontal size={14} strokeWidth={2} />Customize
            </button>
          </div>
        </div>
        {view === "preview" ? (
          <div className="hk-stage hk-page" data-ds={ds}><DSFonts ds={ds} /><Fit><e.C o={o} /></Fit></div>
        ) : (
          <div className="hk-codeview">
            <div className="hk-codehead">
              <span>{`${id}.tsx`}<span className="hk-codehead-ds"> · React · {dsName}</span></span>
              <button type="button" className="hx-btn hx-btn--outline hk-bar-btn" onClick={() => { navigator.clipboard?.writeText(code); flash("code"); }}>
                {copied === "code" ? <Check size={14} strokeWidth={2.4} /> : <Copy size={14} strokeWidth={2} />}{copied === "code" ? "Copied" : "Copy code"}
              </button>
            </div>
            <pre className="hk-code-pre"><code>{highlight(code)}</code></pre>
          </div>
        )}
      </div>
      <p className="hk-s">Studied: {e.refs.join(" · ")}</p>
      {panel && slot && plan && createPortal(
        <Customize e={e} o={o} setO={setO} plan={plan} name={comp?.name ?? id} dsName={dsName} onClose={() => setPanel(false)} />,
        slot,
      )}
    </div>
  );
}

// Scales a component down to the stage's width when it is wider (a narrow window, or the
// Customize panel open); at full size it changes nothing.
function Fit({ children }: { children: ReactNode }) {
  const outer = useRef<HTMLDivElement>(null), inner = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<{ s: number; h: number }>({ s: 1, h: 0 });
  useLayoutEffect(() => {
    const a = outer.current, b = inner.current;
    if (!a || !b) return;
    const measure = () => {
      const s = Math.min(1, a.clientWidth / Math.max(1, b.offsetWidth));
      setFit((f) => (Math.abs(f.s - s) < 0.005 && Math.abs(f.h - b.offsetHeight * s) < 1 ? f : { s, h: b.offsetHeight * s }));
    };
    const ro = new ResizeObserver(measure);
    ro.observe(a); ro.observe(b); measure();
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={outer} className="hk-fit" style={fit.s < 1 ? { height: fit.h } : undefined}>
      <div ref={inner} className="hk-fit-in" style={fit.s < 1 ? { transform: `scale(${fit.s})` } : undefined}>{children}</div>
    </div>
  );
}

/* ── Customize: the panel on the right ──────────────────────────────
   Top to bottom: the component's format (its main variant: surface, layout, kind…), then the
   states that exist in that format, then the other properties. Every list only offers what
   changes the component right now: each state and option value is drawn off-stage and
   compared, so a state or value that draws the same as another (Editing in a card layout, a
   menu for a switcher that is off) is not offered. */
const FORMAT_KEYS = ["surface", "format", "layout", "kind", "type", "style", "view", "questions", "on", "to"];
const EXTRA_LINE: Record<string, string> = { All: "Every state side by side." };
type Row = { name: string; set: Props; line?: string };
type Plan = { format?: Opt; formatValues: (string | boolean)[]; states: Row[]; props: { opt: Opt; values: (string | boolean)[] }[] };
// The keys every state sets belong to States; the rest are the component's properties.
const stateKeys = (states: State[]) => (states.length ? Object.keys(states[0].set).filter((k) => states.every((x) => k in x.set)) : []);
const isActive = (set: Props, o: Props) => Object.entries(set).every(([k, v]) => String(o[k]) === String(v));

export function planFor(e: Entry, o: Props, ds: DS, lines: [string, string][]): Plan {
  const memo = new Map<string, string>();
  const sig = (p: Props) => { const k = JSON.stringify(p); if (!memo.has(k)) memo.set(k, signature(e.C, p, ds)); return memo.get(k)!; };
  // the values of an option that draw something different, keeping the current one in its group
  const distinct = (x: Opt) => {
    const vals: (string | boolean)[] = x.kind === "toggle" ? [true, false] : x.values;
    const groups = new Map<string, string | boolean>();
    for (const v of vals) { const k = sig({ ...o, [x.key]: v }); if (!groups.has(k) || String(v) === String(o[x.key])) groups.set(k, v); }
    return [...groups.values()];
  };
  const states = e.states ?? [];
  const owned = stateKeys(states);
  const format = e.opts.find((x) => x.kind === "select" && !owned.includes(x.key) && FORMAT_KEYS.includes(x.key));
  // listed states, plus any value of the state option no state names (a default overview like "All")
  const rows: Row[] = states.map((s) => ({ name: s.name, set: s.set, line: lines.find(([n]) => n === s.name)?.[1] }));
  const sOpt = owned.length === 1 ? e.opts.find((x) => x.key === owned[0]) : undefined;
  if (sOpt?.kind === "select") {
    const extra = sOpt.values.filter((v) => !states.some((s) => String(s.set[sOpt.key]) === v));
    rows.unshift(...extra.map((v) => ({ name: v, set: { [sOpt.key]: v } as Props, line: EXTRA_LINE[v] })));
  }
  const seen = new Map<string, number>(), shown: Row[] = [];
  for (const r of rows) {
    const k = sig({ ...o, ...r.set });
    if (!seen.has(k)) { seen.set(k, shown.length); shown.push(r); } else if (isActive(r.set, o)) shown[seen.get(k)!] = r;
  }
  return {
    format, formatValues: format ? distinct(format) : [],
    states: shown.length > 1 ? shown : [],
    props: e.opts.filter((x) => x !== format && !owned.includes(x.key)).map((x) => ({ opt: x, values: distinct(x) })).filter((p) => p.values.length > 1),
  };
}

function OptControl({ x, values, o, set }: { x: Opt; values: (string | boolean)[]; o: Props; set: (k: string, v: string | boolean) => void }) {
  if (x.kind === "toggle") {
    return (
      <label className="hk-prop hk-prop--row">
        <span className="hk-prop-label">{x.label}</span>
        <button type="button" role="switch" aria-checked={!!o[x.key]} aria-label={x.label} onClick={() => set(x.key, !o[x.key])} className="hk-sw"><span /></button>
      </label>
    );
  }
  const vals = values.map(String);
  return (
    <div className="hk-prop">
      <span className={x.label ? "hk-prop-label" : "sr-only"} id={`hk-p-${x.key}`}>{x.label || x.key}</span>
      {vals.length <= 3 && vals.join("").length <= 26 ? (
        <div role="radiogroup" aria-labelledby={`hk-p-${x.key}`} className="hk-seg hk-seg--full">
          {vals.map((v) => (
            <button key={v} type="button" role="radio" aria-checked={String(o[x.key]) === v} aria-selected={String(o[x.key]) === v} onClick={() => set(x.key, v)} className={`hx-tab hk-seg-btn ${String(o[x.key]) === v ? "font-semibold" : ""}`}>{v}</button>
          ))}
        </div>
      ) : (
        <select aria-labelledby={`hk-p-${x.key}`} value={String(o[x.key])} onChange={(ev) => set(x.key, ev.target.value)} className="hk-select">
          {vals.map((v) => <option key={v}>{v}</option>)}
        </select>
      )}
    </div>
  );
}

function Customize({ e, o, setO, plan, name, dsName, onClose }: {
  e: Entry; o: Props; setO: (f: (p: Props) => Props) => void; plan: Plan; name: string; dsName: string; onClose: () => void;
}) {
  const set = (k: string, v: string | boolean) => setO((p) => ({ ...p, [k]: v }));
  return (
    <section id="hk-customize" className="hk-custom hx-swap" aria-label={`Customize ${name}`}>
      <header className="hk-custom-head">
        <div className="flex flex-col gap-[2px]">
          <h2 className="hk-custom-title">Customize</h2>
          <p className="hk-custom-sub">{name} · {dsName}</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close Customize" className="hk-custom-x"><X size={16} strokeWidth={2} /></button>
      </header>
      {plan.format && plan.formatValues.length > 1 && (
        <div className="hk-custom-group">
          <p className="hk-custom-eyebrow">{plan.format.label}</p>
          <OptControl x={{ ...plan.format, label: "" }} values={plan.formatValues} o={o} set={set} />
          {!plan.states.length && !plan.props.length && <p className="hk-custom-note">{String(o[plan.format.key])} has no other states or options.</p>}
        </div>
      )}
      {plan.states.length > 0 && (
        <div className="hk-custom-group">
          <p className="hk-custom-eyebrow">States</p>
          <div role="radiogroup" aria-label="States" className="flex flex-col gap-[6px]">
            {plan.states.map((s) => {
              const on = isActive(s.set, o);
              return (
                <button key={s.name} type="button" role="radio" aria-checked={on} onClick={() => setO((p) => ({ ...p, ...s.set }))} className="hk-cstate">
                  <span className="hk-cstate-dot" aria-hidden="true" />
                  <span className="flex flex-col gap-[2px] text-left">
                    <span className="hk-cstate-name">{s.name}</span>
                    {s.line && <span className="hk-cstate-line">{s.line}</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      {plan.props.length > 0 && (
        <div className="hk-custom-group">
          <p className="hk-custom-eyebrow">Properties</p>
          <div className="flex flex-col">
            {plan.props.map(({ opt, values }) => <OptControl key={opt.key} x={opt} values={values} o={o} set={set} />)}
          </div>
        </div>
      )}
      <footer className="hk-custom-foot">
        <button type="button" onClick={() => setO(() => defaults(e.opts))} className="hx-btn hx-btn--outline hk-bar-btn"><RotateCcw size={14} strokeWidth={2} />Reset</button>
      </footer>
    </section>
  );
}

/* ── Copy for AI: a brief an AI coding tool can build from ──────── */
function aiBrief(id: string, e: Entry, o: Props, ds: DS, plan: Plan) {
  const c = BY_COMP.get(id)?.c, f = BY_COMP.get(id)?.f, d = DETAILS[id];
  const name = c?.name ?? id, sys = ds === "m3" ? "Material 3 (@material/web web components, Google's Material 3 for the web)" : "shadcn/ui (Radix + Tailwind CSS)";
  const active = plan.states.find((s) => isActive(s.set, o)) ?? (e.states ?? []).find((s) => isActive(s.set, o));
  const opt = (x: Opt, vals: (string | boolean)[]) => x.kind === "toggle" ? `- ${x.label}: ${o[x.key] ? "on" : "off"}` : `- ${x.label}: ${o[x.key]} (choices: ${vals.join(", ")})`;
  const out = [
    `# ${name}: a HAX component in ${ds === "m3" ? "Material 3" : "shadcn/ui"}`,
    "",
    `${c?.line ?? ""} It is part of HAX, Outshift's library of components for products where people and AI agents work together${f ? ` (family: ${f.name}, ${f.job.toLowerCase()})` : ""}.`,
    "",
    `Build it with ${sys}. Use the design system's own components for every control (buttons, chips, checkboxes, switches, fields, menus), so hover, pressed, focus and disabled states come from the system. Use its theme tokens, not new colours. The code below is the version on the page right now; match it.`,
  ];
  if (d) {
    out.push("", "## How it works", `1. When it shows up: ${d.how[0]}`, `2. What people see: ${d.how[1]}`, `3. What happens next: ${d.how[2]}`);
    out.push("", "## States", ...d.states.map(([n, l]) => `- ${n}${active?.name === n ? " (shown)" : ""}: ${l}`));
  }
  const props = [...(plan.format ? [{ opt: plan.format, values: plan.formatValues }] : []), ...plan.props];
  if (props.length) out.push("", "## Options in this version", ...props.map((p) => opt(p.opt, p.values)));
  if (d) {
    out.push("", "## Data it takes", "```json", JSON.stringify(d.needs, null, 2), "```");
    out.push("", "## Do", ...d.dos.map((x) => `- ${x}`), "", "## Don't", ...d.donts.map((x) => `- ${x}`));
  }
  out.push("", `## Patterns studied`, e.refs.join(", "));
  out.push("", "## Code", "```tsx", componentCode(e.C, o, ds, name).trimEnd(), "```");
  if (typeof location !== "undefined") out.push("", `Source: ${location.href}`);
  return out.join("\n");
}

/* ── Code highlighting (tags, props, strings, comments, keywords) ── */
const TOKEN = /(\/\/[^\n]*)|("(?:[^"\\\n]|\\.)*")|(<\/?)([A-Za-z][\w.-]*)|\b(import|from|export|function|return)\b|([A-Za-z][\w-]*)(?==)/g;
function highlight(src: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0, k = 0;
  for (const m of src.matchAll(TOKEN)) {
    const i = m.index ?? 0;
    if (i > last) out.push(src.slice(last, i));
    if (m[1]) out.push(<span key={k++} className="hk-tk-c">{m[1]}</span>);
    else if (m[2]) out.push(<span key={k++} className="hk-tk-s">{m[2]}</span>);
    else if (m[3]) out.push(m[3], <span key={k++} className="hk-tk-t">{m[4]}</span>);
    else if (m[5]) out.push(<span key={k++} className="hk-tk-k">{m[5]}</span>);
    else if (m[6]) out.push(<span key={k++} className="hk-tk-a">{m[6]}</span>);
    last = i + m[0].length;
  }
  out.push(src.slice(last));
  return out;
}
