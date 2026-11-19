import { Fragment, isValidElement, type ComponentType, type CSSProperties, type ReactElement, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import type { DS } from "@/components/hax/v6/vendor/components/hax/v1/library/kit/ds-shared";
import type { CodeSpec } from "@/components/hax/v6/vendor/components/hax/v1/library/kit/parts";
import type { Props } from "@/components/hax/v6/vendor/components/hax/v1/library/kit/ui";

/* The Code view: the code for what is on the stage, in the chosen design system.
   It walks the component's element tree (kit components are pure functions of their
   options) and prints it as JSX:
   · each part (./parts) prints as the real component: <Button variant="outline">,
     <Checkbox>, <md-filled-button>, <md-filter-chip label="…">…
   · icons print as Lucide icons (shadcn) or md-icon with the Material Symbol;
   · the kit's role classes (hk-row, hk-panel, hk-s…) print as the Tailwind classes they
     stand for in that system, and the kit's colour roles as the system's own tokens
     (shadcn's --primary, --border…; Material's --md-sys-color-*).
   So the printed code uses only the design system and Tailwind, and matches the preview. */

type Imports = { named: Map<string, Set<string>>; side: Set<string> };
type El = { tag: string; attrs: [string, unknown][]; children: Node[] };
type Node = El | string;
type Coded = ((p: unknown) => ReactNode) & { code?: (p: unknown, ds: DS) => CodeSpec; icon?: { lucide: string; symbol: string } };

// the kit's role classes, in each system's Tailwind
const SHADCN: Record<string, string> = {
  "hk-row": "flex min-w-0 items-center gap-2", "hk-col": "flex min-w-0 flex-col", "hk-grow": "min-w-0 flex-1", "hk-trunc": "min-w-0 truncate",
  "hk-h": "text-base font-semibold", "hk-t": "text-sm font-medium", "hk-b": "text-sm", "hk-s": "text-muted-foreground text-xs", "hk-xs": "text-muted-foreground text-xs font-medium",
  "hk-mono": "font-mono text-xs", "hk-mute": "text-muted-foreground", "hk-faint": "text-muted-foreground", "hk-blue": "text-primary", "hk-agentc": "text-orange-600",
  "hk-okc": "text-emerald-700", "hk-warnc": "text-amber-700", "hk-badc": "text-destructive", "hk-link": "font-medium underline underline-offset-4",
  "hk-panel": "bg-card text-card-foreground rounded-xl border shadow-sm", "hk-panel--bar": "bg-background shadow-xs", "hk-pop": "bg-popover text-popover-foreground rounded-md border p-1 shadow-md",
  "hk-well": "bg-muted/50 rounded-lg border", "hk-rule": "bg-border h-px self-stretch", "hk-code": "bg-muted/50 rounded-lg border px-3.5 py-3 font-mono text-xs whitespace-pre",
  "hk-code--plain": "border-0 bg-transparent p-0", "hk-file": "bg-muted/50 inline-flex h-12 items-center gap-2 rounded-lg border pr-3 pl-1.5", "hk-thumb": "size-12 shrink-0 overflow-hidden rounded-md border",
  "hk-ag": "bg-primary text-primary-foreground relative grid size-7 shrink-0 place-items-center rounded-full", "hk-ag--sm": "size-[22px]", "hk-ag--lg": "size-10",
  "hk-me": "bg-muted grid size-7 shrink-0 place-items-center rounded-full text-xs font-medium", "hk-app": "bg-muted grid size-8 shrink-0 place-items-center rounded-sm border",
  "hk-bubble": "bg-primary text-primary-foreground max-w-[78%] self-end rounded-lg px-3 py-2 text-sm", "hk-step": "grid size-5 shrink-0 place-items-center rounded-full border text-xs font-medium",
  "hk-step--done": "border-primary bg-primary text-primary-foreground", "hk-step--now": "border-primary border-2", "hk-step--num": "text-muted-foreground",
  "hk-cite": "bg-secondary text-secondary-foreground ml-0.5 inline-grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[11px] font-medium",
  "hk-ai": "inline-flex h-[22px] items-center gap-1 rounded-md border px-2 text-xs font-medium", "hk-hl": "bg-primary/10 rounded-sm",
  "hk-dl": "flex h-6 items-center gap-2.5 px-3 font-mono text-xs", "hk-dl--ctx": "text-muted-foreground", "hk-dl--del": "bg-destructive/10", "hk-dl--add": "bg-emerald-50",
  "hk-caret": "bg-primary inline-block h-[17px] w-0.5 animate-pulse align-[-3px]", "hk-typing": "inline-flex gap-[3px]", "hk-spin": "animate-spin", "hk-shimmer": "text-muted-foreground animate-pulse",
  "hk-wave": "flex items-center gap-[3px]", "hk-hover-show": "opacity-0 transition-opacity group-hover:opacity-100", "hk-opt--on": "border-primary bg-primary/5",
  "hk-check": "grid size-4 place-items-center rounded-[4px] border", "hk-check--on": "border-primary bg-primary text-primary-foreground", "hk-tag": "", "hk-kbd": "",
};
const M3: Record<string, string> = {
  "hk-row": "flex min-w-0 items-center gap-2", "hk-col": "flex min-w-0 flex-col", "hk-grow": "min-w-0 flex-1", "hk-trunc": "min-w-0 truncate",
  "hk-h": "text-base font-medium tracking-[.15px]", "hk-t": "text-sm font-medium tracking-[.1px]", "hk-b": "text-sm tracking-[.25px]",
  "hk-s": "text-xs tracking-[.4px] text-[var(--md-sys-color-on-surface-variant)]", "hk-xs": "text-xs font-medium tracking-[.5px] text-[var(--md-sys-color-on-surface-variant)]",
  "hk-mono": "font-mono text-xs", "hk-mute": "text-[var(--md-sys-color-on-surface-variant)]", "hk-faint": "text-[var(--md-sys-color-on-surface-variant)]", "hk-blue": "text-[var(--md-sys-color-primary)]",
  "hk-agentc": "text-[#5259fd]", "hk-okc": "text-[#146c2e]", "hk-warnc": "text-[#8e4e00]", "hk-badc": "text-[var(--md-sys-color-error)]", "hk-link": "font-medium text-[var(--md-sys-color-primary)] hover:underline",
  "hk-panel": "rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)]", "hk-panel--bar": "rounded-[28px] border-transparent bg-[var(--md-sys-color-surface-container-high)]",
  "hk-pop": "rounded bg-[var(--md-sys-color-surface-container)] py-2 shadow-md", "hk-well": "rounded-xl bg-[var(--md-sys-color-surface-container)]",
  "hk-rule": "h-px self-stretch bg-[var(--md-sys-color-outline-variant)]", "hk-code": "rounded-lg bg-[var(--md-sys-color-surface-container-highest)] px-4 py-3 font-mono text-xs whitespace-pre", "hk-code--plain": "bg-transparent p-0",
  "hk-file": "inline-flex h-14 items-center gap-3 rounded-xl bg-[var(--md-sys-color-surface-container-highest)] pr-4 pl-2", "hk-thumb": "size-14 shrink-0 overflow-hidden rounded-xl",
  "hk-ag": "relative grid size-7 shrink-0 place-items-center rounded-full border-2 border-[#3186ff] bg-[var(--md-sys-color-surface-container-low)] text-[#1157ce]", "hk-ag--sm": "size-6", "hk-ag--lg": "size-10",
  "hk-me": "grid size-7 shrink-0 place-items-center rounded-full bg-[var(--md-sys-color-primary-container)] text-xs font-medium text-[var(--md-sys-color-on-primary-container)]",
  "hk-app": "grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]",
  "hk-bubble": "max-w-[78%] self-end rounded-[24px_4px_24px_24px] bg-[var(--md-sys-color-surface-container-high)] px-4 py-3 text-sm",
  "hk-step": "grid size-5 shrink-0 place-items-center rounded-full border border-[var(--md-sys-color-outline)] text-[11px] font-medium",
  "hk-step--done": "border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]", "hk-step--now": "border-2 border-[var(--md-sys-color-primary)]", "hk-step--num": "text-[var(--md-sys-color-on-surface-variant)]",
  "hk-cite": "ml-0.5 inline-grid h-5 min-w-5 place-items-center rounded-full bg-[var(--md-sys-color-secondary-container)] px-1.5 text-[11px] font-medium",
  "hk-ai": "inline-flex h-6 items-center gap-1 rounded-lg border border-[var(--md-sys-color-outline-variant)] pr-2.5 pl-1.5 text-xs font-medium", "hk-hl": "rounded-sm bg-[var(--md-sys-color-primary)]/15",
  "hk-dl": "flex h-6 items-center gap-2.5 px-3 font-mono text-xs", "hk-dl--ctx": "text-[var(--md-sys-color-on-surface-variant)]", "hk-dl--del": "bg-[var(--md-sys-color-error-container)]", "hk-dl--add": "bg-[#c4eed0]",
  "hk-caret": "inline-block h-[17px] w-0.5 animate-pulse bg-[#3186ff] align-[-3px]", "hk-typing": "inline-flex gap-[3px] text-[#3186ff]", "hk-spin": "", "hk-shimmer": "animate-pulse",
  "hk-wave": "flex items-center gap-[3px]", "hk-hover-show": "opacity-0 transition-opacity group-hover:opacity-100", "hk-opt--on": "bg-[var(--md-sys-color-secondary-container)]",
  "hk-check": "grid size-[18px] place-items-center rounded-sm border-2 border-[var(--md-sys-color-on-surface-variant)]", "hk-check--on": "border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]",
  "hk-tag": "inline-flex h-6 items-center gap-1 rounded-lg bg-[var(--md-sys-color-secondary-container)] px-2 text-xs font-medium text-[var(--md-sys-color-on-secondary-container)]",
  "hk-tag--blue": "bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]", "hk-tag--ok": "bg-[#c4eed0] text-[#072711]", "hk-tag--warn": "bg-[#ffdcc1] text-[#2e1500]",
  "hk-tag--bad": "bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]",
  "hk-kbd": "inline-grid h-5 min-w-5 place-items-center rounded bg-[var(--md-sys-color-surface-container-highest)] px-1.5 text-[11px] font-medium",
};
// the kit's colour roles → each system's own tokens
const VARS: Record<DS, Record<string, string>> = {
  shadcn: {
    "k-panel": "card", "k-soft": "muted", "k-edge": "border", "k-edge-2": "input", "k-blue": "primary", "k-blue-soft": "accent", "k-sel": "accent", "k-chart": "chart-1",
    "k-track": "muted", "k-agent": "chart-1", "k-on-agent": "foreground", "k-on-blue": "primary-foreground", "k-ok": "success", "k-ok-bg": "success-soft", "k-warn": "warning",
    "k-warn-bg": "warning-soft", "k-bad": "destructive", "k-bad-bg": "destructive", "k-bad-solid": "destructive", "k-tag-ink": "secondary-foreground", "k-pop": "shadow-md",
    "text-primary": "foreground", "text-secondary": "muted-foreground", "text-tertiary": "muted-foreground", "text-link": "foreground", "surface-page": "background",
    "surface-raised": "card", "surface-tint": "muted", "surface-tint-hover": "accent", "surface-message-person": "primary", "hk-r-md": "radius", "hk-r-lg": "radius", "hk-r-xl": "radius",
  },
  m3: {
    "k-panel": "md-sys-color-surface", "k-soft": "md-sys-color-surface-container", "k-edge": "md-sys-color-outline-variant", "k-edge-2": "md-sys-color-outline",
    "k-blue": "md-sys-color-primary", "k-blue-soft": "md-sys-color-secondary-container", "k-sel": "md-sys-color-secondary-container", "k-chart": "md-sys-color-primary",
    "k-track": "md-sys-color-surface-container-highest", "k-agent": "md-sys-color-tertiary", "k-on-agent": "md-sys-color-on-tertiary", "k-on-blue": "md-sys-color-on-primary",
    "k-ok": "md-sys-color-tertiary", "k-ok-bg": "md-sys-color-tertiary-container", "k-warn": "md-sys-color-error", "k-warn-bg": "md-sys-color-error-container",
    "k-bad": "md-sys-color-error", "k-bad-bg": "md-sys-color-error-container", "k-bad-solid": "md-sys-color-error", "k-tag-ink": "md-sys-color-on-secondary-container",
    "text-primary": "md-sys-color-on-surface", "text-secondary": "md-sys-color-on-surface-variant", "text-tertiary": "md-sys-color-on-surface-variant", "text-link": "md-sys-color-primary",
    "surface-page": "md-sys-color-surface", "surface-raised": "md-sys-color-surface-container-low", "surface-tint": "md-sys-color-surface-container",
    "surface-tint-hover": "md-sys-color-surface-container-highest", "surface-message-person": "md-sys-color-primary", "hk-r-md": "md-sys-shape-corner-small", "hk-r-lg": "md-sys-shape-corner-medium", "hk-r-xl": "md-sys-shape-corner-large",
    "nx-blue": "md-sys-color-primary", "nx-indigo": "md-sys-color-tertiary",
  },
};
// classes that only exist to size Material components (printed as tokens instead) or to run the page
const DROP = /^(hk-md[a-z-]*|hk-sym|hk-press|hk-stage|hk-scale|hk-card|hk-page)$/;

const mapVars = (s: string, ds: DS) => s.replace(/var\(--([a-z0-9-]+)\)/g, (m, v: string) => (VARS[ds][v] ? `var(--${VARS[ds][v]})` : m));
function mapClass(cls: string, ds: DS) {
  const table = ds === "m3" ? M3 : SHADCN;
  const out: string[] = [];
  for (const c of cls.split(/\s+/).filter(Boolean)) {
    if (DROP.test(c)) continue;
    if (c in table) { if (table[c]) out.push(table[c]); continue; }
    if (/^hk-/.test(c)) continue;
    out.push(mapVars(c, ds));
  }
  // printed code has no kit CSS to beat, so drop the ! and let the later class win
  return twMerge(out.join(" ").split(" ").filter(Boolean).map((c) => c.replace(/^!/, "")).join(" "));
}

function add(imp: Imports, from: string, names?: string[]) {
  if (!names) { imp.side.add(from); return; }
  const set = imp.named.get(from) ?? new Set<string>();
  names.forEach((n) => set.add(n));
  imp.named.set(from, set);
}

function attrsOf(props: Record<string, unknown>, ds: DS, skip: string[] = []): [string, unknown][] {
  const out: [string, unknown][] = [];
  for (const [k, v] of Object.entries(props)) {
    if (k === "children" || skip.includes(k) || v === undefined || v === null || v === false || typeof v === "function") continue;
    if (k === "className") { const c = mapClass(String(v), ds); if (c) out.push([k, c]); continue; }
    if (k === "style") {
      const st = Object.fromEntries(Object.entries(v as CSSProperties).filter(([, x]) => x !== undefined && x !== null && x !== "").map(([a, b]) => [a, typeof b === "string" ? mapVars(b, ds) : b]));
      if (Object.keys(st).length) out.push([k, st]);
      continue;
    }
    out.push([k, v]);
  }
  return out;
}

function walk(n: ReactNode, ds: DS, imp: Imports): Node[] {
  if (n === null || n === undefined || typeof n === "boolean") return [];
  if (typeof n === "string" || typeof n === "number") return [String(n)];
  if (Array.isArray(n)) return n.flatMap((x) => walk(x, ds, imp));
  if (!isValidElement(n)) return [];
  const el = n as ReactElement<Record<string, unknown>>;
  const props = el.props;
  if (el.type === Fragment) return walk(props.children as ReactNode, ds, imp);
  if (typeof el.type === "string") {
    if (el.type === "code-el") return [{ tag: String(props.tag), attrs: attrsOf(props, ds, ["tag"]), children: walk(props.children as ReactNode, ds, imp) }];
    return [{ tag: el.type, attrs: attrsOf(props, ds), children: walk(props.children as ReactNode, ds, imp) }];
  }
  const T = el.type as Coded;
  if (typeof T !== "function") return [];
  if (T.code) {
    const spec = T.code(props, ds);
    spec.imports?.forEach((i) => add(imp, i.from, i.names));
    return [{ tag: spec.tag, attrs: attrsOf(spec.attrs ?? {}, ds), children: walk(spec.children, ds, imp) }];
  }
  if (T.icon) {
    const { slot, className, size, strokeWidth, fill } = props as { slot?: string; className?: string; size?: number; strokeWidth?: number; fill?: string };
    if (ds === "m3") {
      const spinner = T.icon.lucide === "LoaderCircle";
      add(imp, spinner ? "@material/web/progress/circular-progress.js" : "@material/web/icon/icon.js");
      if (spinner) return [{ tag: "md-circular-progress", attrs: [["indeterminate", true], ...(slot ? [["slot", slot] as [string, unknown]] : []), ["style", { "--md-circular-progress-size": `${Number(size ?? 24) + 4}px` }]], children: [] }];
      const cls = className ? mapClass(className, ds) : "";
      return [{ tag: "md-icon", attrs: [...(slot ? [["slot", slot] as [string, unknown]] : []), ...(cls ? [["className", cls] as [string, unknown]] : [])], children: [T.icon.symbol] }];
    }
    add(imp, "lucide-react", [T.icon.lucide]);
    const at: [string, unknown][] = [];
    if (size !== undefined) at.push(["size", size]);
    if (strokeWidth !== undefined) at.push(["strokeWidth", strokeWidth]);
    if (fill && fill !== "none") at.push(["fill", fill]);
    const cls = className ? mapClass(className, ds) : "";
    if (cls) at.push(["className", cls]);
    return [{ tag: T.icon.lucide, attrs: at, children: [] }];
  }
  try {
    return walk(T(props), ds, imp);
  } catch {
    return [{ tag: T.name || "Component", attrs: [], children: [] }];
  }
}

/* ── printing ─────────────────────────────────────────────────── */
const WIDTH = 100;
const q = (s: string) => JSON.stringify(s);
function attrText([k, v]: [string, unknown]): string {
  if (v === true) return k;
  if (typeof v === "string") return `${k}=${q(v)}`;
  if (typeof v === "number") return `${k}={${v}}`;
  if (k === "style" && typeof v === "object") {
    const body = Object.entries(v as Record<string, unknown>).map(([a, b]) => `${/^[a-zA-Z]+$/.test(a) ? a : q(a)}: ${typeof b === "number" ? b : q(String(b))}`).join(", ");
    return `style={{ ${body} }}`;
  }
  return `${k}={${JSON.stringify(v)}}`;
}
const textOut = (t: string) => (/[{}<>]/.test(t) ? `{${q(t)}}` : t);
// merge neighbouring strings and collapse runs of whitespace the way the browser shows them
function tidy(children: Node[]): Node[] {
  const out: Node[] = [];
  for (const c of children) {
    const last = out[out.length - 1];
    if (typeof c === "string" && typeof last === "string") out[out.length - 1] = last + c;
    else out.push(c);
  }
  return out.map((c) => (typeof c === "string" ? c.replace(/\s+/g, " ") : c)).filter((c) => c !== "");
}
function inline(n: Node): string | null {
  if (typeof n === "string") return textOut(n);
  const open = [n.tag, ...n.attrs.map(attrText)].join(" ");
  const kids = tidy(n.children);
  if (!kids.length) return `<${open} />`;
  const parts = kids.map(inline);
  if (parts.some((p) => p === null)) return null;
  const s = `<${open}>${parts.join("")}</${n.tag}>`;
  return s.includes("\n") ? null : s;
}
function print(n: Node, ind: number): string {
  const pad = " ".repeat(ind);
  if (typeof n === "string") return pad + textOut(n.trim());
  const one = inline(n);
  if (one !== null && pad.length + one.length <= WIDTH) return pad + one;
  const attrs = n.attrs.map(attrText);
  const openOne = `<${[n.tag, ...attrs].join(" ")}`;
  const open = pad.length + openOne.length + 1 <= WIDTH || !attrs.length ? `${pad}${openOne}` : `${pad}<${n.tag}\n${attrs.map((a) => `${pad}  ${a}`).join("\n")}\n${pad}`;
  const kids = tidy(n.children);
  if (!kids.length) return `${open} />`.replace(/\n\s* \/>$/, "\n" + pad + "/>");
  const lines = kids.map((c, i) => {
    if (typeof c !== "string") return print(c, ind + 2);
    // keep the spaces between words and tags that a line break would drop
    const lead = i > 0 && /^\s/.test(c) ? '{" "}' : "", trail = i < kids.length - 1 && /\s$/.test(c) ? '{" "}' : "";
    const t = c.trim();
    return t ? `${" ".repeat(ind + 2)}${lead}${textOut(t)}${trail}` : `${" ".repeat(ind + 2)}{" "}`;
  });
  return `${open}>\n${lines.join("\n")}\n${pad}</${n.tag}>`;
}

const pascal = (s: string) => s.replace(/[^a-zA-Z0-9]+(.)?/g, (_, c: string) => (c ? c.toUpperCase() : "")).replace(/^./, (c) => c.toUpperCase());

/** A fingerprint of what a component draws at the given options: two option sets with the
    same fingerprint draw the same thing. Customize uses it to show only the states and option
    values that change the component. */
export function signature(C: ComponentType<{ o: Props }>, o: Props, ds: DS): string {
  const imp: Imports = { named: new Map(), side: new Set() };
  try { return JSON.stringify(walk((C as (p: { o: Props }) => ReactNode)({ o }), ds, imp)); } catch { return ""; }
}

/** The code for a component at the given options, in the given design system. */
export function componentCode(C: ComponentType<{ o: Props }>, o: Props, ds: DS, name: string): string {
  const imp: Imports = { named: new Map(), side: new Set() };
  let tree: Node[] = [];
  // kit components are plain functions of their options (no hooks), so they can be called directly
  try { tree = walk((C as (p: { o: Props }) => ReactNode)({ o }), ds, imp); } catch { tree = []; }
  const root: Node = tree.length === 1 ? tree[0] : { tag: "", attrs: [], children: tree };
  const body = typeof root !== "string" && root.tag === "" ? `<>\n${tidy(root.children).map((c) => print(c, 6)).join("\n")}\n    </>` : print(root, 4).trimStart();
  const named = [...imp.named.entries()].sort(([a], [b]) => (a === "lucide-react" ? 1 : b === "lucide-react" ? -1 : a.localeCompare(b)))
    .map(([from, names]) => `import { ${[...names].sort().join(", ")} } from "${from}";`);
  const side = [...imp.side].sort().map((s) => `import "${s}";`);
  const head = ds === "m3"
    ? [`"use client";`, `// ${name} · Material 3 (@material/web) + Tailwind. Theme: Material's --md-sys-color-* tokens.`, ...side, ...named]
    : [`"use client";`, `// ${name} · shadcn/ui + Tailwind. Components from components/ui (npx shadcn@latest add …).`, ...named, ...side];
  return `${head.join("\n")}\n\nexport function ${pascal(name)}() {\n  return (\n    ${body}\n  );\n}\n`;
}
