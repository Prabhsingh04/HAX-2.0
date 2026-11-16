"use client";
// "With and without HAX": the same refund question answered by a bare chat and by a chat built from
// today's HAX components, drawn with the library's own parts in shadcn/ui. It replaces Prabh's
// static demo (public/hax/v1/compare), which showed the old patterns. Each part of the HAX reply is
// named beside it (on phones, in a row above it) and links to its page. The reply plays when the
// section comes into view; replay starts it over. Phones show one side at a time.
// v2 and v3 use it inside their own pages, so it carries v1's tokens and styles itself (the hax-v1
// class on the section); a host can set --hx-compare-pad to change its side padding.
import "../tokens.css";
import "../motion.css";
import "../library/kit/kit.css";
import "../library/kit/ds-shadcn.css";
import "@/components/ui/shadcn.css";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUpRight, Check, ChevronDown, FileText, Search, ShieldCheck, Sparkle, X } from "../library/kit/icons";
import { Caret, Spin } from "../library/kit/ui";
import { Btn, Tag } from "../library/kit/parts";
import { DSFonts } from "../library/kit/ds";

const Q = "Can I get a refund on my annual plan? I bought it 45 days ago.";
const WORDS = "You're past the 30-day window, but Billing can still review it. They approve most requests up to 60 days.".split(" ");

// the parts of the HAX reply: when each appears (a step of the sequence), its name and its page
type PartId = "steps" | "stream" | "sources" | "label" | "ask";
const PARTS: Record<PartId, { at: number; name: string; page: string }> = {
  steps: { at: 2, name: "Progress steps", page: "progress-steps" },
  stream: { at: 5, name: "Streaming", page: "streaming" },
  sources: { at: 6, name: "Sources", page: "sources" },
  label: { at: 7, name: "AI label", page: "ai-label" },
  ask: { at: 8, name: "Permission request", page: "permission-request" },
};
// when each step starts, in ms; the answer streams word by word from step 5
const AT = [0, 0, 500, 1150, 1800, 2000, 3300, 3600, 4000];
const WORD_MS = 62;

// both label rows are the replay button's height, so "Without" and "With" sit on one line
const label = "flex h-[30px] items-center gap-[8px] font-semibold leading-[18px] text-[13px]";
const notes = "flex flex-wrap gap-x-[20px] gap-y-[8px] leading-[20px] text-[14px] text-[color:var(--text-secondary)]";
// the bare chat's assistant: a general AI mark, nothing branded
const AiMark = ({ s = 22 }: { s?: number }) => (
  <span aria-hidden="true" className="grid shrink-0 place-items-center rounded-full bg-[var(--surface-tint-hover)] text-[color:var(--text-secondary)]" style={{ width: s, height: s }}>
    <Sparkle size={Math.round(s * 0.55)} />
  </span>
);
// what the agent checked: lines inside its one "Checked 2 things" step (as ChatGPT and Claude show
// them), each appearing on the stage the old separate steps used
const CHECKS = [
  { t: "Found order #4821", d: "Annual plan, bought 45 days ago", I: Search, at: 3 },
  { t: "Read the refund policy", d: "Help centre", I: FileText, at: 4 },
];

function Part({ id, step, children }: { id: PartId; step: number; children: ReactNode }) {
  const p = PARTS[id], on = step >= p.at;
  return (
    <div className={`relative transition-[opacity,transform] duration-500 ease-out ${on ? "opacity-100" : "translate-y-[6px] opacity-0"}`}>
      {children}
      {/* desktop: the part's name to the left of the card, with a line to the part */}
      <a href={`/pattern?id=${p.page}`} tabIndex={on ? 0 : -1} aria-hidden={!on}
        className="hx-link absolute right-[calc(100%+56px)] top-0 hidden items-center gap-[4px] whitespace-nowrap rounded-[var(--radius-pill)] border border-[var(--stroke-default)] bg-[var(--surface-page)] px-[10px] py-[2px] font-medium leading-[16px] text-[12px] text-[color:var(--text-link)] lg:inline-flex after:pointer-events-none after:absolute after:left-[calc(100%+6px)] after:top-1/2 after:h-px after:w-[44px] after:bg-[var(--stroke-default)] before:pointer-events-none before:absolute before:left-[calc(100%+50px)] before:top-1/2 before:size-[5px] before:-translate-y-1/2 before:rounded-full before:bg-[var(--text-link)]">
        {p.name}<ArrowUpRight size={12} />
      </a>
    </div>
  );
}

export function HowCompare() {
  const sec = useRef<HTMLElement>(null);
  const timers = useRef<number[]>([]);
  const [step, setStep] = useState(0);
  const [words, setWords] = useState(0);
  const [ask, setAsk] = useState<"open" | "sent" | "later">("open");
  const [side, setSide] = useState<"with" | "without">("with");
  const [checks, setChecks] = useState(true); // the step's lines are open; its header folds them

  const play = useCallback(() => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
    setAsk("open");
    setChecks(true);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setStep(AT.length - 1); setWords(WORDS.length); return; }
    setStep(0); setWords(0);
    AT.forEach((ms, s) => timers.current.push(window.setTimeout(() => setStep(s), ms)));
    WORDS.forEach((_, i) => timers.current.push(window.setTimeout(() => setWords(i + 1), AT[5] + i * WORD_MS)));
  }, []);

  // plays the first time the section is mostly in view
  useEffect(() => {
    const el = sec.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { play(); io.disconnect(); } }, { threshold: 0.35 });
    io.observe(el);
    return () => { io.disconnect(); timers.current.forEach((t) => clearTimeout(t)); };
  }, [play]);

  const streaming = step >= 5 && words < WORDS.length;
  const tab = (k: "with" | "without", t: string) => (
    <button type="button" role="tab" aria-selected={side === k} onClick={() => setSide(k)}
      className={`hx-tab flex h-[30px] flex-1 items-center justify-center rounded-[var(--radius-pill)] px-[14px] text-[13px] leading-[18px] ${side === k ? "bg-[var(--surface-accent)] font-semibold text-[color:var(--text-on-accent)]" : "font-medium text-[color:var(--text-secondary)]"}`}>{t}</button>
  );

  return (
    <section id="how" ref={sec} aria-labelledby="hx-vs-h" data-hx-blob-o="0.52"
      className="hax-v1 flex w-full flex-col items-center gap-[28px] px-[var(--hx-compare-pad,var(--hx-gutter))] py-[56px] text-[color:var(--text-primary)] md:gap-[40px] md:py-[96px]">
      <header className="flex max-w-[760px] flex-col items-center gap-[16px] text-center">
        <h2 id="hx-vs-h" className="font-extralight leading-[42px] text-[34px] [text-wrap:balance] md:leading-[52px] md:text-[42px] xl:leading-[60px] xl:text-[50px]">See how HAX elevates the AI experience</h2>
        <p className="leading-[26px] text-[16px] text-[color:var(--text-secondary)] [text-wrap:balance]">One prompt, two experiences. See how HAX brings transparency, traceability, and user control to AI interactions.</p>
      </header>

      {/* phones: one side at a time */}
      <div role="tablist" aria-label="Compare" className="flex w-full max-w-[360px] gap-[4px] rounded-[var(--radius-pill)] border border-[var(--stroke-subtle)] bg-[var(--surface-tint)] p-[4px] md:hidden">
        {tab("without", "Without HAX")}{tab("with", "With HAX")}
      </div>

      <div className="grid w-full max-w-[640px] items-start gap-[40px] lg:max-w-[1152px] lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1fr)] lg:gap-x-[200px]">
        {/* without: a bare reply */}
        <div className={`flex flex-col gap-[14px] ${side === "without" ? "" : "max-md:hidden"}`}>
          <p className={label}><i aria-hidden="true" className="size-[7px] rounded-full bg-[var(--text-tertiary)]" />Without HAX</p>
          <div role="group" aria-label="A bare AI chat reply" className="flex flex-col gap-[16px] rounded-[var(--radius-2xl)] border border-[var(--stroke-subtle)] bg-[var(--surface-raised)] p-[20px]">
            <p className="flex items-center gap-[10px] border-b border-[var(--stroke-subtle)] pb-[14px] font-semibold leading-[20px] text-[14px]"><AiMark />Assistant</p>
            <p className={`self-end rounded-[14px] bg-[var(--surface-tint)] px-[14px] py-[9px] leading-[20px] text-[14px] transition-opacity duration-500 ${step >= 1 ? "opacity-100" : "opacity-0"}`}>{Q}</p>
            <p className={`flex gap-[10px] leading-[22px] text-[14px] transition-opacity duration-500 ${step >= 3 ? "opacity-100" : "opacity-0"}`}>
              <span className="mt-[2px]"><AiMark s={18} /></span>
              Yes, you can get a refund. Just contact our support team and they&rsquo;ll process it for you.
            </p>
          </div>
          <ul className={notes}>
            {["Guesses, cites nothing", "Sounds certain when it isn’t", "Leaves the next step to you"].map((t) => (
              <li key={t} className="flex items-center gap-[6px]"><X size={14} strokeWidth={2.25} className="text-[color:var(--text-tertiary)]" />{t}</li>
            ))}
          </ul>
        </div>

        {/* with: the same question, answered with HAX components */}
        <div className={`flex flex-col gap-[14px] ${side === "with" ? "" : "max-md:hidden"}`}>
          <div className="flex items-center justify-between">
            <p className={label}><i aria-hidden="true" className="size-[7px] rounded-full bg-[var(--text-link)]" />With HAX</p>
            <button type="button" onClick={play} aria-label="Replay" title="Replay"
              className="hx-iconbtn grid size-[30px] place-items-center rounded-full border border-[var(--stroke-subtle)] text-[color:var(--text-secondary)]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
          {/* below desktop the parts' names sit in a row above the card */}
          <ul aria-label="Components in this reply" className="flex flex-wrap gap-[6px] lg:hidden">
            {Object.values(PARTS).map((p) => (
              <li key={p.page}><a href={`/pattern?id=${p.page}`} className="hx-chip flex h-[26px] items-center gap-[4px] rounded-[var(--radius-pill)] border border-[var(--stroke-default)] bg-[var(--surface-page)] px-[10px] font-medium leading-[16px] text-[12px] text-[color:var(--text-link)]">{p.name}<ArrowUpRight size={11} /></a></li>
            ))}
          </ul>
          <div role="group" aria-label="The same support chat built with HAX components" data-ds="shadcn"
            className="hk hk-col gap-[16px] rounded-[var(--radius-2xl)] border border-[var(--stroke-subtle)] bg-[var(--surface-raised)] p-[20px]">
            <DSFonts ds="shadcn" />
            {/* the assistant built with HAX carries the HAX logo */}
            <div className="hk-row gap-[8px] border-b border-[var(--k-edge)] pb-[12px]">
              <img alt="HAX" src="/hax/v1/logo-hax-weave.svg" className="hx-light-only h-[14px] w-auto shrink-0" />
              <img alt="HAX" src="/hax/v1/logo-hax-weave-dark.svg" className="hx-dark-only h-[14px] w-auto shrink-0" />
              <span className="hk-t">Aria</span><span className="hk-s">Acme support</span>
            </div>
            <span className={`hk-bubble self-end transition-opacity duration-500 ${step >= 1 ? "opacity-100" : "opacity-0"}`}>{Q}</span>

            <Part id="steps" step={step}>
              <div className="hk-col gap-[6px]">
                <button type="button" onClick={() => setChecks((o) => !o)} aria-expanded={checks} className="hk-row gap-[8px] self-start text-left">
                  {step >= 4 ? <Check size={16} strokeWidth={2.5} className="hk-okc" /> : <Spin />}
                  <span className="hk-t">{step >= 4 ? "Checked 2 things" : "Checking your order"}</span>
                  <ChevronDown size={14} className={`hk-s transition-transform duration-300 ${checks ? "rotate-180" : ""}`} />
                </button>
                {checks && (
                  <ul className="hk-col ml-[7px] gap-[4px] border-l border-[var(--k-edge)] pl-[14px]">
                    {CHECKS.map(({ t, d, I, at }) => (
                      <li key={t} className={`hk-row gap-[8px] text-[13px] leading-[18px] transition-opacity duration-300 ${step >= at ? "opacity-100" : "opacity-0"}`}>
                        <I size={13} className="hk-s shrink-0" /><span className="shrink-0 whitespace-nowrap">{t}</span><span className="hk-s w-0 min-w-0 flex-1 truncate">· {d}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Part>

            <Part id="stream" step={step}>
              <p className="hk-b">
                {WORDS.map((w, i) => <span key={i} className={i < words ? "" : "opacity-0"}>{w}{i < WORDS.length - 1 ? " " : ""}</span>)}
                <span className={`hk-cite transition-opacity duration-300 ${step >= 6 ? "opacity-100" : "opacity-0"}`}>1</span>
                {streaming && <Caret />}
              </p>
            </Part>

            <Part id="sources" step={step}>
              <div className="hk-well hk-row gap-[8px] px-[10px] py-[8px]">
                <span className="hk-cite !ml-0">1</span><FileText size={14} className="hk-blue" />
                <span className="hk-t">Refund policy</span><span className="hk-s">Help centre</span>
              </div>
            </Part>

            <Part id="label" step={step}>
              <div className="hk-row flex-wrap gap-[8px]">
                <span className="hk-ai"><Sparkle size={12} className="hk-blue" />Aria, an AI assistant</span>
                <span className="hk-s">A person can take over anytime.</span>
              </div>
            </Part>

            <Part id="ask" step={step}>
              <div className="hk-panel hk-col gap-[12px] p-[16px]">
                <div className="hk-row gap-[10px]">
                  <ShieldCheck size={18} className="hk-blue mt-[1px] shrink-0 self-start" />
                  <span className="hk-col"><span className="hk-t">Send a refund review to Billing?</span><span className="hk-s">Aria sends your order details to the Billing team.</span></span>
                </div>
                <div className="hk-well hk-col gap-[6px] p-[12px] text-[13px]">
                  {["Shares order #4821 and your message", "Billing replies within 2 days"].map((t) => (
                    <span key={t} className="hk-row gap-[8px]"><Check size={14} strokeWidth={2.5} className="hk-okc" />{t}</span>
                  ))}
                </div>
                {ask === "open" ? (
                  <div className="hk-row justify-end gap-[8px]">
                    <span onClick={() => setAsk("later")}><Btn kind="ghost">Not now</Btn></span>
                    <span onClick={() => setAsk("sent")}><Btn kind="main">Send request</Btn></span>
                  </div>
                ) : (
                  <div className="hk-row justify-end gap-[8px] hk-s" aria-live="polite">
                    {ask === "sent" ? <><Tag tone="ok">Sent</Tag>Billing replies within 2 days.</> : <>Nothing was sent. Aria kept the request for later.</>}
                  </div>
                )}
              </div>
            </Part>
          </div>
          <ul className={notes}>
            {["Shows what it checked", "Says it’s an AI", "Asks before it acts"].map((t) => (
              <li key={t} className="flex items-center gap-[6px]"><Check size={14} strokeWidth={2.5} className="text-[color:var(--text-link)]" />{t}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
