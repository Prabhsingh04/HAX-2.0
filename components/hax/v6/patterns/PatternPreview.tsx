"use client";
import { useEffect, useRef, useState } from "react";
import type { AuthoredPreview, RefPreview } from "@/components/hax/v6/patterns/data";

// A pattern's live preview, exactly as Srishti's draft renders it: her HTML runs in an iframe that
// reports its own height. The controls around it (kit, where it appears, how much to show) are v6's.
//   authored (agentic): one HTML file per state in public/hax/v6/patterns/authored/<id>/
//   ref (general):      her renderer, public/hax/v6/patterns/ref/preview.html?<params>
const seg = "h6-tab rounded-full px-[14px] py-[6px] text-[13px] font-semibold leading-[20px] text-[color:var(--text-2)] aria-[selected=true]:bg-[var(--text)] aria-[selected=true]:text-white";
const tab = "h6-tab -mb-px border-b-2 border-transparent px-[2px] pb-[10px] pt-[4px] text-[14px] font-medium leading-[20px] text-[color:var(--text-3)] aria-[selected=true]:border-[var(--link)] aria-[selected=true]:text-[color:var(--text)]";
const chip = "h6-chip rounded-full border border-[var(--edge-2)] px-[14px] py-[6px] text-[13px] font-medium leading-[20px] text-[color:var(--text-2)] aria-[pressed=true]:border-[var(--cyan)] aria-[pressed=true]:bg-[var(--cyan)] aria-[pressed=true]:text-[color:var(--text)]";
const label = "font-[family-name:var(--font-mono)] text-[11px] font-medium uppercase leading-[16px] tracking-[0.96px] text-[color:var(--text-3)]";

// The frame takes the height its page reports (her renderer posts "hax-pattern-preview-height").
// Four of her previews (nx-randomize, nx-structured-output, nx-variations, nx-verification) throw in
// her script on her site too and never report, so the frame also measures its own document
// (same origin) and follows it as it changes.
function Frame({ src, title }: { src: string; title: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [h, setH] = useState(320);
  useEffect(() => {
    const set = (n: number) => { if (n > 40) setH((cur) => (Math.abs(cur - n) > 1 ? n : cur)); };
    const on = (e: MessageEvent) => {
      if (e.source !== ref.current?.contentWindow || e.data?.type !== "hax-pattern-preview-height") return;
      set(Math.ceil(Number(e.data.height) || 0));
    };
    window.addEventListener("message", on);
    const f = ref.current;
    let ro: ResizeObserver | undefined;
    const measure = () => {
      const doc = f?.contentDocument;
      if (!doc?.body) return;
      const detail = doc.getElementById("detail");
      set(Math.ceil((detail ? detail.getBoundingClientRect().height + 4 : doc.body.scrollHeight)));
      ro?.disconnect();
      ro = new ResizeObserver(() => { const d = f?.contentDocument; if (d?.body) set(Math.ceil((d.getElementById("detail")?.getBoundingClientRect().height ?? 0) + 4 || d.body.scrollHeight)); });
      ro.observe(doc.body);
    };
    f?.addEventListener("load", measure);
    const late = window.setTimeout(measure, 1500);
    return () => { window.removeEventListener("message", on); f?.removeEventListener("load", measure); window.clearTimeout(late); ro?.disconnect(); };
  }, [src]);
  return (
    <div className="overflow-hidden rounded-[20px] border border-[var(--edge-2)] bg-white">
      <iframe ref={ref} src={src} title={title} scrolling="no" className="block w-full border-0 transition-[height] duration-300" style={{ height: h }} />
    </div>
  );
}

export function PatternPreview({ id, name, preview }: { id: string; name: string; preview: AuthoredPreview | RefPreview }) {
  if (preview.type === "ref") return <RefView id={id} name={name} p={preview} />;
  return <AuthoredView id={id} name={name} p={preview} />;
}

function RefView({ name, p }: { id: string; name: string; p: RefPreview }) {
  const [i, setI] = useState(p.default);
  const t = p.templates[i] ?? p.templates[0];
  return (
    <div className="flex flex-col gap-[20px]">
      {p.templates.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-[20px] gap-y-[8px] border-b border-[var(--edge)]">
          <span className={`${label} pb-[12px]`}>{p.channelLabel}</span>
          <div role="tablist" aria-label={p.channelLabel} className="flex flex-wrap gap-[20px]">
            {p.templates.map((x, k) => <button key={x.label} type="button" role="tab" aria-selected={i === k} className={tab} onClick={() => setI(k)}>{x.label}</button>)}
          </div>
        </div>
      )}
      <Frame src={`/hax/v6/patterns/ref/preview.html?${t?.params ?? p.params}`} title={`${name} preview${t ? `: ${t.label}` : ""}`} />
    </div>
  );
}

function AuthoredView({ id, name, p }: { id: string; name: string; p: AuthoredPreview }) {
  const [k0, c0, d0] = p.default.split("-");
  const [kit, setKit] = useState(+k0 || 0);
  const [ch, setCh] = useState(+c0 || 0);
  const [dt, setDt] = useState(d0 === "x" ? 0 : +d0 || 0);
  const details = p.details[ch];
  const key = `${kit}-${ch}-${details ? Math.min(dt, details.options.length - 1) : "x"}`;
  const src = `/hax/v6/patterns/authored/${id}/${p.states.includes(key) ? key : p.default}.html`;
  return (
    <div className="flex flex-col gap-[20px]">
      {p.kits.length > 1 && (
        <div role="tablist" aria-label="Component kit" className="flex w-fit gap-[2px] rounded-full border border-[var(--edge-2)] bg-[var(--panel)] p-[3px]">
          {p.kits.map((x, i) => <button key={x} type="button" role="tab" aria-selected={kit === i} className={seg} onClick={() => setKit(i)}>{x}</button>)}
        </div>
      )}
      {p.channels.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-[20px] gap-y-[8px] border-b border-[var(--edge)]">
          <span className={`${label} pb-[12px]`}>{p.channelLabel}</span>
          <div role="tablist" aria-label={p.channelLabel} className="flex flex-wrap gap-[20px]">
            {p.channels.map((x, i) => <button key={x} type="button" role="tab" aria-selected={ch === i} className={tab} onClick={() => { setCh(i); setDt(0); }}>{x}</button>)}
          </div>
        </div>
      )}
      {details && (
        <div className="flex flex-col gap-[10px]">
          <span className={label}>{details.label}</span>
          <div className="flex flex-wrap gap-[8px]">
            {details.options.map((x, i) => <button key={x} type="button" aria-pressed={Math.min(dt, details.options.length - 1) === i} className={chip} onClick={() => setDt(i)}>{x}</button>)}
          </div>
        </div>
      )}
      <Frame src={src} title={`${name} preview`} />
    </div>
  );
}
