"use client";
import "./kit.css";
import { useEffect, useState } from "react";
import { defaults, type Entry, type Props } from "./ui";
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

// Library card / Home: the component with its default options, at half size.
export function KitCard({ id, flush }: { id: string; flush?: boolean }) {
  const e = KIT[id];
  if (!e) return null;
  return (
    <div aria-hidden="true" className={`hk hk-stage hk-card ${flush ? "hk-card--flush" : ""}`}>
      <div className="hk-scale" style={e.card ? { width: 289 / e.card, height: 181 / e.card, transform: `translate(-50%, -50%) scale(${e.card})` } : undefined}><e.C o={defaults(e.opts)} /></div>
    </div>
  );
}

// Component page: the component at 1×, with a control for every option it takes.
export function KitPlayground({ id }: { id: string }) {
  const e = KIT[id];
  const [o, setO] = useState<Props>(() => (e ? defaults(e.opts) : {}));
  // ?o.effort=false&o.surface=Image opens the page on that version, so a version can be linked
  useEffect(() => {
    if (!e) return;
    const q = new URLSearchParams(location.search), next: Props = {};
    e.opts.forEach((x) => { const v = q.get(`o.${x.key}`); if (v !== null) next[x.key] = x.kind === "toggle" ? v === "true" : v; });
    if (Object.keys(next).length) setO((p) => ({ ...p, ...next }));
  }, [e]);
  if (!e) return null;
  const set = (k: string, v: string | boolean) => setO((p) => ({ ...p, [k]: v }));
  return (
    <div className="hk flex flex-col gap-[12px] w-full">
      <div className="hk-opts" role="group" aria-label="Options">
        {e.opts.map((x) => x.kind === "toggle" ? (
          <label key={x.key}><input type="checkbox" checked={!!o[x.key]} onChange={(ev) => set(x.key, ev.target.checked)} />{x.label}</label>
        ) : (
          <label key={x.key}>{x.label}
            <select value={String(o[x.key])} onChange={(ev) => set(x.key, ev.target.value)}>{x.values.map((v) => <option key={v}>{v}</option>)}</select>
          </label>
        ))}
        <button type="button" onClick={() => setO(defaults(e.opts))} className="ml-auto hk-link text-[13px]">Reset</button>
      </div>
      <div className="hk-stage hk-page" aria-hidden="true"><e.C o={o} /></div>
      <p className="hk-s">Studied: {e.refs.join(" · ")}</p>
    </div>
  );
}
