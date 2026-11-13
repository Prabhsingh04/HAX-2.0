import type { ReactNode } from "react";
import {
  ArrowUp, Braces, Check, Code2, ChevronDown, GitPullRequest, ChevronRight, Copy, Download, Expand, FileText, Languages, ListTree, Maximize2,
  Minimize2, Pause, Play, RefreshCw, Share2, Sparkle, Square, ThumbsDown, ThumbsUp, Wand2,
} from "./icons";
import { AgentHead, Bullets, Caret, Me, Spin, Typing, sel, tog, type Entry, type Props } from "./ui";

// the row of actions under any agent answer (ChatGPT, Claude, Gemini all ship this)
const Actions = () => (
  <div className="hk-row !gap-[2px] -ml-[6px]">
    {[Copy, ThumbsUp, ThumbsDown, RefreshCw, Share2].map((I, i) => <span key={i} className="hk-ib hk-ib--sm"><I size={15} strokeWidth={1.9} /></span>)}
  </div>
);

/* Streaming — ChatGPT / Claude: text grows under a status line, a Stop button in the
   composer; Gemini "Show thinking"; Perplexity streams steps first. */
function Streaming({ o }: { o: Props }) {
  const st = o.state as string;
  return (
    <div className="w-[520px] hk-col gap-[12px]">
      <AgentHead note={st === "Starting" ? <span className="hk-shimmer font-medium">Reading 3 files…</span> : st === "Writing" ? <><Typing />Writing</> : st === "Stopped" ? "Stopped by you" : "Done in 14 s"} />
      {st !== "Starting" && (
        <p className="hk-b">Churn rose 4 points in EMEA after the May price change. Most of the loss came from teams under ten seats, who moved to the monthly plan{st === "Writing" ? <Caret /> : st === "Stopped" ? "…" : " and then left within two billing cycles. The fix is a smaller annual tier."}</p>
      )}
      {st === "Starting" && <div className="hk-col gap-[8px]">{[100, 92, 64].map((w) => <i key={w} className="block h-[10px] rounded-full bg-[var(--surface-tint-hover)]" style={{ width: `${w}%` }} />)}</div>}
      {st === "Writing" && o.stop && <div className="hk-row"><span className="hk-btn hk-btn--sm"><Square size={9} fill="currentColor" strokeWidth={0} />Stop</span></div>}
      {st === "Stopped" && <div className="hk-row gap-[8px]"><span className="hk-btn hk-btn--sm">Continue</span><span className="hk-s">86 words kept</span></div>}
      {st === "Done" && o.actions && <Actions />}
    </div>
  );
}

/* Summary — Zoom AI Companion, Otter, Copilot in Teams recap, Gemini in Meet notes; after the
   agent's own work: a "What I did" recap under the answer (Claude, ChatGPT agent) and the
   Codex-style done note with the files it changed. */
const Done = ({ items }: { items: string[] }) => (
  <div className="hk-col gap-[6px]">
    {items.map((t) => <span key={t} className="hk-row !items-start gap-[10px] text-[13.5px] leading-[20px]"><Check size={15} strokeWidth={2.5} className="hk-okc mt-[2px]" />{t}</span>)}
  </div>
);

function Summary({ o }: { o: Props }) {
  const k = o.kind as string;
  if (k === "Answer recap") return (
    <div className="w-[540px] hk-col gap-[12px]">
      <AgentHead note="Done in 2 min" />
      <p className="hk-b">I went through the onboarding flow and found three problems: people pick their role too late, the first success screen has no next step, and the empty state doesn&apos;t say what data it needs.</p>
      <p className="hk-b">The smallest fix is to ask for the role on the first screen, keep Continue setup in view, and show sample data in the empty state.</p>
      <div className="hk-well p-[14px] hk-col gap-[8px]">
        <span className="hk-t">What I did</span>
        <Done items={["Read all 4 onboarding screens", "Found 3 places people drop off", "Suggested 3 small fixes"]} />
      </div>
    </div>
  );
  if (k === "Task done") return (
    <div className="hk-panel w-[540px] p-[18px] hk-col gap-[14px]">
      <p className="text-[16px] leading-[24px] font-semibold">Done. The login test is fixed and PR #482 is open.</p>
      <div className="hk-well overflow-hidden">
        <div className="hk-row justify-between px-[12px] h-[36px] border-b border-[var(--k-edge)]">
          <span className="text-[13px] font-semibold">3 files changed</span>
          <span className="hk-mono font-semibold"><span className="hk-okc">+18</span> <span className="hk-badc">−7</span></span>
        </div>
        {[["src/auth/login.ts", "+12", "−4"], ["src/auth/retry.ts", "+5", "−2"], ["tests/login.spec.ts", "+1", "−1"]].map(([f, a, d]) => (
          <div key={f} className="hk-row justify-between px-[12px] h-[30px]"><span className="hk-mono">{f}</span><span className="hk-mono"><span className="hk-okc">{a}</span> <span className="hk-badc">{d}</span></span></div>
        ))}
      </div>
      <Done items={["All 148 tests pass", "Retries now wait 200 ms before trying again"]} />
      <div className="hk-row gap-[8px]"><span className="hk-btn hk-btn--sm"><GitPullRequest size={13} />View PR</span><span className="hk-btn hk-btn--sm hk-btn--ghost">Undo changes</span></div>
    </div>
  );
  const long = o.length === "Detailed";
  return (
    <div className="hk-panel w-[520px] p-[18px] hk-col gap-[12px]">
      <div className="hk-row justify-between"><span className="hk-col"><span className="hk-h">Pricing sync</span><span className="hk-s">Tue 14 Oct · 42 min · 5 people</span></span>{o.ai && <span className="hk-ai"><Sparkle size={12} strokeWidth={2.5} className="hk-blue" />Summary</span>}</div>
      {o.tabs && <div className="hk-row gap-[4px]">{["Summary", "Decisions", "Actions", "Transcript"].map((t, i) => <span key={t} className={`hk-chip !h-[28px] ${i === 0 ? "hk-chip--sel" : "!border-transparent"}`}>{t}</span>)}</div>}
      <Bullets items={["The Team plan stays at $12 a seat.", "Launch moves to March 18, after the billing fix.", ...(long ? ["Sales gets the new quote template on Monday.", "Churn review moves to every two weeks."] : []), <span key="a">Maya sends the revised quote by Friday.<span className="hk-cite">12:40</span></span>]} />
      <div className="hk-row gap-[8px]"><span className="hk-btn hk-btn--sm">Share notes</span><span className="hk-pick">{long ? "Shorter" : "More detail"}<ChevronDown size={13} /></span></div>
    </div>
  );
}

/* Table — ChatGPT data tables, Gemini "Export to Sheets", Notion AI database fill. The same
   data in the shape that fits the job: a few big numbers as cards (Stripe, Linear insights),
   one record as label and value rows, and JSON when another tool will read it. */
function Table({ o }: { o: Props }) {
  const f = o.format as string;
  if (f === "Cards") return (
    <div className="w-[540px] hk-col gap-[10px]">
      <div className="hk-row justify-between"><span className="hk-h">Pipeline health</span><span className="hk-s">From the CRM · 5 min ago</span></div>
      <div className="grid grid-cols-3 gap-[8px]">
        {[["Accounts at risk", "3", "All renew this quarter"], ["Revenue at risk", "$795K", "Across 14 open deals"], ["Call first", "Acme", "Renews in 18 days"]].map(([l, v, s]) => (
          <div key={l} className="hk-panel !shadow-none p-[14px] hk-col gap-[2px]">
            <span className="hk-s">{l}</span><span className="text-[24px] leading-[32px] font-semibold tracking-[-.3px]">{v}</span><span className="hk-s">{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
  if (f === "Key-value") return (
    <div className="hk-panel w-[440px] overflow-hidden">
      <div className="hk-row justify-between px-[16px] h-[48px] border-b border-[var(--k-edge)]"><span className="hk-t">Acme renewal</span><span className="hk-s">Renews Apr 30</span></div>
      {[["Revenue at stake", "$420K"], ["Last contact", "47 days ago"], ["Owner", "Maya Ruiz"], ["Next step", "Call before Friday"]].map(([l, v]) => (
        <div key={l} className="hk-row justify-between px-[16px] h-[42px] border-b border-[var(--k-edge)]"><span className="text-[13.5px] hk-mute">{l}</span><span className="text-[13.5px] font-semibold">{v}</span></div>
      ))}
      <div className="px-[16px] h-[40px] hk-row"><span className="hk-s">From the CRM and the last 3 emails</span></div>
    </div>
  );
  if (f === "JSON") return (
    <div className="w-[520px] hk-col gap-[8px]">
      <div className="hk-code !p-0">
        <div className="hk-row justify-between px-[14px] h-[38px] border-b border-[var(--k-edge)]"><span className="hk-row gap-[6px] text-[12.5px] font-semibold"><Braces size={14} />vendors.json</span><span className="hk-ib hk-ib--bare"><Copy size={14} /></span></div>
        <div className="p-[14px]">
          {"[\n"}
          {[["Northwind", "1200", "99.9"], ["Contoso", "980", "99.5"], ["Fabrikam", "1450", "99.99"]].map(([v, p, u], i) => (
            <span key={v}>{"  { "}<b>&quot;vendor&quot;</b>: <i>&quot;{v}&quot;</i>, <b>&quot;perMonth&quot;</b>: {p}, <b>&quot;uptime&quot;</b>: {u} {"}"}{i < 2 ? ",\n" : "\n"}</span>
          ))}
          {"]"}
        </div>
      </div>
      <div className="hk-row justify-between"><span className="hk-s">Ready for Sheets, Zapier or your own code</span><span className="hk-btn hk-btn--sm"><Download size={13} />Download</span></div>
    </div>
  );
  const rows = [["Northwind", "$1,200", "99.9%", "30 days"], ["Contoso", "$980", "99.5%", "60 days"], ["Fabrikam", "$1,450", "99.99%", "30 days"]];
  return (
    <div className="hk-panel w-[540px] overflow-hidden">
      <div className="hk-row justify-between px-[16px] h-[48px] border-b border-[var(--k-edge)]">
        <span className="hk-t">Vendor comparison</span>
        <span className="hk-row !gap-[2px]">{o.toolbar && [Download, Maximize2, Copy].map((I, i) => <span key={i} className="hk-ib hk-ib--sm"><I size={15} strokeWidth={1.9} /></span>)}</span>
      </div>
      <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr]">
        {["Vendor", "Per month", "Uptime", "Notice"].map((h) => <span key={h} className="hk-s font-semibold px-[16px] py-[9px] border-b border-[var(--k-edge)] bg-[var(--k-soft)]">{h}</span>)}
        {rows.map((r, i) => r.map((v, j) => (
          <span key={`${i}${j}`} className={`text-[13.5px] px-[16px] py-[10px] border-b border-[var(--k-edge)] ${j === 0 ? "font-medium" : "hk-mute"} ${o.highlight && i === 1 && j === 1 ? "!text-[color:var(--k-ok)] font-semibold bg-[var(--k-ok-bg)]" : ""}`}>{v}</span>
        )))}
      </div>
      <div className="hk-row justify-between px-[16px] h-[44px]"><span className="hk-s">From 3 quotes in the shared drive</span>{o.sheet && <span className="hk-btn hk-btn--sm">Open in Sheets</span>}</div>
    </div>
  );
}

/* Chart — ChatGPT data analysis, Julius, Gemini in Sheets, Copilot in Excel. */
function Chart({ o }: { o: Props }) {
  const h = [31, 35, 33, 39, 42, 55, 63, 70];
  const line = o.type === "Line";
  return (
    <div className="hk-panel w-[520px] p-[18px] hk-col gap-[12px]">
      <div className="hk-row justify-between">
        <span className="hk-col"><span className="hk-h">Weekly active teams</span><span className="hk-s">Last 8 weeks · from product analytics</span></span>
        <span className="hk-col items-end"><span className="text-[22px] leading-[28px] font-semibold">1,240</span><span className="hk-s hk-okc font-semibold">+18% since launch</span></span>
      </div>
      <div className="relative h-[150px] border-b border-[var(--k-edge)]">
        {[33, 66].map((y) => <i key={y} className="absolute left-0 right-0 border-t border-dashed border-[var(--k-edge)]" style={{ bottom: `${y}%` }} />)}
        {line ? (
          <svg viewBox="0 0 480 150" preserveAspectRatio="none" className="absolute inset-0 size-full">
            <polyline fill="none" stroke="var(--k-chart)" strokeWidth="2.5" points={h.map((v, i) => `${i * 66 + 9},${150 - v * 2}`).join(" ")} />
            {h.map((v, i) => <circle key={i} cx={i * 66 + 9} cy={150 - v * 2} r={i === 5 ? 5 : 3} fill={i === 5 ? "var(--k-chart)" : "var(--k-panel)"} stroke="var(--k-chart)" strokeWidth="2" />)}
          </svg>
        ) : (
          <div className="absolute inset-0 flex items-end gap-[12px]">{h.map((v, i) => <i key={i} className="flex-1 rounded-t-[5px]" style={{ height: `${v}%`, background: i >= 5 ? "var(--k-chart)" : "color-mix(in srgb, var(--k-chart) 22%, transparent)" }} />)}</div>
        )}
        {o.callout && <span className="absolute left-[296px] top-[2px] hk-tag hk-tag--blue !h-[24px]">Launch · Oct 1</span>}
      </div>
      <div className="hk-row justify-between hk-s"><span>Sep 1</span>{o.ask && <span className="hk-pick hk-pick--box !h-[28px]"><Sparkle size={13} />Ask about this chart</span>}<span>Oct 20</span></div>
    </div>
  );
}

/* Variations — Midjourney 2×2 grid, Firefly 4 results, ChatGPT "Which response do you prefer?",
   Jasper headline variants, Coolors palettes. Each version says how it differs; the pick is a
   blue edge and a check, and the one main action sits under the set, never on every card. */
const PALETTES: [string, string, string[], string][] = [
  ["Sunset Trail", "Coral · Amber · Teal", ["#FF4417", "#F9A20B", "#0AA77F", "#F2EDE8"], "#241006"],
  ["Deep Pacific", "Ocean · Teal · Amber", ["#0B87BD", "#0AA77F", "#F59E0B", "#E8F6FD"], "#001B2B"],
  ["Action Signal", "Ink · Coral · Ocean", ["#171717", "#FF4417", "#0B87BD", "#F5F5F5"], "#001B2B"],
];
const REPLIES: [string, string][] = [
  ["Shorter", "The launch is on track. We fixed the last billing edge cases, finished QA on the invite flow, and ship to the beta group on Friday."],
  ["Warmer", "We're in good shape for Friday. The team closed the last billing issues, QA passed the invite flow, and the beta group can start with no extra setup."],
];

function Variations({ o }: { o: Props }) {
  const k = o.kind as string, img = k === "Images", pal = k === "Palettes";
  const opts = ["Ship faster, with fewer hand-offs", "Your team, minus the busywork", "From request to release in a day"];
  const g = ["linear-gradient(160deg,#dfe7ef,#9fb5cb 55%,#6b84a0)", "linear-gradient(160deg,#e9dfd2,#c9a98a 55%,#8f6b52)", "linear-gradient(160deg,#d6e6e0,#8fbcab 55%,#4f8a76)", "linear-gradient(160deg,#e3e0ef,#a9a1cf 55%,#6c62a3)"];
  if (k === "Responses") return (
    <div className="w-[560px] hk-col gap-[12px]">
      <div className="hk-col"><span className="hk-h">Which response do you prefer?</span><span className="hk-s">Your pick becomes the answer. The other one stays a tap away.</span></div>
      <div className="grid grid-cols-2 gap-[10px]">
        {REPLIES.map(([d, t], i) => (
          <div key={d} className={`hk-panel !shadow-none p-[14px] hk-col gap-[10px] ${i === 0 ? "hk-opt--on !border-[var(--k-blue)]" : ""}`}>
            <div className="hk-row justify-between"><span className="hk-t">Response {i + 1}</span><span className="hk-s">{d}</span></div>
            <p className="text-[13.5px] leading-[20px] hk-grow">{t}</p>
            {i === 0
              ? <span className="hk-pick hk-pick--on self-start !h-[28px] !px-[10px]"><Check size={13} strokeWidth={2.5} />Preferred</span>
              : <span className="hk-btn hk-btn--sm self-start">Prefer this one</span>}
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div className="w-[540px] hk-col gap-[12px]">
      <div className="hk-row justify-between"><span className="hk-h">{img ? "4 images" : pal ? "Brand palette · 3 options" : "Headline · 3 versions"}</span><span className="hk-pick"><RefreshCw size={13} />More like these</span></div>
      {img ? (
        <div className="grid grid-cols-4 gap-[8px]">{g.map((b, i) => <div key={i} className={`h-[118px] rounded-[var(--hk-r-lg)] relative ${i === 1 ? "ring-2 ring-[var(--k-blue)] ring-offset-2 ring-offset-[var(--surface-page)]" : ""}`} style={{ background: b }}>{i === 1 && <span className="absolute right-[6px] top-[6px] hk-check hk-check--on"><Check size={12} strokeWidth={3} /></span>}</div>)}</div>
      ) : pal ? (
        <div className="grid grid-cols-3 gap-[8px]">
          {PALETTES.map(([n, d, c, dark], i) => (
            <div key={n} className={`hk-panel !shadow-none overflow-hidden ${i === 1 ? "hk-opt--on !border-[var(--k-blue)]" : ""}`}>
              <div className="flex h-[44px]">{c.map((x) => <i key={x} className="flex-1" style={{ background: x }} />)}</div>
              <div className="p-[12px] hk-col gap-[10px]">
                <div className="hk-row justify-between !items-start"><span className="hk-col"><span className="hk-t">{n}</span><span className="hk-s">{d}</span></span>{i === 1 && <span className="hk-check hk-check--on"><Check size={12} strokeWidth={3} /></span>}</div>
                <div className="grid grid-cols-2 gap-[6px]">
                  {[["Light", "#ffffff", "#293247"], ["Dark", dark, "#ffffff"]].map(([m, bg, fg]) => (
                    <span key={m} className="h-[30px] rounded-[8px] border border-[var(--k-edge)] hk-row !gap-[3px] px-[8px]" style={{ background: bg }}>
                      <span className="text-[11px] font-semibold mr-[3px]" style={{ color: fg }}>{m}</span>
                      {c.slice(0, 3).map((x) => <i key={x} className="size-[7px] rounded-full" style={{ background: m === "Dark" && x === "#171717" ? "#F5F5F5" : x }} />)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-[8px]">
          {opts.map((t, i) => (
            <div key={t} className={`hk-panel !shadow-none p-[14px] hk-col gap-[10px] h-[124px] ${i === 1 ? "hk-opt--on !border-[var(--k-blue)]" : ""}`}>
              <div className="hk-row justify-between h-[18px]"><span className="hk-xs">Version {"ABC"[i]}</span>{i === 1 && <span className="hk-check hk-check--on"><Check size={12} strokeWidth={3} /></span>}</div>
              <p className="text-[15px] leading-[20px] font-semibold">{t}</p>
            </div>
          ))}
        </div>
      )}
      <div className="hk-row justify-end gap-[8px]">{o.mix && !img && !pal && <span className="hk-btn">Mix A and B</span>}<span className="hk-btn hk-btn--main">{img ? "Upscale" : pal ? "Use Deep Pacific" : "Use B"}</span></div>
    </div>
  );
}

/* Media — NotebookLM audio overview (waveform), ChatGPT voice, Gamma slides, Gemini and
   Synthesia video split into scenes. */
const WAVE = Array.from({ length: 76 }, (_, i) => Math.round(28 + 40 * Math.abs(Math.sin(i * 0.55)) + 30 * Math.abs(Math.sin(i * 1.7 + 1))) );

function Media({ o }: { o: Props }) {
  const t = o.type as string;
  return (
    <div className="hk-panel w-[520px] p-[16px] hk-col gap-[12px]">
      <p className="hk-b">Here is the launch recap{t === "Audio" ? " as a 2-minute audio briefing" : t === "Slides" ? " as six slides" : " as a 40-second video"}.</p>
      {t === "Audio" && (
        <div className="hk-well p-[12px] hk-row gap-[12px]">
          <span className="hk-send !size-[40px]">{o.playing ? <Pause size={16} fill="currentColor" strokeWidth={0} /> : <Play size={16} fill="currentColor" strokeWidth={0} />}</span>
          <span className="hk-col hk-grow gap-[4px]">
            <span className="hk-row justify-between"><span className="hk-t">Q3 recap · two hosts</span><span className="hk-s tabular-nums">0:48 / 2:10</span></span>
            <span className="flex items-center justify-between h-[26px]">
              {WAVE.map((v, i) => <i key={i} className="w-[3px] shrink-0 rounded-full" style={{ height: `${Math.min(v, 100)}%`, background: i < 28 ? "var(--k-blue)" : "var(--k-edge-2)" }} />)}
            </span>
          </span>
        </div>
      )}
      {t === "Slides" && (
        <div className="grid grid-cols-3 gap-[8px]">
          {["Atlas reached 1,240 teams", "Churn fell in NA", "Next: annual tier"].map((s, i) => (
            <div key={s} className="h-[96px] rounded-[var(--hk-r-md)] p-[10px] hk-col justify-between border border-[var(--k-edge)]" style={i === 0 ? { background: "#10213d", color: "#fff" } : { background: "var(--k-soft)" }}>
              <span className="text-[11px] font-semibold uppercase tracking-[.06em] opacity-70">Slide {i + 1}</span><span className="text-[12.5px] leading-[16px] font-semibold">{s}</span>
            </div>
          ))}
        </div>
      )}
      {t === "Video" && (
        <div className="hk-col gap-[8px]">
          <div className="h-[170px] rounded-[var(--hk-r-lg)] relative overflow-hidden" style={{ background: "linear-gradient(160deg,#1b2a44,#2f4f7a 55%,#6b8fb8)" }}>
            <span className="absolute inset-0 grid place-items-center"><span className="grid place-items-center size-[52px] rounded-full bg-white/90 text-[#293247]"><Play size={20} fill="currentColor" strokeWidth={0} /></span></span>
            <span className="absolute left-[12px] bottom-[12px] text-white text-[12px] font-semibold">0:14 / 0:40 · 1080p</span>
            <span className="absolute left-0 right-0 bottom-0 h-[3px] bg-white/25"><i className="block h-full w-[35%] bg-white" /></span>
          </div>
          <div className="grid grid-cols-4 gap-[6px]">
            {[["Hook", "0:08"], ["Demo", "0:16"], ["Proof", "0:10"], ["Close", "0:06"]].map(([n, d], i) => (
              <span key={n} className={`rounded-[10px] px-[10px] py-[6px] hk-col border ${i === 1 ? "border-[var(--k-blue)] bg-[var(--k-blue-soft)]" : "border-[var(--k-edge)]"}`}>
                <span className={`text-[12.5px] leading-[17px] font-semibold ${i === 1 ? "hk-blue" : ""}`}>{n}</span>
                <span className={`hk-s !text-[11.5px] !leading-[15px] ${i === 1 ? "!text-[color:var(--k-blue)]" : ""}`}>{i === 1 ? `Playing · ${d}` : d}</span>
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="hk-row gap-[8px]">{o.transcript && <span className="hk-btn hk-btn--sm"><FileText size={13} />Transcript</span>}<span className="hk-btn hk-btn--sm"><Download size={13} />Download</span></div>
    </div>
  );
}

/* Transcript — Otter, Fireflies, Zoom, Granola: speakers, timestamps, pulled-out actions. */
function Transcript({ o }: { o: Props }) {
  const lines: [string, string, string, boolean?][] = [["MR", "Maya", "Let's keep the Team plan at twelve dollars.", false], ["JK", "Jon", "Then billing has to ship before March.", true], ["MR", "Maya", "I'll send the revised quote Friday.", true]];
  return (
    <div className="hk-panel w-[540px] p-[16px] hk-col gap-[12px]">
      <div className="hk-row justify-between"><span className="hk-row gap-[8px]">{o.live && <span className="hk-tag hk-tag--bad"><i className="size-[6px] rounded-full bg-current" />Live</span>}<span className="hk-t">Pricing sync</span></span><span className="hk-s">12:38 – 12:41</span></div>
      <div className="hk-col gap-[10px]">
        {lines.map(([i, n, t, act], k) => (
          <div key={k} className="hk-row !items-start gap-[10px]">
            <Me i={i} />
            <span className="hk-col hk-grow"><span className="hk-s"><b className="text-[color:var(--text-primary)] font-semibold">{n}</b> · 12:{38 + k}</span>
              <span className="hk-b">{o.actions && act ? <span className="hk-hl">{t}</span> : t}</span></span>
          </div>
        ))}
      </div>
      {o.actions && <div className="hk-well px-[12px] py-[8px] hk-row gap-[8px]"><Check size={14} strokeWidth={2.5} className="hk-okc" /><span className="hk-s hk-grow"><b className="text-[color:var(--text-primary)]">2 action items</b> found</span><span className="hk-s hk-link">Add to tasks</span></div>}
    </div>
  );
}

/* Canvas — ChatGPT Canvas, Claude Artifacts, Gemini Canvas, v0: chat left, the work right. */
function Canvas({ o }: { o: Props }) {
  const code = o.kind === "Code";
  // Google Docs style live cursor: a coloured caret with a name flag on top
  const Cur = ({ c, n, side }: { c: string; n: string; side?: boolean }) => { const fg = c.includes("agent") ? "var(--k-on-agent)" : "var(--k-on-blue)"; return side ? (
    <span className="inline-flex items-center align-middle ml-[1px]"><span className="w-[2px] h-[17px]" style={{ background: c }} /><span className="ml-[6px] px-[5px] h-[16px] rounded-[4px] text-[11px] leading-[16px] font-sans font-semibold" style={{ background: c, color: fg }}>{n}</span></span>
  ) : (
    <span className="relative inline-block align-text-bottom w-[2px] h-[1.25em] mx-[1px]" style={{ background: c }}>
      <span className="absolute left-0 -top-[17px] px-[5px] h-[16px] rounded-[4px] rounded-bl-none text-[11px] leading-[16px] font-semibold whitespace-nowrap" style={{ background: c, color: fg }}>{n}</span>
    </span>
  ); };
  const lines: ReactNode[] = [
    <><em>{"// Sign in with email"}</em></>,
    <><b>export function</b> LoginForm() {"{"}</>,
    <>  <b>const</b> [email, setEmail] = useState(<i>&quot;&quot;</i>);</>,
    <>  <b>const</b> [busy, setBusy] = useState(<b>false</b>);</>,
    <>  <b>return</b> (</>,
    <>    &lt;Form onSubmit={"{"}signIn{"}"} disabled={"{"}busy{"}"}&gt;</>,
    <>      &lt;Input type=<i>&quot;email&quot;</i> value={"{"}email{"}"} /&gt;</>,
    <>    &lt;/Form&gt;</>,
    <>  );</>,
    <>{"}"}</>,
  ];
  const changed = [3, 5];
  return (
    <div className="hk-panel w-[700px] h-[400px] overflow-hidden flex">
      {o.chat && (
        <div className="w-[230px] shrink-0 border-r border-[var(--k-edge)] p-[14px] hk-col gap-[12px]">
          <span className="hk-bubble self-end !text-[13px] !leading-[18px]">{code ? "Disable the form while it signs in" : "Make the intro warmer"}</span>
          <div className="hk-col gap-[6px]">
            <span className="hk-row gap-[6px] hk-s font-medium"><Sparkle size={13} className="hk-blue" />Atlas</span>
            <p className="text-[13px] leading-[19px]">{code ? "Adding a busy state so people can't send twice." : "Rewriting the opening so it sounds like a person, not a press release."}</p>
            <span className="hk-row gap-[6px] hk-s !text-[12px]"><Spin s={12} />{code ? "Editing lines 4 and 6" : "Editing paragraph 1"}</span>
          </div>
          <div className="mt-auto hk-row gap-[6px] h-[40px] pl-[14px] pr-[4px] rounded-[999px] border border-[var(--k-edge-2)]">
            <span className="hk-grow text-[13px] hk-faint">Ask for a change</span>
            <span className="hk-send !w-[30px] !h-[30px] opacity-40"><ArrowUp size={15} strokeWidth={2.25} /></span>
          </div>
        </div>
      )}
      <div className="hk-grow hk-col min-w-0">
        <div className="hk-row justify-between h-[48px] px-[14px] border-b border-[var(--k-edge)] shrink-0">
          <span className="hk-row gap-[8px] min-w-0">
            {code ? <Code2 size={15} className="hk-faint" /> : <FileText size={15} className="hk-faint" />}
            <span className="hk-t !text-[13.5px] truncate">{code ? "LoginForm.tsx" : "Launch note"}</span>
            <span className="hk-row gap-[2px] hk-s !text-[12px]">v3<ChevronDown size={12} /></span>
          </span>
          <span className="hk-row gap-[8px] shrink-0">
            {o.cursors && (
              <span className="hk-row">
                <span className="w-[24px] h-[24px] rounded-full grid place-items-center text-white ring-2 ring-[var(--k-panel)]" style={{ background: "var(--k-agent)" }}><Sparkle size={12} strokeWidth={2.5} /></span>
                <span className="w-[24px] h-[24px] -ml-[6px] rounded-full grid place-items-center text-[11px] font-semibold ring-2 ring-[var(--k-panel)]" style={{ background: "var(--k-blue)", color: "var(--k-on-blue)" }}>MR</span>
              </span>
            )}
            {code && <span className="hk-btn hk-btn--sm hk-btn--ghost">Preview</span>}
            <span className="hk-btn hk-btn--sm">Share</span>
          </span>
        </div>
        {code ? (
          <div className="hk-grow overflow-hidden py-[10px] font-mono text-[12.5px] leading-[21px]">
            {lines.map((l, i) => (
              <div key={i} className={`flex pr-[14px] ${changed.includes(i) ? "bg-[var(--k-blue-soft)]" : ""}`}>
                <span className="w-[40px] shrink-0 text-right pr-[14px] hk-faint select-none">{i + 1}</span>
                <span className="whitespace-pre hk-code hk-code--plain !p-0 !rounded-none">{l}{o.cursors && i === 5 && <Cur side c="var(--k-agent)" n="Atlas" />}{o.cursors && i === 8 && <Cur side c="var(--k-blue)" n="Maya" />}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="hk-grow overflow-hidden px-[28px] pt-[24px] hk-col gap-[16px]">
            <p className="text-[20px] leading-[26px] font-semibold">Atlas 3 is here</p>
            <p className="text-[14px] leading-[22px]">{o.cursors && <Cur c="var(--k-agent)" n="Atlas" />}<span className="hk-hl">We made Atlas 3 with the people who use it every day, and it shows.</span> It plans its own work, asks before it acts, and shows you why.</p>
            <p className="text-[14px] leading-[22px] text-[color:var(--text-secondary)]">Start with a goal, not a prompt. Atlas breaks it into steps you can edit, then checks in before anything leaves your workspace.</p>
            <p className="text-[14px] leading-[22px] text-[color:var(--text-secondary)]">{o.cursors && <Cur c="var(--k-blue)" n="Maya" />}Atlas 3 is rolling out to every team this week.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* Form fill — Chrome autofill with Gemini, Copilot in Edge forms, Notion AI properties:
   every filled field is marked and shows its source. */
function FormFill({ o }: { o: Props }) {
  const f: [string, string, string, boolean][] = [["Company", "Northwind Traders", "From the contract", true], ["Billing email", "ap@northwind.com", "From the last invoice", true], ["PO number", "", "", false], ["Seats", "48", "From the CRM", true]];
  return (
    <div className="hk-panel w-[500px] p-[18px] hk-col gap-[12px]">
      <div className="hk-row justify-between"><span className="hk-h">New order</span>{o.banner && <span className="hk-ai"><Sparkle size={12} strokeWidth={2.5} className="hk-blue" />3 fields filled by Atlas</span>}</div>
      <div className="grid grid-cols-2 gap-[10px]">
        {f.map(([l, v, src, ai]) => (
          <label key={l} className="hk-col gap-[4px]">
            <span className="hk-s font-medium text-[color:var(--text-primary)]">{l}</span>
            <span className={`hk-field ${ai ? "hk-field--ai" : "hk-field--empty"} ${!ai && o.missing ? "!border-[var(--k-warn)]" : ""}`}>{ai && <Sparkle size={13} className="hk-blue" />}{v || "Needed"}</span>
            {o.sources && <span className="hk-s !text-[11.5px]">{ai ? src : o.missing ? "Atlas couldn't find this" : ""}</span>}
          </label>
        ))}
      </div>
      <div className="hk-row justify-end gap-[8px]"><span className="hk-btn hk-btn--ghost">Clear AI fields</span><span className="hk-btn hk-btn--main">Review and submit</span></div>
    </div>
  );
}

/* Refine menu — Notion AI and Google Docs "Help me write" on a selection, ChatGPT Canvas
   edit menu, Grammarly, Firefly generative fill on a region. */
function RefineMenu({ o }: { o: Props }) {
  const items: [typeof Wand2, string][] = [[Wand2, "Improve writing"], [Minimize2, "Make shorter"], [Expand, "Make longer"], [ListTree, "Turn into bullets"], [Languages, "Translate"]];
  const bar = o.style === "Toolbar";
  return (
    <div className="w-[520px] hk-col gap-[8px]">
      <p className="hk-b w-[480px]">The rollout starts in March. <span className="hk-hl">We are going to be launching the new pricing to every single customer at the same time, which might cause some issues.</span> Support will be ready.</p>
      {/* everything opens just under the selection, on top of the page */}
      <div className="hk-col items-start gap-[8px] pl-[40px]">
        {bar && (
          <div className="hk-pop !p-[4px] hk-row !gap-[2px]">
            <span className="hk-pick hk-pick--on"><Sparkle size={13} />Ask Atlas</span>
            {(["Improve", "Shorter", "Longer"] as const).map((t, i) => { const I = items[i][0]; return <span key={t} className="hk-pick !text-[color:var(--text-primary)]"><I size={13} />{t}</span>; })}
            <span className="hk-pick"><ChevronDown size={13} /></span>
          </div>
        )}
        {!bar && !o.result && (
          <div className="hk-pop w-[250px]">
            {o.ask && <div className="hk-field !h-[36px] mb-[4px] hk-field--empty"><Sparkle size={14} className="hk-blue" />Ask Atlas to edit…</div>}
            {items.map(([I, t], i) => <div key={t} className={`hk-mi ${i === 1 ? "hk-mi--on" : ""}`}><I size={15} strokeWidth={1.9} className="hk-faint" /><span className="hk-grow">{t}</span>{t === "Translate" && <ChevronRight size={14} className="hk-faint" />}</div>)}
          </div>
        )}
        {o.result && (
          <div className="hk-pop !p-[12px] w-[320px] hk-col gap-[8px]">
            <span className="hk-xs">Shorter</span>
            <p className="text-[13.5px] leading-[20px]">New pricing reaches every customer at once, so expect a busy first week.</p>
            <div className="hk-row justify-end !gap-[4px]"><span className="hk-btn hk-btn--sm hk-btn--ghost">Try again</span><span className="hk-btn hk-btn--sm hk-btn--ghost">Discard</span><span className="hk-btn hk-btn--sm hk-btn--main">Replace</span></div>
          </div>
        )}
      </div>
    </div>
  );
}

export const ARTIFACTS: Record<string, Entry> = {
  streaming: { C: Streaming, opts: [sel("state", "State", ["Writing", "Starting", "Stopped", "Done"]), tog("stop", "Stop button"), tog("actions", "Answer actions")], refs: ["ChatGPT", "Claude", "Gemini", "Perplexity"] },
  summary: { C: Summary, opts: [sel("kind", "Type", ["Meeting", "Answer recap", "Task done"]), sel("length", "Length", ["Short", "Detailed"]), tog("tabs", "Tabs", false), tog("ai", "AI label")], refs: ["Zoom AI Companion", "Teams Copilot recap", "Gemini in Meet", "Otter", "Codex task summary"] },
  table: { C: Table, opts: [sel("format", "Format", ["Table", "Cards", "Key-value", "JSON"]), tog("toolbar", "Toolbar"), tog("highlight", "Highlight best"), tog("sheet", "Open in Sheets")], refs: ["ChatGPT data tables", "Gemini export to Sheets", "Notion AI autofill", "OpenAI structured outputs"] },
  chart: { C: Chart, opts: [sel("type", "Type", ["Bar", "Line"]), tog("callout", "Callout"), tog("ask", "Ask about chart", false)], refs: ["ChatGPT data analysis", "Copilot in Excel", "Julius"] },
  variations: { C: Variations, opts: [sel("kind", "Content", ["Text", "Responses", "Palettes", "Images"]), tog("mix", "Mix versions")], refs: ["ChatGPT preference compare", "Midjourney grid", "Adobe Firefly results", "Jasper", "Coolors palettes"] },
  media: { C: Media, opts: [sel("type", "Type", ["Audio", "Slides", "Video"]), tog("playing", "Playing", false), tog("transcript", "Transcript")], refs: ["NotebookLM audio overview", "Gamma", "Gemini video", "Synthesia scenes"] },
  transcript: { C: Transcript, opts: [tog("live", "Live"), tog("actions", "Action items")], refs: ["Otter", "Fireflies", "Granola", "Zoom"] },
  canvas: { C: Canvas, card: 0.38, opts: [sel("kind", "Content", ["Document", "Code"]), tog("chat", "Chat beside"), tog("cursors", "Who is editing")], refs: ["ChatGPT Canvas", "Claude Artifacts", "Gemini Canvas", "v0"] },
  "form-fill": { C: FormFill, opts: [tog("banner", "AI label"), tog("sources", "Field sources"), tog("missing", "Missing field")], refs: ["Gemini in Chrome autofill", "Copilot in Edge", "Notion AI properties"] },
  "refine-menu": { C: RefineMenu, card: 0.48, opts: [sel("style", "Style", ["Menu", "Toolbar"]), tog("ask", "Free-text ask"), tog("result", "Result preview", false)], refs: ["Notion AI", "Google Docs Help me write", "ChatGPT Canvas", "Grammarly"] },
};
