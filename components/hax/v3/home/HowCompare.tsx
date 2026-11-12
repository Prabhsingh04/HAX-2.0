"use client";
import { useEffect, useRef, useState } from "react";
import { Eyebrow, H2, Sub } from "../ui";
import { ANSWERS, CALLOUTS, PROMPT, REPLY, WITH, WITHOUT, type ComparePart as Part } from "@/components/hax/v1/home/content";

// Figma: How · with and without HAX 105:5877, laid out with the user's v1 decision: no tab
// switcher or numbered markers. Each HAX pattern is labelled on the chat (dot on the part,
// leader line, title + one line); hovering a label brings its part forward.
// Copy is v1's shared Home copy (components/hax/v1/home/content.ts).
const LABEL_H = 40;
type Pin = { k: Part; x: number; y: number; top: number };

const station = "rounded-[24px] border border-[var(--edge)] bg-[var(--panel)] p-[12px]";
const label = "font-[family-name:var(--font-mono)] font-medium leading-[16px] text-[12px] tracking-[0.96px] uppercase";
const card = "h3-light flex w-full flex-col gap-[14px] overflow-clip rounded-[12px] border border-[var(--stroke-subtle)] bg-[var(--surface-raised)] px-[22px] py-[20px] shadow-[0_8px_24px_rgba(41,50,71,.08)]";

function Avatar({ assistant }: { assistant?: boolean }) {
  return (
    <span className={`flex size-[28px] items-center justify-center rounded-[14px] font-semibold leading-[16px] text-[12px] ${assistant ? "bg-[var(--surface-assistant)] text-white" : "bg-[var(--surface-tint-pressed)]"}`}>A</span>
  );
}
function Line({ icon, text }: { icon: "x" | "check"; text: string }) {
  return (
    <p className="flex items-center gap-[8px] leading-[20px] text-[13px] text-[color:var(--text-secondary)]">
      <img alt="" src={`/hax/v1/icon-${icon}.svg`} className="size-[14px] shrink-0" />{text}
    </p>
  );
}
function Person() {
  return (
    <div className="flex w-full justify-end">
      <p className="max-w-[300px] rounded-[14px] bg-[var(--surface-message-person)] px-[14px] py-[10px] leading-[22px] text-[14px] text-white">{PROMPT}</p>
    </div>
  );
}

export function HowCompare() {
  const [hl, setHl] = useState<Part | null>(null);
  const [words, setWords] = useState(REPLY.split(" ").length);
  const [answer, setAnswer] = useState<keyof typeof ANSWERS | null>(null);
  const [pins, setPins] = useState<Pin[] | null>(null);
  const [edge, setEdge] = useState({ panel: 0, label: 0 });
  const row = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const parts = useRef<Partial<Record<Part, HTMLElement | null>>>({});

  useEffect(() => {
    if (!answer) return;
    const t = setTimeout(() => setAnswer(null), 3200);
    return () => clearTimeout(t);
  }, [answer]);

  // hovering "Streaming" replays the reply word by word
  useEffect(() => {
    const all = REPLY.split(" ").length;
    if (hl !== "message" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setWords(all); return; }
    setWords(0);
    let n = 0;
    const timer = setInterval(() => { n++; setWords(n); if (n >= all) clearInterval(timer); }, 55);
    return () => clearInterval(timer);
  }, [hl]);

  // each dot sits on its part's right edge; labels go in the column beside the card, level with
  // the part, and are pushed down when they would touch
  useEffect(() => {
    const measure = () => {
      const r = row.current, p = panel.current;
      if (!r || !p) return;
      const rb = r.getBoundingClientRect(), right = p.getBoundingClientRect().right - rb.left;
      let floor = -Infinity;
      const next: Pin[] = [];
      for (const { k } of CALLOUTS) {
        const el = parts.current[k];
        if (!el) return;
        const b = el.getBoundingClientRect(), y = b.top + b.height / 2 - rb.top;
        const top = Math.max(y - LABEL_H / 2, floor + 8);
        floor = top + LABEL_H;
        next.push({ k, x: b.right - rb.left + (k === "consent" ? 0 : 10), y, top });
      }
      setPins(next);
      setEdge({ panel: right, label: right + 28 });
    };
    measure();
    document.fonts?.ready.then(measure);
    const ro = new ResizeObserver(measure);
    if (row.current) ro.observe(row.current);
    return () => ro.disconnect();
  }, []);

  const part = (k: Part) => `h3-part ${hl === k ? "is-hl" : ""}`;
  const keep = (k: Part) => (el: HTMLElement | null) => { parts.current[k] = el; };

  return (
    <section id="how" className="flex flex-col items-center gap-[48px] px-[24px] py-[96px]" data-node-id="105:5877">
      <div className="h3-reveal flex max-w-[680px] flex-col items-center gap-[16px] text-center">
        <Eyebrow>With and without HAX</Eyebrow>
        <H2>See how HAX elevates<br />the AI experience</H2>
        <Sub>One prompt, two experiences. See how HAX brings transparency, traceability, and user control to AI interactions.</Sub>
      </div>
      <div className="h3-reveal flex w-full max-w-[1200px] flex-wrap items-stretch justify-center gap-[24px]">
        {/* Without HAX */}
        <div className={`${station} w-[456px]`}>
          <div className="flex flex-col gap-[12px] opacity-[.72]">
            <p className={`${label} px-[4px] pt-[4px] text-[color:var(--text-3)]`}>Without HAX</p>
            <div className="px-[28px] py-[28px]">
              <div className={card}>
                <div className="flex items-center gap-[10px]"><Avatar /><p className="font-semibold leading-[20px] text-[14px]">{WITHOUT.name}</p></div>
                <Person />
                <p className="max-w-[300px] rounded-[14px] bg-[var(--surface-message-assistant)] px-[14px] py-[10px] leading-[22px] text-[14px]">{WITHOUT.reply}</p>
                <div className="flex flex-col gap-[8px]">
                  {WITHOUT.misses.map((m) => <Line key={m} icon="x" text={m} />)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* With HAX: the chat, and the patterns labelled beside it */}
        <div className={`${station} w-[720px]`}>
          <p className={`${label} px-[4px] pt-[4px] text-[color:var(--cyan)]`}>With HAX</p>
          <div ref={row} className="relative py-[28px] pl-[28px] pr-[204px]">
            <div ref={panel}>
              <div data-active={hl ? true : undefined} className={`h3-parts ${card}`}>
                <div className="flex items-center gap-[10px]">
                  <Avatar assistant />
                  <p className="font-semibold leading-[20px] text-[14px]">{WITH.name}</p>
                  <p className="leading-[20px] text-[13px] text-[color:var(--text-secondary)]">· {WITH.org}</p>
                </div>
                <Person />
                <div ref={keep("trace")} className={`${part("trace")} flex flex-col gap-[6px]`}>
                  {WITH.trace.map((t) => <Line key={t} icon="check" text={t} />)}
                </div>
                <p ref={keep("message")} className={`${part("message")} min-h-[44px] leading-[22px] text-[14px]`}>{REPLY.split(" ").slice(0, words).join(" ")}</p>
                <p ref={keep("disclosure")} className={`${part("disclosure")} leading-[18px] text-[12px] text-[color:var(--text-secondary)]`}>{WITH.disclosure}</p>
                <div ref={keep("consent")} className={`${part("consent")} flex w-full flex-col items-start gap-[6px] rounded-[12px] border border-[var(--stroke-subtle)] bg-[var(--surface-tint)] px-[22px] py-[20px]`}>
                  <span className="rounded-[999px] bg-[var(--status-warning-subtle)] px-[8px] py-[2px] font-medium leading-[16px] text-[12px] text-[color:var(--status-warning)]">{WITH.consent.tag}</span>
                  <p className="font-semibold leading-[20px] text-[14px]">{WITH.consent.title}</p>
                  <p className="leading-[20px] text-[13px] text-[color:var(--text-secondary)]">{WITH.consent.body}</p>
                  <div className="flex h-[38px] items-center gap-[8px] pt-[6px]" aria-live="polite">
                    {answer ? (
                      <p key={answer} className="h3-swap leading-[20px] text-[13px] text-[color:var(--text-secondary)]">{ANSWERS[answer]}</p>
                    ) : (
                      <>
                        <button type="button" onClick={() => setAnswer("send")} className="h3-btn flex h-[32px] items-center rounded-[999px] bg-[var(--surface-inverse)] px-[12px] font-semibold leading-[18px] text-[13px] text-white hover:bg-[#3a4560] active:bg-[#1e2536]">{WITH.consent.send}</button>
                        <button type="button" onClick={() => setAnswer("skip")} className="h3-btn flex h-[32px] items-center rounded-[999px] border border-[var(--stroke-default)] bg-white px-[12px] font-semibold leading-[18px] text-[13px] shadow-[0_1px_2px_rgba(0,0,0,.05)] hover:bg-[#f4f5f6] active:bg-[#eaebed]">{WITH.consent.skip}</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* leader lines and dots over the card; labels in the column beside it */}
            <svg aria-hidden className="pointer-events-none absolute inset-0 size-full overflow-visible">
              {pins?.map((p) => {
                const on = hl === p.k, ly = p.top + LABEL_H / 2;
                return (
                  <g key={p.k}>
                    <polyline points={`${p.x},${p.y} ${edge.panel + 12},${p.y} ${edge.label - 8},${ly}`} fill="none" strokeWidth={1}
                      style={{ stroke: on ? "rgba(255,255,255,.7)" : "rgba(255,255,255,.28)", transition: "stroke .2s" }} />
                    <circle cx={p.x} cy={p.y} r={on ? 5 : 4} strokeWidth={2} style={{ fill: "#f5a524", stroke: "#fff", transition: "r .2s" }} />
                  </g>
                );
              })}
            </svg>
            <ul aria-label="HAX patterns in this reply" className="contents">
              {CALLOUTS.map((c, i) => (
                <li key={c.k} tabIndex={0} onMouseEnter={() => setHl(c.k)} onMouseLeave={() => setHl(null)} onFocus={() => setHl(c.k)} onBlur={() => setHl(null)}
                  className={`h3-side absolute flex w-[176px] cursor-default flex-col gap-[2px] rounded-[6px] outline-none transition-opacity duration-300 focus-visible:outline-[3px] focus-visible:outline-[var(--focus-ring)] ${pins ? "" : "invisible"} ${hl && hl !== c.k ? "opacity-[.45]" : ""}`}
                  style={{ left: edge.label, top: pins?.[i].top ?? 0 }}>
                  <p className={`font-semibold leading-[20px] text-[14px] transition-colors duration-200 ${hl === c.k ? "text-[color:var(--cyan)]" : "text-[color:var(--text)]"}`}>{c.title}</p>
                  <p className="leading-[18px] text-[13px] text-[color:var(--text-2)]">{c.desc}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
