"use client";
import "./previews.css";
import { Fragment, type ComponentType, type ReactNode } from "react";
import { KIT, KitCard, KitPlayground } from "./kit";
import {
  ArrowUp, ArrowUpRight, Bookmark, BookOpen, BellRing, Brain, Calendar, Check, ChevronDown, ChevronLeft, ChevronRight,
  CircleAlert, Copy, CornerDownRight, EyeOff, FileText, FolderGit2, Globe, GripVertical, Hand, HardDrive, Headset, Info,
  ListTodo, LoaderCircle, Lock, Mail, MessageSquare, Mic, Pause, Play, Plus, Receipt, RefreshCw, RotateCcw,
  Search, Sparkle, Square, ThumbsDown, ThumbsUp, Ticket, TriangleAlert, Undo2, Upload, Wrench, X, Zap,
  type LucideIcon,
} from "lucide-react";

// One preview per component in ./catalog, drawn as the real UI at card size (289 × 181).
// Shared parts and colours live in previews.css; copy is real, never placeholder.

const Ag = ({ icon: Icon = Sparkle, lg, dot, live }: { icon?: LucideIcon; lg?: boolean; dot?: string; live?: boolean }) => (
  <span className={`pv-ag ${lg ? "pv-ag--lg" : ""} ${live ? "pv-pulse" : ""}`}>
    <Icon size={lg ? 12 : 9} strokeWidth={2.25} />
    {dot !== undefined && <b className={dot} />}
  </span>
);
const Spin = ({ s = 12 }: { s?: number }) => <LoaderCircle size={s} strokeWidth={2.25} className="pv-spin" />;
const Send = ({ off }: { off?: boolean }) => <span className={`pv-send ${off ? "pv-send--off" : ""}`}><ArrowUp size={12} strokeWidth={2.25} /></span>;
const Dot = ({ c = "var(--pv-blue)" }: { c?: string }) => <span className="mt-[5.5px] size-[4px] shrink-0 rounded-full" style={{ background: c }} />;
const Bullets = ({ items }: { items: string[] }) => (
  <ul className="flex flex-col gap-[4px]">
    {items.map((t) => <li key={t} className="pv-row !items-start gap-[7px] pv-b"><Dot />{t}</li>)}
  </ul>
);
const Bubble = ({ children, small }: { children: ReactNode; small?: boolean }) => (
  <span className={`self-end rounded-[10px] rounded-br-[3px] text-white ${small ? "max-w-[78px] px-[7px] py-[5px] text-[9px] leading-[12px]" : "px-[9px] py-[5px] text-[10px] leading-[14px]"}`}
    style={{ background: "var(--surface-message-person)" }}>{children}</span>
);
// a collaborator's caret with its name flag, as in a shared doc
const Caret = ({ who, c, below }: { who: string; c: string; below?: boolean }) => (
  <span className="relative inline-block w-[1.5px] h-[12px] mx-[1px] align-[-2px]" style={{ background: c }}>
    <span className={`absolute left-0 px-[3px] rounded-[3px] text-[7px] leading-[10px] font-semibold text-white whitespace-nowrap ${below ? "top-[12px] rounded-tl-none" : "-top-[10px] rounded-bl-none"}`} style={{ background: c }}>{who}</span>
  </span>
);
const AskOne = ({ title, sub }: { title: string; sub?: string }) => (
  <div className="pv-row !items-start gap-[7px]">
    <Ag />
    <div className="flex flex-col"><p className="pv-t">{title}</p>{sub && <p className="pv-s">{sub}</p>}</div>
  </div>
);

/* ── Composers ─────────────────────────────────────────────── */

function PromptInput() {
  return (
    <div className="pv-panel w-[252px] p-[10px] flex flex-col gap-[9px]">
      <div className="pv-row"><span className="pv-file"><span><FileText size={10} strokeWidth={2} /></span>churn-q3.pdf<span className="pv-s">2.4 MB</span></span></div>
      <p className="pv-b">Summarise the Q3 churn report and draft three next steps<span className="pv-caret" /></p>
      <div className="pv-row justify-between">
        <div className="pv-row gap-[4px]">
          <span className="pv-ib pv-ib--line"><Plus size={12} strokeWidth={2} /></span>
          <span className="pv-chip"><Zap size={10} strokeWidth={2} />Agent<ChevronDown size={10} strokeWidth={2} /></span>
          <span className="pv-chip pv-chip--soft">Thorough<ChevronDown size={10} strokeWidth={2} /></span>
        </div>
        <div className="pv-row gap-[3px]"><span className="pv-ib"><Mic size={12} strokeWidth={1.9} /></span><Send /></div>
      </div>
    </div>
  );
}

function SourcePicker() {
  const rows: [LucideIcon, string, boolean][] = [[Globe, "The web", true], [HardDrive, "Shared drive", true], [BookOpen, "Team wiki", false]];
  return (
    <div className="relative w-[252px] h-[160px]">
      <div className="pv-panel absolute left-0 top-0 w-[166px] p-[4px]">
        <p className="pv-xs px-[6px] pt-[4px] pb-[4px]">Search in</p>
        {rows.map(([I, t, on]) => (
          <div key={t} className={`pv-row h-[22px] px-[6px] rounded-[6px] ${on ? "" : "pv-mute"}`}>
            <I size={11} strokeWidth={1.9} className="pv-mute" />
            <span className="pv-b flex-1">{t}</span>
            {on && <Check size={11} strokeWidth={2.5} className="pv-bluet" />}
          </div>
        ))}
        <div className="pv-rule my-[3px] mx-[4px]" />
        <div className="pv-row h-[22px] px-[6px] pv-b pv-link"><Plus size={11} strokeWidth={2.25} />Connect apps</div>
      </div>
      <div className="pv-panel absolute left-0 right-0 bottom-0 h-[34px] px-[6px] pv-row">
        <span className="pv-chip pv-chip--sel"><Globe size={10} strokeWidth={2} />2 sources<ChevronDown size={10} strokeWidth={2} /></span>
        <span className="pv-s flex-1">Ask across your sources</span>
        <Send />
      </div>
    </div>
  );
}

function SuggestedPrompts() {
  const asks = ["Draft the launch announcement", "Compare churn in Q2 and Q3", "List the open risks for Atlas"];
  return (
    <div className="w-[248px] flex flex-col gap-[8px]">
      <p className="pv-t !text-[12.5px] !leading-[16px] text-center">What should we work on?</p>
      <div className="flex flex-col gap-[4px]">
        {asks.map((a) => (
          <div key={a} className="pv-panel !rounded-[8px] !shadow-none pv-row justify-between h-[25px] px-[10px]">
            <span className="pv-b">{a}</span><ArrowUpRight size={11} strokeWidth={2} className="pv-faint" />
          </div>
        ))}
      </div>
      <div className="pv-panel pv-row justify-between h-[30px] pl-[10px] pr-[4px]"><span className="pv-s">Ask anything</span><Send off /></div>
    </div>
  );
}

function Suggestions() {
  return (
    <div className="pv-panel w-[256px] p-[10px] flex flex-col gap-[8px]">
      <p className="pv-s pv-row gap-[5px]"><Sparkle size={10} strokeWidth={2.25} className="pv-cyan" /><span>Suggested for <span className="pv-strong">atlas-web</span> right now</span></p>
      <div className="flex flex-wrap gap-[5px]">
        <span className="pv-chip">Close 3 stale issues</span>
        <span className="pv-chip">Review 2 open PRs</span>
        <span className="pv-chip">Draft release notes</span>
      </div>
      <div className="pv-rule" />
      <div className="pv-row justify-between">
        <span className="pv-s">Ask about this project</span>
        <span className="pv-row gap-[3px]"><span className="pv-ib"><Mic size={12} strokeWidth={1.9} /></span><Send off /></span>
      </div>
    </div>
  );
}

function PromptTemplates() {
  const Slot = ({ children }: { children: ReactNode }) => <span className="pv-slot">{children}<ChevronDown size={9} strokeWidth={2.5} /></span>;
  return (
    <div className="pv-panel w-[256px] p-[12px] flex flex-col gap-[9px]">
      <div className="pv-row justify-between"><span className="pv-xs">Template · Status update</span><span className="pv-s">3 of 12</span></div>
      <p className="text-[11.5px] leading-[24px] font-medium">Write a <Slot>short</Slot> update for <Slot>the exec team</Slot> about <Slot>launch risks</Slot></p>
      <div className="pv-row justify-end gap-[6px]"><span className="pv-btn">Browse</span><span className="pv-btn pv-btn--main">Use template</span></div>
    </div>
  );
}

function ExampleGallery() {
  const Tile = ({ cap, children }: { cap: string; children: ReactNode }) => (
    <div className="pv-panel overflow-hidden flex flex-col">
      <div className="h-[72px] p-[8px] border-b border-[color:var(--pv-edge)]" style={{ background: "var(--pv-soft)" }}>{children}</div>
      <p className="pv-s pv-strong px-[7px] pt-[6px] pb-[7px] !leading-[12px] h-[38px]">{cap}</p>
    </div>
  );
  return (
    <div className="w-[262px] flex flex-col gap-[8px]">
      <div className="pv-row justify-between"><span className="pv-t">Start from an example</span><span className="pv-s pv-link">See all</span></div>
      <div className="grid grid-cols-3 gap-[7px]">
        <Tile cap="Weekly KPI chart">
          <div className="flex items-end gap-[4px] h-full">
            {[34, 46, 40, 58, 52, 76].map((h, i) => <i key={i} className="flex-1 rounded-t-[2px]" style={{ height: `${h}%`, background: i === 5 ? "var(--gradient-hax-fill)" : "color-mix(in srgb, var(--pv-blue) 26%, transparent)" }} />)}
          </div>
        </Tile>
        <Tile cap="Vendor comparison">
          <div className="flex flex-col gap-[5px] text-[7px] leading-[9px]">
            {[["Northwind", "$1.2k"], ["Contoso", "$980"], ["Fabrikam", "$1.4k"]].map(([a, b], i) => (
              <div key={a} className="flex justify-between border-b border-[color:var(--pv-edge)] pb-[4px]"><span>{a}</span><span className={i === 1 ? "pv-ok font-semibold" : "pv-mute"}>{b}</span></div>
            ))}
          </div>
        </Tile>
        <Tile cap="Launch checklist">
          <div className="flex flex-col gap-[6px] text-[7.5px] leading-[10px]">
            {[["Final brief", true], ["QA sign-off", true], ["Go live", false]].map(([t, on]) => (
              <div key={t as string} className="flex items-center gap-[4px]">
                <span className={`pv-check !size-[9px] !rounded-[2.5px] ${on ? "pv-check--on" : ""}`}>{on && <Check size={6} strokeWidth={3.5} />}</span>{t}
              </div>
            ))}
          </div>
        </Tile>
      </div>
    </div>
  );
}

/* ── Artifacts ─────────────────────────────────────────────── */

function Streaming() {
  return (
    <div className="pv-panel w-[256px] p-[12px] flex flex-col gap-[8px]">
      <div className="pv-row"><Ag /><span className="pv-t">Agent</span><span className="pv-s pv-row gap-[5px] ml-auto"><span className="pv-typing pv-bluet"><i /><i /><i /></span>Writing</span></div>
      <p className="pv-b">Churn rose 4 points in EMEA after the May price change. Most of the loss came from teams under ten seats, who<span className="pv-caret" /></p>
      <div className="pv-row justify-between"><span className="pv-s">86 words so far</span><span className="pv-btn pv-btn--sm"><Square size={7} fill="currentColor" strokeWidth={0} />Stop</span></div>
    </div>
  );
}

function Summary() {
  return (
    <div className="pv-panel w-[256px] p-[12px] flex flex-col gap-[8px]">
      <div className="pv-row justify-between"><span className="pv-t">Pricing sync · Summary</span><span className="pv-s">42 min</span></div>
      <Bullets items={["The Team plan stays at $12 a seat", "Launch moves to March 18", "Maya sends the revised quote by Friday"]} />
      <div className="pv-row gap-[5px] pt-[1px]"><span className="pv-chip pv-chip--soft">2 decisions</span><span className="pv-chip pv-chip--soft">1 action</span><span className="pv-s pv-link ml-auto">Full notes</span></div>
    </div>
  );
}

function Table() {
  const rows = [["Northwind", "$1,200", "99.9%"], ["Contoso", "$980", "99.5%"], ["Fabrikam", "$1,450", "99.99%"]];
  return (
    <div className="pv-panel w-[262px] overflow-hidden">
      <div className="pv-row justify-between px-[10px] h-[30px] pv-head"><span className="pv-t">Vendor comparison</span><span className="pv-ailabel"><Sparkle size={8} strokeWidth={2.5} />AI table</span></div>
      <div className="grid grid-cols-[1.35fr_1fr_0.8fr]">
        {["Vendor", "Per month", "Uptime"].map((h) => <span key={h} className="pv-xs px-[10px] py-[7px] border-b border-[color:var(--pv-edge)]" style={{ background: "var(--pv-soft)" }}>{h}</span>)}
        {rows.map((r, i) => r.map((v, j) => (
          <span key={`${i}${j}`} className={`pv-b px-[10px] py-[5px] border-b border-[color:var(--pv-edge)] ${j === 0 ? "font-medium" : "pv-mute"} ${i === 1 && j === 1 ? "!text-[color:var(--pv-ok)] font-semibold" : ""}`}>{v}</span>
        )))}
      </div>
      <div className="pv-row justify-between px-[10px] h-[27px]"><span className="pv-s">From 3 quotes in the shared drive</span><span className="pv-s pv-link">Edit</span></div>
    </div>
  );
}

function Chart() {
  const h = [31, 35, 33, 39, 42, 55, 63, 70];
  return (
    <div className="pv-panel w-[262px] p-[11px] flex flex-col gap-[6px]">
      <div className="pv-row justify-between"><span className="pv-t">Weekly active teams</span><span className="pv-s">Last 8 weeks</span></div>
      <div className="relative h-[94px] flex items-end gap-[8px] px-[2px] border-b border-[color:var(--pv-edge)]">
        {[33, 66].map((y) => <i key={y} className="absolute left-0 right-0 border-t border-dashed border-[color:var(--pv-edge)]" style={{ bottom: `${y}%` }} />)}
        {h.map((v, i) => <i key={i} className="relative flex-1 rounded-t-[3px]" style={{ height: `${v}%`, background: i >= 5 ? "var(--gradient-hax-fill)" : "color-mix(in srgb, var(--pv-blue) 22%, transparent)" }} />)}
        <span className="pv-float absolute left-[116px] top-0 px-[7px] h-[18px] pv-row text-[9px] font-semibold">+18% after launch</span>
        <i className="absolute left-[166px] top-[18px] h-[24px] w-px" style={{ background: "var(--stroke-emphasis)" }} />
      </div>
      <div className="pv-row justify-between pv-s"><span>Sep 1</span><span className="pv-row gap-[4px]"><i className="size-[7px] rounded-[2px]" style={{ background: "var(--gradient-hax-fill)" }} />After launch</span><span>Oct 20</span></div>
    </div>
  );
}

function Variations() {
  const opts = ["Ship faster, with fewer hand-offs", "Your team, minus the busywork", "Request to release in a day"];
  return (
    <div className="w-[262px] flex flex-col gap-[7px]">
      <div className="pv-row justify-between"><span className="pv-t">Headline · 3 versions</span><span className="pv-s pv-row gap-[3px]"><RefreshCw size={9} strokeWidth={2.25} />More</span></div>
      <div className="grid grid-cols-3 gap-[6px]">
        {opts.map((t, i) => (
          <div key={t} className={`pv-panel p-[8px] flex flex-col gap-[6px] h-[88px] ${i === 1 ? "pv-pick" : ""}`}>
            <div className="pv-row justify-between"><span className="pv-xs">{"ABC"[i]}</span>{i === 1 && <span className="pv-check pv-check--on"><Check size={8} strokeWidth={3} /></span>}</div>
            <p className="text-[10.5px] leading-[14px] font-semibold">{t}</p>
          </div>
        ))}
      </div>
      <div className="pv-row justify-end gap-[6px]"><span className="pv-btn">Mix A and B</span><span className="pv-btn pv-btn--main">Use B</span></div>
    </div>
  );
}

function Media() {
  const wave = [4, 6, 9, 7, 11, 14, 10, 7, 12, 15, 11, 8, 6, 10, 13, 9, 7, 5, 8, 11, 9, 6, 4, 7, 10, 7, 5, 4];
  return (
    <div className="pv-panel w-[262px] p-[10px] flex flex-col gap-[8px]">
      <p className="pv-b">Here is the launch recap, as audio and as slides.</p>
      <div className="pv-well pv-row gap-[8px] h-[32px] px-[6px]">
        <span className="pv-send"><Play size={9} fill="currentColor" strokeWidth={0} /></span>
        <span className="flex items-center gap-[2px] flex-1 h-[16px]">
          {wave.map((v, i) => <i key={i} className="w-[2px] rounded-full" style={{ height: v, background: i < 11 ? "var(--pv-blue)" : "var(--stroke-strong)" }} />)}
        </span>
        <span className="pv-s">0:48 / 2:10</span>
      </div>
      <div className="grid grid-cols-2 gap-[7px]">
        <div className="h-[60px] rounded-[7px] p-[8px] flex flex-col justify-between text-white" style={{ background: "var(--gradient-hax-fill)" }}>
          <span className="text-[7px] leading-[9px] font-semibold uppercase tracking-[.08em] opacity-80">Q3 recap · 1 of 6</span>
          <span className="text-[10px] leading-[12px] font-semibold">Atlas reached 1,240 teams</span>
        </div>
        <div className="relative h-[60px] rounded-[7px] overflow-hidden grid place-items-center" style={{ background: "linear-gradient(135deg, #1d2a44, #0f1420)" }}>
          <span className="size-[22px] rounded-full bg-white/90 grid place-items-center text-[#293247]"><Play size={9} fill="currentColor" strokeWidth={0} className="ml-[1px]" /></span>
          <span className="absolute left-[7px] bottom-[5px] text-[7.5px] leading-[9px] text-white font-semibold">Product demo</span>
          <span className="absolute right-[7px] bottom-[5px] text-[7.5px] leading-[9px] text-white/70">1:24</span>
        </div>
      </div>
    </div>
  );
}

function Transcript() {
  const Line = ({ me, name, time, text }: { me: string; name: string; time: string; text: string }) => (
    <div className="pv-row !items-start gap-[7px]">
      <span className="pv-me">{me}</span>
      <div className="flex flex-col min-w-0"><span className="pv-s"><span className="pv-strong">{name}</span> · {time}</span><span className="pv-b">{text}</span></div>
    </div>
  );
  return (
    <div className="pv-panel w-[262px] p-[10px] flex flex-col gap-[7px]">
      <div className="pv-row justify-between"><span className="pv-t">Pricing sync</span><span className="pv-s pv-row gap-[5px]"><span className="pv-dot pv-dot--live" />Live · 14:02</span></div>
      <Line me="MK" name="Maya" time="02:14" text="Can we move the launch to the 18th?" />
      <Line me="JT" name="Jon" time="02:31" text="Only if QA can start on the 11th." />
      <div className="pv-well pv-row h-[24px] px-[7px] ml-[25px]"><ListTodo size={11} strokeWidth={2} className="pv-bluet" /><span className="pv-b pv-trunc flex-1">Action: book QA for March 11</span><span className="pv-s">Jon</span></div>
    </div>
  );
}

function Canvas() {
  return (
    <div className="pv-panel w-[268px] h-[150px] flex overflow-hidden">
      <div className="w-[94px] shrink-0 border-r border-[color:var(--pv-edge)] p-[7px] flex flex-col gap-[7px]" style={{ background: "var(--pv-soft)" }}>
        <Bubble small>Make the intro shorter</Bubble>
        <span className="pv-row !items-start gap-[5px]"><Ag /><span className="text-[9px] leading-[12px]">Done. I cut it to two sentences.</span></span>
        <span className="mt-auto pv-field !h-[20px] text-[8.5px] pv-faint">Reply</span>
      </div>
      <div className="flex-1 p-[11px] flex flex-col gap-[6px]">
        <span className="pv-xs">Launch brief</span>
        <p className="text-[12px] leading-[15px] font-semibold">Atlas is live</p>
        <p className="text-[9.5px] leading-[15px] pv-mute" style={{ marginTop: 8 }}><Caret who="Agent" c="#ff6d2d" /><span className="pv-hl pv-hl--agent !text-[color:var(--text-primary)]">Atlas turns a request into finished work in a day.</span> Pilot teams cut hand-offs in half and shipped twice as often.<Caret who="You" c="#187adc" below /></p>
      </div>
    </div>
  );
}

function FormFill() {
  const F = ({ l, v, warn }: { l: string; v: string; warn?: boolean }) => (
    <div className="grid grid-cols-[62px_1fr] items-center gap-[6px]">
      <span className="pv-s">{l}</span>
      <span className="pv-field pv-field--ai"><span className="flex-1 pv-trunc">{v}</span>{warn ? <TriangleAlert size={10} strokeWidth={2.25} className="pv-warn" /> : <Sparkle size={9} strokeWidth={2.25} className="pv-cyan" />}</span>
    </div>
  );
  return (
    <div className="pv-panel w-[256px] p-[11px] flex flex-col gap-[7px]">
      <div className="pv-row justify-between"><span className="pv-t">New renewal</span><span className="pv-s pv-row gap-[4px]"><Sparkle size={9} strokeWidth={2.25} className="pv-cyan" />Filled by the agent</span></div>
      <F l="Company" v="Northwind Traders" />
      <F l="Value" v="$48,000 a year" />
      <F l="Renews on" v="March 1, 2027" warn />
      <div className="pv-row justify-between pt-[2px]"><span className="pv-s pv-warn">Check 1 date</span><span className="pv-row gap-[5px]"><span className="pv-btn">Clear</span><span className="pv-btn pv-btn--main">Accept all</span></span></div>
    </div>
  );
}

function RefineMenu() {
  const Sep = () => <span className="w-px h-[12px] bg-white/25 mx-[2px]" />;
  return (
    <div className="relative w-[262px] pt-[36px]">
      <div className="pv-float absolute left-[18px] top-0 pv-row !gap-[1px] p-[3px] text-[9px] font-medium">
        {["Shorter", "Longer", "Bullets"].map((t) => <span key={t} className="px-[7px] h-[20px] grid place-items-center rounded-[6px]">{t}</span>)}
        <Sep />
        <span className="px-[7px] h-[20px] pv-row !gap-[3px] rounded-[6px] bg-white/15">Tone<ChevronDown size={9} strokeWidth={2.25} /></span>
        <Sep />
        <span className="px-[7px] h-[20px] pv-row !gap-[3px]"><Sparkle size={9} strokeWidth={2.25} />Ask</span>
      </div>
      <span className="absolute left-[46px] top-[25px] size-[8px] rotate-45 rounded-[1.5px]" style={{ background: "var(--surface-inverse)" }} />
      <div className="pv-panel p-[11px]">
        <p className="pv-b">The pilot ran for six weeks across four teams. <span className="pv-hl">Most people said setup took longer than expected, mainly because of the data import.</span> Weekly use stayed above 80%.</p>
      </div>
    </div>
  );
}

/* ── Collectors ────────────────────────────────────────────── */

function ClarifyingQuestion() {
  const opts = ["North America", "EMEA", "All regions"];
  return (
    <div className="pv-panel w-[252px] p-[11px] flex flex-col gap-[8px]">
      <AskOne title="Which region should the report cover?" sub="I found data for three." />
      <div className="flex flex-col gap-[3px]">
        {opts.map((o, i) => <div key={o} className={`pv-opt ${i === 1 ? "pv-opt--on" : ""}`}><span className={`pv-radio ${i === 1 ? "pv-radio--on" : ""}`} /><span className="pv-b">{o}</span></div>)}
      </div>
      <div className="pv-row justify-between"><span className="pv-s">Or type your own</span><span className="pv-btn pv-btn--main">Continue</span></div>
    </div>
  );
}

function ChoicePicker() {
  const slots = [["Tue 17", "10:00"], ["Wed 18", "14:30"], ["Thu 19", "09:00"]];
  return (
    <div className="pv-panel w-[252px] p-[11px] flex flex-col gap-[9px]">
      <AskOne title="When should I book the review?" sub="All five people are free at these times." />
      <div className="grid grid-cols-3 gap-[6px]">
        {slots.map(([d, t], i) => (
          <div key={d} className={`pv-slotcard ${i === 1 ? "pv-slotcard--on" : ""}`}>
            <span className="text-[8.5px] leading-[11px] font-semibold opacity-75">{d} Nov</span>
            <span className="text-[13px] leading-[16px] font-semibold">{t}</span>
            <span className="text-[8.5px] leading-[11px] opacity-75">45 min</span>
          </div>
        ))}
      </div>
      <div className="pv-row justify-between"><span className="pv-s pv-link">Other times</span><span className="pv-btn pv-btn--main">Book Wednesday</span></div>
    </div>
  );
}

function FormRequest() {
  return (
    <div className="pv-panel w-[256px] p-[11px] flex flex-col gap-[7px]">
      <AskOne title="I need three details to file this expense." />
      <div className="grid grid-cols-2 gap-[6px]">
        <div className="flex flex-col gap-[3px]"><span className="pv-s">Amount</span><span className="pv-field"><span className="pv-mute">$</span><span className="pv-caret !h-[10px] !ml-0" /><span className="pv-faint">0.00</span></span></div>
        <div className="flex flex-col gap-[3px]"><span className="pv-s">Category</span><span className="pv-field justify-between">Travel<ChevronDown size={10} strokeWidth={2} className="pv-mute" /></span></div>
      </div>
      <div className="flex flex-col gap-[3px]"><span className="pv-s">Receipt</span><span className="pv-drop"><Upload size={10} strokeWidth={2} />Drop a photo or PDF</span></div>
      <div className="pv-row justify-end"><span className="pv-btn pv-btn--main">Send details</span></div>
    </div>
  );
}

function Feedback() {
  return (
    <div className="w-[256px] flex flex-col gap-[7px]">
      <div className="pv-panel p-[10px] flex flex-col gap-[5px]">
        <p className="pv-b">Churn is up 4 points this quarter, mostly in EMEA.</p>
        <div className="pv-row !gap-[1px] -ml-[4px]">
          <span className="pv-ib"><ThumbsUp size={11} strokeWidth={1.9} /></span>
          <span className="pv-ib pv-ib--on"><ThumbsDown size={11} strokeWidth={1.9} fill="currentColor" /></span>
          <span className="pv-ib"><Copy size={11} strokeWidth={1.9} /></span>
          <span className="pv-ib"><RotateCcw size={11} strokeWidth={1.9} /></span>
        </div>
      </div>
      <div className="pv-panel p-[10px] flex flex-col gap-[7px]">
        <div className="pv-row justify-between"><span className="pv-t">What went wrong?</span><X size={11} strokeWidth={2} className="pv-faint" /></div>
        <div className="flex flex-wrap gap-[5px]"><span className="pv-chip">Not accurate</span><span className="pv-chip pv-chip--on">Missed context</span><span className="pv-chip">Too long</span></div>
      </div>
    </div>
  );
}

/* ── Controllers ───────────────────────────────────────────── */

function StopAndPause() {
  return (
    <div className="pv-panel w-[256px] p-[12px] flex flex-col gap-[9px]">
      <div className="pv-row"><Spin /><span className="pv-t flex-1">Updating 48 records in the CRM</span></div>
      <div className="flex flex-col gap-[5px]"><div className="pv-bar"><i style={{ width: "38%" }} /></div><span className="pv-s">18 of 48 · about a minute left</span></div>
      <div className="pv-well px-[8px] py-[5px] pv-s">Just updated <span className="pv-strong">Northwind Traders</span></div>
      <div className="pv-row justify-end gap-[6px]">
        <span className="pv-btn"><Pause size={9} fill="currentColor" strokeWidth={0} />Pause</span>
        <span className="pv-btn pv-bad"><Square size={7} fill="currentColor" strokeWidth={0} />Stop</span>
      </div>
    </div>
  );
}

function Capabilities() {
  const rows: [LucideIcon, string, string, string][] = [
    [HardDrive, "Shared drive", "Read", ""], [MessageSquare, "Team chat", "Read and post", ""],
    [Ticket, "Issue tracker", "Ask first", "warn"], [Mail, "Email", "Off", "off"],
  ];
  return (
    <div className="pv-panel w-[262px] p-[10px] flex flex-col gap-[3px]">
      <div className="pv-row justify-between pb-[3px]"><span className="pv-t">What this agent can use</span><span className="pv-s pv-link pv-row !gap-[2px]"><Plus size={9} strokeWidth={2.5} />Connect</span></div>
      {rows.map(([I, n, p, k]) => (
        <div key={n} className="pv-row h-[22px]">
          <span className="pv-appic"><I size={11} strokeWidth={1.9} /></span>
          <span className={`pv-b flex-1 ${k === "off" ? "pv-faint" : ""}`}>{n}</span>
          <span className={`pv-chip !h-[18px] !px-[7px] !text-[9px] ${k === "warn" ? "pv-warn" : ""} ${k === "off" ? "pv-faint" : ""}`}>{p}<ChevronDown size={9} strokeWidth={2} /></span>
        </div>
      ))}
      <p className="pv-s pv-row gap-[4px] pt-[7px] border-t border-[color:var(--pv-edge)]" style={{ marginTop: 4 }}><Lock size={9} strokeWidth={2.25} />It can't delete files or send payments</p>
    </div>
  );
}

function Memory() {
  const items = ["Prefers answers as short bullet points", "Works on the Growth team", "Sends the weekly report on Fridays"];
  return (
    <div className="pv-panel w-[256px] p-[10px] flex flex-col gap-[6px]">
      <div className="pv-row justify-between"><span className="pv-t">What I remember about you</span><span className="pv-switch pv-switch--on" /></div>
      {items.map((t) => <div key={t} className="pv-well !rounded-[7px] pv-row h-[24px] px-[8px]"><span className="pv-b flex-1 pv-trunc">{t}</span><X size={10} strokeWidth={2.25} className="pv-faint" /></div>)}
      <div className="pv-row justify-between pt-[2px]"><span className="pv-s pv-row gap-[4px]"><EyeOff size={10} strokeWidth={2} />Temporary chat, nothing saved</span><span className="pv-switch" /></div>
    </div>
  );
}

function Checkpoints() {
  return (
    <div className="w-[256px] flex flex-col gap-[8px]">
      <Bubble>Rename the billing tables</Bubble>
      <div className="pv-row gap-[6px]">
        <span className="h-px flex-1" style={{ background: "var(--pv-edge)" }} />
        <span className="pv-chip !h-[22px]"><Bookmark size={10} strokeWidth={2.25} className="pv-bluet" />Checkpoint · 10:42</span>
        <span className="pv-btn pv-btn--sm"><Undo2 size={9} strokeWidth={2.5} />Restore</span>
        <span className="h-px flex-1" style={{ background: "var(--pv-edge)" }} />
      </div>
      <div className="pv-panel p-[10px] flex flex-col gap-[6px]">
        <div className="pv-row"><Ag /><span className="pv-t">Agent</span><span className="ml-auto pv-row !gap-[2px] pv-s"><ChevronLeft size={10} strokeWidth={2.25} />2 of 3<ChevronRight size={10} strokeWidth={2.25} /></span></div>
        <p className="pv-b">I renamed 4 tables and updated the 6 queries that use them.</p>
      </div>
    </div>
  );
}

/* ── Approvals ─────────────────────────────────────────────── */

function ApprovalCard() {
  const kv = [["To", "Acme, Globex and Initech"], ["Cost", "About 2 credits"], ["Undo", "Up to 5 minutes after sending"]];
  return (
    <div className="pv-panel w-[256px] overflow-hidden">
      <div className="p-[11px] flex flex-col gap-[8px]">
        <div className="pv-row"><Ag /><span className="pv-t">Send 3 renewal emails?</span></div>
        <div className="grid grid-cols-[34px_1fr] gap-x-[8px] gap-y-[4px]">
          {kv.map(([k, v]) => <Fragment key={k}><span className="pv-s !leading-[15px]">{k}</span><span className="pv-b">{v}</span></Fragment>)}
        </div>
      </div>
      <div className="pv-row justify-between px-[11px] h-[38px] pv-foot">
        <span className="pv-btn pv-btn--quiet">Reject</span>
        <span className="pv-row gap-[5px]"><span className="pv-btn">Edit</span><span className="pv-btn pv-btn--main"><Check size={10} strokeWidth={2.5} />Approve and send</span></span>
      </div>
    </div>
  );
}

function PermissionRequest() {
  return (
    <div className="pv-panel w-[262px] p-[10px] flex flex-col gap-[8px]">
      <div className="pv-row"><span className="pv-appic"><FolderGit2 size={11} strokeWidth={1.9} /></span><div className="flex flex-col"><span className="pv-t">Use the code repo?</span><span className="pv-s">The agent wants to open a pull request</span></div></div>
      <div className="pv-code"><b>create_pull_request</b>{"(\n  "}<em>repo:</em> <i>&quot;atlas/web&quot;</i>{",\n  "}<em>title:</em> <i>&quot;Fix token refresh&quot;</i>{"\n)"}</div>
      <div className="pv-row justify-between"><span className="pv-btn pv-btn--quiet">Deny</span><span className="pv-row gap-[5px]"><span className="pv-btn">Always allow</span><span className="pv-btn pv-btn--main">Allow once</span></span></div>
    </div>
  );
}

function PreviewBeforeRun() {
  return (
    <div className="pv-panel w-[262px] p-[10px] flex flex-col gap-[7px]">
      <div className="pv-row justify-between"><span className="pv-t">Tag 240 support tickets</span><span className="pv-s">Sample 1 of 240</span></div>
      <div className="pv-well p-[8px] flex flex-col gap-[5px]">
        <div className="pv-row justify-between"><span className="pv-s"><span className="pv-strong">#4821</span> · Northwind</span><span className="pv-s">2h ago</span></div>
        <p className="pv-b">&ldquo;I can&apos;t export invoices to CSV since this morning.&rdquo;</p>
        <div className="pv-row !gap-[4px]"><span className="pv-chip !h-[18px]">Billing</span><span className="pv-chip !h-[18px]">Bug</span><span className="pv-chip !h-[18px] pv-warn">High priority</span></div>
      </div>
      <div className="pv-row justify-between"><span className="pv-s pv-link pv-row !gap-[3px]"><RefreshCw size={9} strokeWidth={2.25} />Another sample</span><span className="pv-btn pv-btn--main">Run on all 240</span></div>
    </div>
  );
}

function DiffView() {
  const L = ({ k, t, act }: { k: "ctx" | "del" | "add"; t: string; act?: boolean }) => (
    <div className={`pv-dl pv-dl--${k}`}>
      <span className="w-[8px] shrink-0 font-semibold">{k === "del" ? "−" : k === "add" ? "+" : ""}</span>
      <span className="flex-1 pv-trunc">{t}</span>
      {act && <span className="pv-row !gap-[3px]"><span className="pv-dlbtn pv-ok"><Check size={8} strokeWidth={3} /></span><span className="pv-dlbtn pv-bad"><X size={8} strokeWidth={3} /></span></span>}
    </div>
  );
  return (
    <div className="pv-panel w-[262px] overflow-hidden">
      <div className="pv-row justify-between px-[10px] h-[27px] pv-head"><span className="pv-row !gap-[5px] pv-t"><FileText size={11} strokeWidth={2} />pricing.md</span><span className="pv-s"><span className="pv-ok font-semibold">+2</span> <span className="pv-bad font-semibold">−2</span></span></div>
      <div className="py-[4px]">
        <L k="ctx" t="## Team plan" />
        <L k="del" t="$14 per seat, billed monthly" />
        <L k="add" t="$12 per seat, billed yearly" act />
        <L k="ctx" t="Up to 5 agents per workspace" />
        <L k="del" t="Email support" />
        <L k="add" t="Chat and email support" act />
      </div>
      <div className="pv-row justify-end gap-[5px] px-[10px] h-[32px] pv-foot"><span className="pv-btn pv-btn--sm">Reject all</span><span className="pv-btn pv-btn--sm pv-btn--main">Accept all</span></div>
    </div>
  );
}

/* ── Workflows ─────────────────────────────────────────────── */

function Plan() {
  const steps: [string, boolean][] = [["Pull 90 days of support tickets", false], ["Group them by theme", false], ["Draft a summary for review", false], ["Post it to #support-leads", true]];
  return (
    <div className="pv-panel w-[256px] p-[10px] flex flex-col gap-[4px]">
      <div className="pv-row justify-between pb-[3px]"><span className="pv-t">Plan · 4 steps</span><span className="pv-s">About 3 min</span></div>
      {steps.map(([t, ask], i) => (
        <div key={t} className="pv-well !rounded-[7px] pv-row !gap-[5px] h-[21px] pl-[3px] pr-[7px]">
          <GripVertical size={10} strokeWidth={2} className="pv-faint" />
          <span className="pv-num">{i + 1}</span>
          <span className="pv-b flex-1 pv-trunc">{t}</span>
          {ask && <span className="pv-s pv-warn pv-row !gap-[3px]"><Lock size={9} strokeWidth={2.25} />Asks first</span>}
        </div>
      ))}
      <div className="pv-row justify-between pt-[4px]"><span className="pv-s pv-link pv-row !gap-[2px]"><Plus size={9} strokeWidth={2.5} />Add step</span><span className="pv-row gap-[5px]"><span className="pv-btn">Edit</span><span className="pv-btn pv-btn--main"><Play size={8} fill="currentColor" strokeWidth={0} />Run plan</span></span></div>
    </div>
  );
}

function TaskList() {
  const tasks: [string, string, string, boolean][] = [["Send the revised quote", "MK", "Fri", true], ["Book QA for March 11", "JT", "Mon", false], ["Update the launch roadmap", "SR", "Wed", false]];
  return (
    <div className="pv-panel w-[262px] p-[10px] flex flex-col">
      <div className="pv-row justify-between pb-[7px]"><div className="flex flex-col"><span className="pv-t">3 tasks from Pricing sync</span><span className="pv-s">Created by the agent</span></div><span className="pv-btn pv-btn--sm">Send to tracker</span></div>
      {tasks.map(([n, who, due, done]) => (
        <div key={n} className="pv-row h-[27px] border-t border-[color:var(--pv-edge)]">
          <span className={`pv-check ${done ? "pv-check--on" : ""}`}>{done && <Check size={8} strokeWidth={3} />}</span>
          <span className={`pv-b flex-1 pv-trunc ${done ? "line-through pv-faint" : ""}`}>{n}</span>
          <span className="pv-me">{who}</span>
          <span className="pv-chip pv-chip--soft !h-[18px] !px-[6px] !gap-[3px] w-[44px] justify-center"><Calendar size={8} strokeWidth={2.25} />{due}</span>
        </div>
      ))}
    </div>
  );
}

function HandOff() {
  const Node = ({ icon, name, state, live }: { icon: LucideIcon; name: string; state: string; live?: boolean }) => (
    <div className="flex flex-col items-center gap-[3px] w-[60px]">
      <Ag icon={icon} lg live={live} />
      <span className="pv-s pv-strong text-center !leading-[11px]">{name}</span>
      <span className="text-[8px] leading-[10px] pv-faint">{state}</span>
    </div>
  );
  const Link = ({ dashed }: { dashed?: boolean }) => (
    <span className="relative flex-1 h-[1.5px] -mt-[22px]" style={{ background: dashed ? "repeating-linear-gradient(90deg, var(--stroke-strong) 0 3px, transparent 3px 6px)" : "var(--gradient-hax)" }}>
      <ChevronRight size={9} strokeWidth={2.5} className="absolute -right-[4px] -top-[4px] pv-faint" />
    </span>
  );
  return (
    <div className="w-[262px] flex flex-col gap-[9px]">
      <div className="pv-row !gap-[2px] px-[2px]">
        <Node icon={Search} name="Research" state="Done" />
        <Link />
        <Node icon={Receipt} name="Billing" state="Working" live />
        <Link dashed />
        <div className="flex flex-col items-center gap-[3px] w-[60px]"><span className="pv-me pv-me--lg">FN</span><span className="pv-s pv-strong !leading-[11px]">Finance</span><span className="text-[8px] leading-[10px] pv-faint">Signs off</span></div>
      </div>
      <div className="pv-panel p-[10px] flex flex-col gap-[6px]">
        <div className="pv-row"><span className="pv-t">Passed to the Billing agent</span><span className="pv-s ml-auto">2 min ago</span></div>
        <p className="pv-s">It needs invoice access to finish the refund, then hands back to Finance.</p>
        <div className="pv-row justify-between"><span className="pv-s pv-row !gap-[4px]"><Spin s={10} />Billing agent is working</span><span className="pv-btn pv-btn--sm">Take over</span></div>
      </div>
    </div>
  );
}

function ProgressSteps() {
  const Step = ({ s, t, last, children }: { s: "done" | "run" | "todo"; t: string; last?: boolean; children?: ReactNode }) => (
    <div className="flex gap-[8px]">
      <div className="flex flex-col items-center">
        {s === "done" ? <span className="pv-stepic pv-stepic--done"><Check size={8} strokeWidth={3} /></span> : s === "run" ? <span className="grid place-items-center size-[14px]"><Spin s={13} /></span> : <span className="pv-stepic" />}
        {!last && <span className="w-px flex-1 my-[2px]" style={{ background: "var(--pv-edge)" }} />}
      </div>
      <div className={`flex flex-col ${last ? "" : "pb-[9px]"}`}>
        <span className={`pv-b ${s === "todo" ? "pv-faint" : ""} ${s === "run" ? "pv-strong" : ""}`}>{t}</span>
        {children}
      </div>
    </div>
  );
  return (
    <div className="pv-panel w-[256px] p-[11px] flex flex-col">
      <div className="pv-row justify-between pb-[9px]"><span className="pv-t">Reviewing renewal contracts</span><span className="pv-s pv-mono">1:12</span></div>
      <Step s="done" t="Read 12 contracts from the shared drive" />
      <Step s="run" t="Comparing renewal terms"><span className="pv-row mt-[4px]"><span className="pv-bar w-[96px]"><i style={{ width: "58%" }} /></span><span className="pv-s">7 of 12</span></span></Step>
      <Step s="todo" t="Draft the summary" last />
    </div>
  );
}

function WorkflowCanvas() {
  const N = ({ x, y, icon: I, kind, name, on, warn }: { x: number; y: number; icon: LucideIcon; kind: string; name: string; on?: boolean; warn?: boolean }) => (
    <div className={`pv-node ${on ? "pv-node--on" : ""}`} style={{ left: x, top: y }}>
      <span className="pv-appic !size-[18px] !rounded-[5px]" style={warn ? { color: "var(--pv-warn)" } : undefined}><I size={10} strokeWidth={2} /></span>
      <span className="flex flex-col min-w-0"><span className="text-[7.5px] leading-[9px] font-semibold uppercase tracking-[.06em] pv-faint">{kind}</span><span className="text-[9.5px] leading-[12px] font-semibold pv-trunc">{name}</span></span>
    </div>
  );
  // a ticket comes in, the agent drafts a reply, and anything it is unsure of goes to a person first
  return (
    <div className="relative w-[262px] h-[146px]">
      <svg className="absolute inset-0" width="262" height="146" viewBox="0 0 262 146" fill="none">
        <defs>
          <marker id="pv-arrow" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L6 3L0 6Z" fill="var(--stroke-strong)" /></marker>
        </defs>
        <path d="M106 23H148" stroke="var(--surface-accent)" strokeWidth="1.5" className="pv-flow" markerEnd="url(#pv-arrow)" />
        <path d="M209 43V98" stroke="var(--stroke-strong)" strokeWidth="1.25" markerEnd="url(#pv-arrow)" />
        <path d="M156 123H112" stroke="var(--stroke-strong)" strokeWidth="1.25" markerEnd="url(#pv-arrow)" />
        <path d="M168 43C168 78 52 66 52 98" stroke="var(--stroke-strong)" strokeWidth="1.25" strokeDasharray="3 3" markerEnd="url(#pv-arrow)" />
      </svg>
      <N x={0} y={3} icon={Zap} kind="Trigger" name="New ticket" />
      <N x={156} y={3} icon={Sparkle} kind="Agent" name="Draft reply" on />
      <span className="absolute left-[95px] top-[64px] pv-chip !h-[16px] !px-[6px] !text-[8px] pv-mute">Sure</span>
      <span className="absolute left-[187px] top-[62px] pv-chip !h-[16px] !px-[6px] !text-[8px] pv-warn">Not sure</span>
      <N x={156} y={103} icon={Hand} kind="Person" name="Review" warn />
      <N x={0} y={103} icon={Mail} kind="Action" name="Send reply" />
    </div>
  );
}

/* ── Explorers ─────────────────────────────────────────────── */

function Reasoning() {
  const lines = ["Churn is up 4 points. Which plans moved?", "EMEA Team plan fell right after the May price change.", "Check Q2 first, so a seasonal dip isn't the cause."];
  return (
    <div className="w-[256px] flex flex-col gap-[8px]">
      <div className="pv-row !gap-[5px] pv-s"><Brain size={11} strokeWidth={1.9} /><span className="pv-strong !font-medium">Thought for 12 seconds</span><ChevronDown size={10} strokeWidth={2} /></div>
      <div className="flex flex-col gap-[5px] border-l-[2px] border-[color:var(--pv-edge)] pl-[10px] ml-[5px]">
        {lines.map((l) => <p key={l} className="pv-s">{l}</p>)}
      </div>
      <div className="pv-panel p-[10px]"><p className="pv-b">EMEA drove most of the rise. It started the week the new prices went live.</p></div>
    </div>
  );
}

function Sources() {
  const src: [LucideIcon, string, string][] = [[FileText, "Q3 churn report", "Shared drive"], [BookOpen, "May pricing change", "Team wiki"], [Globe, "SaaS retention benchmark", "Web"]];
  return (
    <div className="pv-panel w-[262px] p-[10px] flex flex-col gap-[7px]">
      <p className="pv-b">Churn rose 4 points in EMEA<span className="pv-cite">1</span>, mostly on the Team plan after the May price change<span className="pv-cite">2</span>. That is above the industry norm<span className="pv-cite">3</span>.</p>
      <div className="pv-rule" />
      <div className="flex flex-col gap-[3px]">
        {src.map(([I, t, w], i) => (
          <div key={t} className="pv-row h-[19px]"><span className="pv-cite !m-0">{i + 1}</span><I size={10} strokeWidth={2} className="pv-mute" /><span className="pv-b pv-trunc flex-1">{t}</span><span className="pv-s">{w}</span></div>
        ))}
      </div>
    </div>
  );
}

function Confidence() {
  const rows: [string, number, string, string, string][] = [
    ["Churn rose 4 points in EMEA", 3, "High", "ok", "3 sources agree"],
    ["The May price change caused it", 2, "Medium", "warn", "1 source, not yet confirmed"],
    ["It will recover by Q4", 1, "Low", "bad", "A guess from past quarters"],
  ];
  return (
    <div className="pv-panel w-[256px] px-[11px] pt-[10px] pb-[4px] flex flex-col">
      <span className="pv-xs pb-[4px]">How sure the agent is</span>
      {rows.map(([t, n, l, k, why], i) => (
        <div key={t} className={`flex flex-col gap-[3px] py-[6px] ${i ? "border-t border-[color:var(--pv-edge)]" : ""}`}>
          <span className="pv-b pv-strong !font-medium">{t}</span>
          <span className="pv-row !gap-[6px]">
            <span className="pv-row !gap-[2px]">{[0, 1, 2].map((j) => <i key={j} className="w-[9px] h-[4px] rounded-full" style={{ background: j < n ? `var(--pv-${k})` : "var(--surface-tint-hover)" }} />)}</span>
            <span className={`pv-s font-semibold pv-${k}`}>{l}</span>
            <span className="pv-s">· {why}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

function ActivityLog() {
  const ev: [string, LucideIcon, string][] = [["10:41", FileText, "Read 12 files in /contracts"], ["10:43", Mail, "Sent 3 renewal emails"], ["10:44", Ticket, "Filed issue ENG-412"]];
  return (
    <div className="pv-panel w-[262px] overflow-hidden">
      <div className="px-[10px] py-[8px] pv-head flex flex-col gap-[2px]" style={{ background: "var(--pv-soft)" }}>
        <span className="pv-xs">Session recap</span>
        <p className="pv-b pv-strong">Read 12 files, sent 3 emails, filed 1 issue.</p>
      </div>
      <div className="px-[10px] py-[8px] flex flex-col gap-[6px]">
        {ev.map(([t, I, x]) => (
          <div key={x} className="pv-row"><span className="pv-mono pv-faint w-[28px]">{t}</span><span className="pv-appic !size-[18px]"><I size={10} strokeWidth={2} /></span><span className="pv-b pv-trunc flex-1">{x}</span><Check size={10} strokeWidth={2.5} className="pv-ok" /></div>
        ))}
      </div>
      <div className="px-[10px] pb-[9px]"><span className="pv-s pv-link">View the full log</span></div>
    </div>
  );
}

function ToolCall() {
  return (
    <div className="w-[262px] flex flex-col gap-[6px]">
      <div className="pv-panel overflow-hidden">
        <div className="pv-row justify-between px-[9px] h-[28px]">
          <span className="pv-row"><span className="pv-stepic pv-stepic--done"><Check size={8} strokeWidth={3} /></span><Wrench size={10} strokeWidth={2} className="pv-mute" /><span className="pv-mono pv-strong">tracker.create_issue</span></span>
          <span className="pv-s pv-row !gap-[3px]">1.2s<ChevronDown size={10} strokeWidth={2} /></span>
        </div>
        <div className="px-[8px] pb-[8px] flex flex-col gap-[5px]">
          <div className="pv-code">{"{\n  "}<em>&quot;title&quot;:</em> <i>&quot;Fix token refresh&quot;</i>{",\n  "}<em>&quot;team&quot;:</em> <i>&quot;Platform&quot;</i>{"\n}"}</div>
          <div className="pv-row !gap-[5px] pv-s"><CornerDownRight size={10} strokeWidth={2} />Created <span className="pv-link">ENG-412</span></div>
        </div>
      </div>
      <div className="pv-panel pv-row justify-between px-[9px] h-[28px]">
        <span className="pv-row"><Spin s={13} /><Wrench size={10} strokeWidth={2} className="pv-mute" /><span className="pv-mono">chat.post_message</span></span>
        <span className="pv-s">Running</span>
      </div>
    </div>
  );
}

function Rationale() {
  return (
    <div className="w-[262px] flex flex-col gap-[5px]">
      <div className="pv-panel p-[10px] flex flex-col gap-[5px]" style={{ boxShadow: "inset 3px 0 0 var(--pv-warn), var(--pv-shadow)" }}>
        <div className="pv-row justify-between"><span className="pv-tag pv-tag--warn"><TriangleAlert size={9} strokeWidth={2.5} />Caution</span><span className="pv-s">Medium confidence</span></div>
        <p className="pv-t">This change touches production.</p>
        <p className="pv-s">It edits 3 firewall rules on prod-east. A similar change in May caused 4 minutes of downtime.</p>
      </div>
      <div className="pv-panel pv-row h-[26px] px-[10px]"><span className="pv-tag pv-tag--ok"><Check size={9} strokeWidth={2.75} />Approved</span><span className="pv-s pv-trunc">Read-only queries on billing</span></div>
      <div className="pv-panel pv-row h-[26px] px-[10px]"><span className="pv-tag pv-tag--bad"><X size={9} strokeWidth={2.75} />Blocked</span><span className="pv-s pv-trunc">Deleting customer records</span></div>
    </div>
  );
}

function UsageMeter() {
  const Meter = ({ label, value, pct, note }: { label: string; value: string; pct: number; note?: string }) => (
    <div className="flex flex-col gap-[3px]">
      <div className="pv-row justify-between"><span className="pv-s">{label}</span><span className="pv-s pv-strong">{value}</span></div>
      <div className="pv-bar"><i style={{ width: `${pct}%` }} /></div>
      {note && <span className="text-[8.5px] leading-[11px] pv-faint">{note}</span>}
    </div>
  );
  return (
    <div className="relative w-[262px] h-[154px]">
      <div className="pv-panel absolute right-0 top-0 w-[196px] p-[10px] flex flex-col gap-[7px]">
        <Meter label="Context window" value="568k of 1M" pct={57} />
        <Meter label="5-hour limit" value="26%" pct={26} note="Resets in 4h 25m" />
        <div className="pv-rule" />
        <div className="pv-row justify-between"><span className="pv-s">Credits used</span><span className="pv-b pv-strong">$12.40</span></div>
      </div>
      <div className="pv-panel absolute left-0 right-0 bottom-0 h-[32px] pl-[10px] pr-[5px] pv-row">
        <span className="pv-s flex-1">Ask anything</span>
        <svg width="18" height="18" viewBox="0 0 18 18" className="-rotate-90">
          <circle cx="9" cy="9" r="7" stroke="var(--stroke-default)" strokeWidth="2.5" fill="none" />
          <circle cx="9" cy="9" r="7" stroke="var(--pv-blue)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray={`${0.57 * 43.98} 43.98`} />
        </svg>
        <Send />
      </div>
    </div>
  );
}

/* ── Notifiers ─────────────────────────────────────────────── */

function AILabel() {
  return (
    <div className="pv-panel w-[256px] p-[11px] flex flex-col gap-[7px]">
      <div className="pv-row justify-between"><span className="pv-t">Reply to Northwind</span><span className="pv-ailabel"><Sparkle size={9} strokeWidth={2.25} />AI generated</span></div>
      <p className="pv-b">Thanks for the quick turnaround. We can confirm the renewal at $48,000 a year, starting March 1.</p>
      <p className="pv-s pv-row !gap-[4px] pt-[6px] border-t border-[color:var(--pv-edge)]"><Info size={10} strokeWidth={2} />AI can make mistakes. Check it before sending.</p>
      <div className="pv-row justify-end gap-[5px]"><span className="pv-btn">Edit</span><span className="pv-btn pv-btn--main">Send</span></div>
    </div>
  );
}

function AgentAvatar() {
  const a: [LucideIcon, string, string, "work" | "wait" | "idle"][] = [
    [Search, "Research agent", "Reading 12 files", "work"], [Receipt, "Billing agent", "Waiting for your approval", "wait"], [Headset, "Support agent", "Idle since 9:20", "idle"],
  ];
  return (
    <div className="pv-panel w-[244px] p-[10px] flex flex-col gap-[9px]">
      {a.map(([I, n, s, k]) => (
        <div key={n} className="pv-row !gap-[9px]">
          <Ag icon={I} lg live={k === "work"} dot={k === "work" ? undefined : k === "wait" ? "pv-warn-b" : ""} />
          <div className="flex flex-col flex-1 min-w-0"><span className="pv-t">{n}</span><span className={`pv-s ${k === "wait" ? "pv-warn" : ""}`}>{s}</span></div>
          {k === "wait" && <span className="pv-btn pv-btn--sm">Review</span>}
        </div>
      ))}
    </div>
  );
}

function ProactiveSuggestion() {
  const inv = [["INV-2041", "Acme", "34 days late"], ["INV-2038", "Globex", "41 days late"], ["INV-2032", "Initech", "52 days late"], ["INV-2050", "Umbrella", "Paid"]];
  return (
    <div className="relative w-[268px] h-[160px]">
      <div className="pv-panel absolute left-0 top-0 w-[232px] p-[9px] flex flex-col">
        <span className="pv-xs pb-[5px]">Invoices</span>
        {inv.map(([id, c, s]) => (
          <div key={id} className="pv-row h-[21px] border-t border-[color:var(--pv-edge)] text-[9px]"><span className="pv-mono pv-faint w-[54px]">{id}</span><span className="flex-1">{c}</span><span className={s === "Paid" ? "pv-faint" : "pv-bad"}>{s}</span></div>
        ))}
      </div>
      <div className="pv-panel pv-toast absolute right-0 bottom-0 w-[200px] p-[10px] flex flex-col gap-[7px]">
        <AskOne title="3 invoices are 30+ days late" sub="Want me to draft polite reminders?" />
        <div className="pv-row justify-end !gap-[4px]"><span className="pv-btn pv-btn--quiet">Not now</span><span className="pv-btn pv-btn--main">Draft reminders</span></div>
      </div>
    </div>
  );
}

function UpdateNotice() {
  return (
    <div className="pv-panel w-[256px] p-[11px] flex flex-col gap-[8px]">
      <div className="pv-row !items-start !gap-[8px]">
        <span className="pv-appic !size-[24px] !rounded-[8px]"><BellRing size={12} strokeWidth={2} className="pv-bluet" /></span>
        <div className="flex flex-col flex-1"><span className="pv-t">Your agent was updated</span><span className="pv-s">Version 2.4 · today</span></div>
        <X size={11} strokeWidth={2} className="pv-faint" />
      </div>
      <Bullets items={["Now reads the team wiki", "Asks before deleting any file", "Uses the faster model by default"]} />
      <span className="pv-s pv-link">See everything that changed</span>
    </div>
  );
}

function ErrorMessage() {
  return (
    <div className="pv-panel w-[256px] p-[11px] flex flex-col gap-[8px]">
      <div className="pv-row !items-start !gap-[8px]">
        <span className="grid place-items-center size-[24px] rounded-[8px] shrink-0" style={{ background: "var(--pv-bad-bg)", color: "var(--pv-bad)" }}><CircleAlert size={13} strokeWidth={2.25} /></span>
        <div className="flex flex-col"><span className="pv-t">Couldn&apos;t reach the CRM</span><span className="pv-s">The connection expired 2 hours ago.</span></div>
      </div>
      <div className="pv-well pv-row !gap-[5px] px-[8px] h-[24px]"><Check size={10} strokeWidth={2.5} className="pv-ok" /><span className="pv-s">Your request and 3 files are saved</span></div>
      <div className="pv-row justify-end gap-[5px]"><span className="pv-btn">Try again</span><span className="pv-btn pv-btn--main">Reconnect</span></div>
    </div>
  );
}

const PREVIEWS: Record<string, ComponentType> = {
  "prompt-input": PromptInput, "source-picker": SourcePicker, "suggested-prompts": SuggestedPrompts, suggestions: Suggestions,
  "prompt-templates": PromptTemplates, "example-gallery": ExampleGallery,
  streaming: Streaming, summary: Summary, table: Table, chart: Chart, variations: Variations, media: Media,
  transcript: Transcript, canvas: Canvas, "form-fill": FormFill, "refine-menu": RefineMenu,
  "clarifying-question": ClarifyingQuestion, "choice-picker": ChoicePicker, "form-request": FormRequest, feedback: Feedback,
  "stop-and-pause": StopAndPause, capabilities: Capabilities, memory: Memory, checkpoints: Checkpoints,
  "approval-card": ApprovalCard, "permission-request": PermissionRequest, "preview-before-run": PreviewBeforeRun, "diff-view": DiffView,
  plan: Plan, "task-list": TaskList, "hand-off": HandOff, "progress-steps": ProgressSteps, "workflow-canvas": WorkflowCanvas,
  reasoning: Reasoning, sources: Sources, confidence: Confidence, "activity-log": ActivityLog, "tool-call": ToolCall,
  rationale: Rationale, "usage-meter": UsageMeter,
  "ai-label": AILabel, "agent-avatar": AgentAvatar, "proactive-suggestion": ProactiveSuggestion, "update-notice": UpdateNotice,
  "error-message": ErrorMessage,
};

// flush: the preview is the top of a card (Home), so it drops its own corners and frame
export function Preview({ id, flush }: { id: string; flush?: boolean }) {
  if (KIT[id]) return <KitCard id={id} flush={flush} />;
  const P = PREVIEWS[id];
  return <div aria-hidden="true" className={`pv ${flush ? "pv--flush" : ""}`}>{P && <P />}</div>;
}

// The same picture at twice the size, for the component page.
export function PreviewLarge({ id }: { id: string }) {
  if (KIT[id]) return <KitPlayground id={id} />;
  return <div className="pv-zoom"><div><Preview id={id} /></div></div>;
}
