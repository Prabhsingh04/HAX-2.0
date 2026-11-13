import type { ReactNode } from "react";
import { ArrowRight, Bot, Calendar, Check, ChevronDown, GripVertical, Hand, Mail, Pencil, Play, Plus, Sparkle, Ticket, Zap } from "./icons";
import { Ag, Me, Spin, sel, tog, type Entry, type Props } from "./ui";

/* Plan — Claude Code / Codex plan mode, Cursor plan, Manus todo, Copilot Workspace
   spec: editable numbered steps, approved before work starts. */
function Plan({ o }: { o: Props }) {
  const steps = ["Read the churn report and Q2 baseline", "Split churn by region and plan size", "Draft three next steps with owners", "Write the one-page summary"];
  const run = o.state === "Running";
  return (
    <div className="hk-panel w-[500px] p-[16px] hk-col gap-[12px]">
      <div className="hk-row justify-between"><span className="hk-h">Plan · 4 steps</span><span className="hk-s">{run ? "Step 2 of 4" : "About 6 min"}</span></div>
      <div className="hk-col gap-[2px]">
        {steps.map((s, i) => (
          <div key={s} className={`hk-mi !px-[6px] ${!run && i === 2 && o.editable ? "hk-mi--on" : ""}`}>
            {o.editable && !run && <GripVertical size={14} className="hk-faint" />}
            <span className={`hk-step ${run && i === 0 ? "hk-step--done" : run && i === 1 ? "hk-step--now" : "hk-step--num"}`}>{run && i === 0 ? <Check size={12} strokeWidth={3} /> : run && i === 1 ? "" : i + 1}</span>
            <span className={`hk-grow ${run && i === 0 ? "hk-mute line-through" : ""}`}>{s}</span>
            {run && i === 1 && <Spin s={14} />}
            {o.editable && !run && i === 2 && <span className="hk-ib hk-ib--bare"><Pencil size={14} /></span>}
          </div>
        ))}
      </div>
      {!run && <div className="hk-row justify-between"><span className="hk-s hk-link hk-row gap-[4px]"><Plus size={14} />Add a step</span><span className="hk-row gap-[8px]"><span className="hk-btn hk-btn--ghost">Keep planning</span><span className="hk-btn hk-btn--main"><Play size={12} fill="currentColor" strokeWidth={0} />Start</span></span></div>}
    </div>
  );
}

/* Task list — Copilot in Teams / Loop tasks, Notion AI action items, Linear Asks,
   Granola action items with "Send to …". */
function TaskList({ o }: { o: Props }) {
  const t: [string, string, string, boolean][] = [["Send the revised quote", "MR", "Fri", false], ["Fix the billing retry", "JK", "Mon", false], ["Book customer interviews", "AL", "Next week", true]];
  return (
    <div className="hk-panel w-[520px] p-[16px] hk-col gap-[8px]">
      <div className="hk-row justify-between pb-[4px]"><span className="hk-h">3 tasks from the pricing sync</span>{o.ai && <span className="hk-ai"><Sparkle size={12} className="hk-blue" />Found by Atlas</span>}</div>
      {t.map(([n, who, due, done]) => (
        <div key={n} className="hk-row gap-[10px] py-[8px] border-t border-[var(--k-edge)]">
          <span className={`hk-check ${done ? "hk-check--on" : ""}`}>{done && <Check size={12} strokeWidth={3} />}</span>
          <span className={`hk-b hk-grow ${done ? "hk-mute line-through" : ""}`}>{n}</span>
          {o.owners && <Me i={who} />}
          <span className="hk-s hk-row gap-[4px] w-[86px]"><Calendar size={13} />{due}</span>
        </div>
      ))}
      {o.send && <div className="hk-row justify-end gap-[8px] pt-[4px]"><span className="hk-btn hk-btn--ghost">Edit</span><span className="hk-btn hk-btn--main"><Ticket size={13} />Send to Linear</span></div>}
    </div>
  );
}

/* Hand-off — Intercom Fin to human, Salesforce Agentforce escalation, multi-agent
   (Copilot Studio, CrewAI): who has it now, with context passed along. */
function HandOff({ o }: { o: Props }) {
  const toAgent = o.to === "Another agent";
  return (
    <div className="hk-panel w-[520px] p-[16px] hk-col gap-[14px]">
      <div className="hk-row gap-[12px]">
        <span className="hk-col items-center gap-[4px]"><Ag size="lg" /><span className="hk-s">Atlas</span></span>
        <span className="hk-grow hk-col items-center gap-[4px]"><span className="hk-s">{o.state === "Waiting" ? "Waiting to be picked up" : "Picked up 2 min ago"}</span><span className="h-[2px] w-full rounded-full" style={o.state === "Waiting" ? { background: "repeating-linear-gradient(90deg, var(--k-edge-2) 0 6px, transparent 6px 11px)" } : toAgent ? { background: "var(--k-agent)" } : { background: "var(--gradient-hax)", transform: "scaleX(-1)" }} /><ArrowRight size={14} className="hk-faint -mt-[9px] self-end" /></span>
        <span className="hk-col items-center gap-[4px]">{toAgent ? <Ag size="lg" icon={Bot} /> : <span className="hk-me !size-[40px] !text-[13px]">SR</span>}<span className="hk-s">{toAgent ? "Billing agent" : "Sam · Support"}</span></span>
      </div>
      {o.context && <div className="hk-well p-[12px] hk-col gap-[4px]"><span className="hk-xs">Passed along</span><span className="text-[13px] leading-[19px]">Customer was double-charged on 1 Nov. Refund of $480 needs approval. Order #44120.</span></div>}
      <div className="hk-row justify-between"><span className="hk-s">You&apos;ll get a reply here when it&apos;s done.</span><span className="hk-btn hk-btn--sm">{o.state === "Waiting" ? "Cancel hand-off" : "Open ticket"}</span></div>
    </div>
  );
}

/* Progress steps — ChatGPT agent / Deep Research activity, Perplexity steps, Claude
   "Searching… Reading…", Gemini Deep Research plan progress. */
function ProgressSteps({ o }: { o: Props }) {
  const s: [string, string, "done" | "now" | "todo"][] = [["Searched the web", "12 results", "done"], ["Read 5 pricing pages", "Northwind, Contoso, Fabrikam +2", "done"], ["Comparing plans", "", "now"], ["Writing the summary", "", "todo"]];
  const collapsed = o.view === "Collapsed";
  return (
    <div className="w-[500px] hk-col gap-[10px]">
      <div className="hk-row gap-[8px]"><Spin /><span className="hk-shimmer hk-t">Comparing plans</span><span className="hk-s">· 1 min 12 s</span><ChevronDown size={15} className={`hk-faint ${collapsed ? "" : "rotate-180"}`} /></div>
      {!collapsed && (
        <div className="hk-col gap-[2px] pl-[8px] border-l-2 border-[var(--k-edge)] ml-[7px]">
          {s.map(([t, d, st]) => (
            <div key={t} className="hk-row !items-start gap-[10px] py-[5px] pl-[10px]">
              {st === "done" ? <Check size={15} strokeWidth={2.5} className="hk-okc mt-[3px]" /> : st === "now" ? <span className="mt-[3px]"><Spin s={15} /></span> : <span className="mt-[6px] size-[9px] rounded-full border-[1.5px] border-[var(--k-edge-2)] mx-[3px]" />}
              <span className="hk-col"><span className={`text-[14px] ${st === "todo" ? "hk-faint" : "font-medium"}`}>{t}</span>{d && o.details && <span className="hk-s">{d}</span>}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* Workflow canvas — n8n, Zapier canvas, Make, Copilot Studio, OpenAI Agent Builder:
   steps read left to right with arrows; the human check branches off the agent and
   rejoins before the action, so it is clear where a person steps in. */
function WorkflowCanvas({ o }: { o: Props }) {
  const Node = ({ x, y, ic, k, t, on, human }: { x: number; y: number; ic: ReactNode; k: string; t: string; on?: boolean; human?: boolean }) => (
    <div className="absolute hk-panel !rounded-[var(--hk-r-lg)] hk-row gap-[10px] w-[156px] h-[56px] px-[10px]" style={{ left: x, top: y, ...(on ? { borderColor: "var(--k-blue)", boxShadow: "0 0 0 3px var(--focus-ring), var(--k-shadow)" } : {}), ...(human ? { borderStyle: "dashed", borderColor: "var(--k-warn)" } : {}) }}>
      <span className="hk-app !size-[30px]">{ic}</span><span className="hk-col min-w-0"><span className="hk-xs">{k}</span><span className="hk-t !text-[13px] hk-trunc">{t}</span></span>
    </div>
  );
  const edge = { fill: "none", stroke: "var(--k-edge-2)", strokeWidth: 2, markerEnd: "url(#hk-wf-arrow)" };
  return (
    <div className="w-[540px] hk-col gap-[12px]">
      {o.running && <span className="hk-s hk-row gap-[6px]"><Spin s={13} />Running on 3 emails · step 2 of 3</span>}
      <div className="relative w-[540px] h-[236px]">
        <svg className="absolute inset-0" width="540" height="236" aria-hidden="true">
          <defs><marker id="hk-wf-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 L8 4 L0 8 z" style={{ fill: "var(--k-edge-2)" }} /></marker></defs>
          <path d="M156 28 H 190" {...edge} />
          <path d="M348 28 H 382" {...edge} />
          <path d="M270 56 V 178" {...edge} />
          <path d="M348 208 H 462 V 58" {...edge} />
        </svg>
        <Node x={0} y={0} ic={<Mail size={15} />} k="Trigger" t="Support email" />
        <Node x={192} y={0} ic={<Zap size={15} className="hk-agentc" />} k="Agent" t="Draft a reply" on={o.running as boolean} />
        <Node x={384} y={0} ic={<Check size={15} />} k="Action" t="Send the reply" />
        <Node x={192} y={180} ic={<Hand size={15} className="hk-warnc" />} k="Person" t="Review draft" human={o.human as boolean} />
        <span className="absolute left-[353px] top-[6px] hk-s">Sure</span>
        <span className="absolute left-[472px] top-[122px] hk-s">Approved</span>
        {o.human ? <span className="absolute left-[282px] top-[104px] hk-tag hk-tag--warn">Below 80% sure</span> : <span className="absolute left-[282px] top-[106px] hk-s">Not sure</span>}
      </div>
    </div>
  );
}

/* Shared status — one live view of the goal, what is known, what is still open and who is on
   it, for the people and the agents working the same problem (incident.io and PagerDuty
   incident pages, Linear project updates, Slack canvases). */
function SharedStatus({ o }: { o: Props }) {
  const known: [ReactNode, string][] = [
    [<Ag key="a" size="sm" icon={Bot} />, "Errors began at 09:12, seven minutes after the deploy"],
    [<Me key="m" i="JK" />, "Rolling back fixed checkout on staging"],
  ];
  const open: [string, string][] = [["Do we refund the failed orders?", "Billing agent"], ["What do we tell customers?", "Sam"]];
  return (
    <div className="hk-panel w-[520px] p-[16px] hk-col gap-[12px]">
      <div className="hk-row justify-between !items-start">
        <span className="hk-col gap-[2px]"><span className="hk-xs">Goal · checkout outage</span><span className="hk-h">Checkout working again before 14:00</span></span>
        <span className="hk-tag hk-tag--bad"><i className="size-[6px] rounded-full bg-current" />Live</span>
      </div>
      <div className="hk-col gap-[6px]">
        <span className="hk-xs">What we know</span>
        {known.map(([who, t]) => <span key={t} className="hk-row gap-[10px] text-[13.5px] leading-[19px]"><span className="grid place-items-center size-[28px] shrink-0">{who}</span>{t}</span>)}
      </div>
      {o.open && (
        <div className="hk-col gap-[6px]">
          <span className="hk-xs">Still open</span>
          {open.map(([q, who]) => <span key={q} className="hk-row justify-between gap-[10px] text-[13.5px] leading-[19px]"><span>{q}</span><span className="hk-s whitespace-nowrap">{who}</span></span>)}
        </div>
      )}
      {o.who && (
        <div className="hk-row gap-[10px] pt-[10px] border-t border-[var(--k-edge)]">
          <span className="hk-row !gap-[4px]"><Ag size="sm" icon={Bot} /><Ag size="sm" icon={Bot} /><Me i="JK" /><Me i="SR" /></span>
          <span className="hk-s hk-grow">2 agents and 2 people on it</span>
          <span className="hk-s hk-link">Open the incident</span>
        </div>
      )}
    </div>
  );
}

export const WORKFLOWS: Record<string, Entry> = {
  plan: { C: Plan, opts: [sel("state", "State", ["Review", "Running"]), tog("editable", "Editable")], refs: ["Claude Code plan mode", "Codex", "Cursor plan", "Manus", "Copilot Workspace"] },
  "task-list": { C: TaskList, opts: [tog("owners", "Owners"), tog("send", "Send to tracker"), tog("ai", "AI label")], refs: ["Copilot in Teams", "Notion AI", "Granola", "Linear"] },
  "hand-off": { C: HandOff, opts: [sel("to", "Hand to", ["A person", "Another agent"]), sel("state", "State", ["Picked up", "Waiting"]), tog("context", "Context passed")], refs: ["Intercom Fin", "Salesforce Agentforce", "Copilot Studio"] },
  "progress-steps": { C: ProgressSteps, opts: [sel("view", "View", ["Expanded", "Collapsed"]), tog("details", "Step details")], refs: ["ChatGPT agent", "Perplexity", "Claude research", "Gemini Deep Research"] },
  "shared-status": { C: SharedStatus, opts: [tog("open", "Open questions"), tog("who", "Who is on it")], refs: ["incident.io", "PagerDuty", "Linear project updates", "Slack canvas"] },
  "workflow-canvas": { C: WorkflowCanvas, opts: [tog("human", "Human check"), tog("running", "Running", false)], refs: ["n8n", "Zapier", "Make", "OpenAI Agent Builder", "Copilot Studio"] },
};
