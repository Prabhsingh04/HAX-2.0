import type { ReactNode } from "react";
import { ArrowRight, Bot, Calendar, Check, ChevronDown, GripVertical, X, Hand, Mail, Pencil, Play, Plus, Sparkle, Ticket, Zap } from "./icons";
import { Ag, Chk, Me, Spin, sel, st, tog, type Entry, type Props } from "./ui";
import { Btn, IconBtn, Tag, TextLink } from "./parts";

/* Plan — Claude Code / Codex plan mode, Cursor plan, Manus todo, Copilot Workspace
   spec: editable numbered steps, approved before work starts. */
function Plan({ o }: { o: Props }) {
  const steps = ["Read the churn report and Q2 baseline", "Split churn by region and plan size", "Draft three next steps with owners", "Write the one-page summary"];
  const wait = o.state === "Waiting on you";
  const run = o.state === "Running" || wait;
  return (
    <div className="hk-panel w-[500px] p-[16px] hk-col gap-[12px]">
      <div className="hk-row justify-between"><span className="hk-h">Plan · 4 steps</span><span className="hk-s">{wait ? "Step 2 of 4 · waiting on you" : run ? "Step 2 of 4" : "About 6 min"}</span></div>
      <div className="hk-col gap-[2px]">
        {steps.map((s, i) => (
          <div key={s} className={`hk-mi !px-[6px] ${!run && i === 2 && o.editable ? "hk-mi--on" : ""}`}>
            {o.editable && !run && <GripVertical size={14} className="hk-faint" />}
            <span className={`hk-step ${run && i === 0 ? "hk-step--done" : run && i === 1 ? "hk-step--now" : "hk-step--num"}`}>{run && i === 0 ? <Check size={12} strokeWidth={3} /> : run && i === 1 ? "" : i + 1}</span>
            <span className={`hk-grow ${run && i === 0 ? "hk-mute line-through" : ""}`}>{s}</span>
            {run && i === 1 && (wait ? <Btn size="sm" kind="main">Approve</Btn> : <Spin s={14} />)}
            {o.editable && !run && i === 2 && <IconBtn size="xs" label="Edit step" icon={<Pencil size={14} />} />}
          </div>
        ))}
      </div>
      {!run && <div className="hk-row justify-between"><TextLink className="hk-s hk-row gap-[4px]"><Plus size={14} />Add a step</TextLink><span className="hk-row gap-[8px]"><Btn kind="ghost">Keep planning</Btn><Btn kind="main" icon={<Play size={12} fill="currentColor" strokeWidth={0} />}>Start</Btn></span></div>}
    </div>
  );
}

/* Task list — Copilot in Teams / Loop tasks, Notion AI action items, Linear Asks,
   Granola action items with "Send to …". */
function TaskList({ o }: { o: Props }) {
  const all = o.state === "Done";
  const sent = o.state === "Sent";
  const t: [string, string, string, boolean, string][] = [["Send the revised quote", "MR", "Fri", all, "LIN-212"], ["Fix the billing retry", "JK", "Mon", all, "LIN-213"], ["Book customer interviews", "AL", "Next week", true, "LIN-214"]];
  return (
    <div className="hk-panel w-[520px] p-[16px] hk-col gap-[8px]">
      <div className="hk-row justify-between pb-[4px]"><span className="hk-h">3 tasks from the pricing sync</span>{o.ai && <span className="hk-ai"><Sparkle size={12} className="hk-blue" />Found by Atlas</span>}</div>
      {t.map(([n, who, due, done, tid]) => (
        <div key={n} className="hk-row gap-[10px] py-[8px] border-t border-[var(--k-edge)]">
          <Chk on={done} label={n} />
          <span className={`hk-b hk-grow ${done ? "hk-mute line-through" : ""}`}>{n}</span>
          {o.owners && <Me i={who} />}
          <span className="hk-s hk-row gap-[4px] w-[86px]"><Calendar size={13} />{due}</span>{sent && <Tag tone="blue">{tid}</Tag>}
        </div>
      ))}
      {!sent && !all && <div className="hk-row justify-end gap-[8px] pt-[4px]"><Btn kind="ghost">Edit</Btn><Btn kind="main" icon={<Ticket size={13} />}>Send to Linear</Btn></div>}
    </div>
  );
}

/* Hand-off — Intercom Fin to human, Salesforce Agentforce escalation, multi-agent
   (Copilot Studio, CrewAI): who has it now, with context passed along. */
function HandOff({ o }: { o: Props }) {
  const toAgent = o.to === "Another agent";
  const back = o.state === "Back with you";
  const working = o.state === "Working";
  return (
    <div className="hk-panel w-[520px] p-[16px] hk-col gap-[14px]">
      <div className="hk-row gap-[12px]">
        <span className="hk-col items-center gap-[4px]"><Ag size="lg" /><span className="hk-s">Atlas</span></span>
        <span className="hk-grow hk-col items-center gap-[4px]"><span className="hk-s">{o.state === "Waiting" ? "Waiting to be picked up" : working ? "Working on it · 2 min" : back ? "Sent back 1 min ago" : "Picked up 2 min ago"}</span><span className="h-[2px] w-full rounded-full" style={o.state === "Waiting" ? { background: "repeating-linear-gradient(90deg, var(--k-edge-2) 0 6px, transparent 6px 11px)" } : toAgent ? { background: "var(--k-agent)" } : { background: "var(--gradient-hax)", transform: "scaleX(-1)" }} /><ArrowRight size={14} className={`hk-faint -mt-[9px] ${back ? "self-start rotate-180" : "self-end"}`} /></span>
        <span className="hk-col items-center gap-[4px]">{toAgent ? <Ag size="lg" icon={Bot} /> : <span className="hk-me !size-[40px] !text-[13px]">SR</span>}<span className="hk-s">{toAgent ? "Billing agent" : "Sam · Support"}</span></span>
      </div>
      {o.context && <div className="hk-well p-[12px] hk-col gap-[4px]"><span className="hk-xs">Passed along</span><span className="text-[13px] leading-[19px]">Customer was double-charged on 1 Nov. Refund of $480 needs approval. Order #44120.</span></div>}
      <div className="hk-row justify-between"><span className="hk-s">{back ? "Sam needs your approval for the refund." : "You'll get a reply here when it's done."}</span><Btn size="sm" kind={back ? "main" : "outline"}>{o.state === "Waiting" ? "Cancel hand-off" : back ? "Review refund" : "Open ticket"}</Btn></div>
    </div>
  );
}

/* Progress steps — ChatGPT agent / Deep Research activity, Perplexity steps, Claude
   "Searching… Reading…", Gemini Deep Research plan progress. */
function ProgressSteps({ o }: { o: Props }) {
  const s: [string, string, "done" | "now" | "todo"][] = [["Searched the web", "12 results", "done"], ["Read 5 pricing pages", "Northwind, Contoso, Fabrikam +2", "done"], ["Comparing plans", "", "now"], ["Writing the summary", "", "todo"]];
  const collapsed = o.view === "Collapsed";
  const done = o.state === "Done";
  const failed = o.state === "Failed";
  const steps = s.map(([t, d, k], i): [string, string, "done" | "now" | "todo" | "fail"] => done ? [t, d, "done"] : failed && i === 2 ? ["Comparing plans", "Couldn't open contoso.com", "fail"] : [t, d, k]);
  return (
    <div className="w-[500px] hk-col gap-[10px]">
      <div className="hk-row gap-[8px]">{done ? <Check size={16} strokeWidth={2.5} className="hk-okc" /> : failed ? <X size={16} strokeWidth={2.5} className="hk-badc" /> : <Spin />}<span className={`hk-t ${done || failed ? "" : "hk-shimmer"}`}>{done ? "Done" : failed ? "Stopped at comparing plans" : "Comparing plans"}</span><span className="hk-s">· {done ? "2 min 5 s" : "1 min 12 s"}</span><ChevronDown size={15} className={`hk-faint ${collapsed ? "" : "rotate-180"}`} /></div>
      {!collapsed && (
        <div className="hk-col gap-[2px] pl-[8px] border-l-2 border-[var(--k-edge)] ml-[7px]">
          {steps.map(([t, d, st]) => (
            <div key={t} className="hk-row !items-start gap-[10px] py-[5px] pl-[10px]">
              {st === "done" ? <Check size={15} strokeWidth={2.5} className="hk-okc mt-[3px]" /> : st === "fail" ? <X size={15} strokeWidth={2.5} className="hk-badc mt-[3px]" /> : st === "now" ? <span className="mt-[3px]"><Spin s={15} /></span> : <span className="mt-[6px] size-[9px] rounded-full border-[1.5px] border-[var(--k-edge-2)] mx-[3px]" />}
              <span className="hk-col"><span className={`text-[14px] ${st === "todo" ? "hk-faint" : "font-medium"}`}>{t}</span>{d && (o.details || st === "fail") && <span className="hk-s">{d}</span>}{st === "fail" && <span className="pt-[6px]"><Btn size="sm">Retry this step</Btn></span>}</span>
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
  const running = o.state === "Running" || o.state === "Waiting on a person";
  const human = o.state !== "Running";
  const waiting = o.state === "Waiting on a person";
  const Node = ({ x, y, ic, k, t, on, human }: { x: number; y: number; ic: ReactNode; k: string; t: string; on?: boolean; human?: boolean }) => (
    <div className="absolute hk-panel !rounded-[var(--hk-r-lg)] hk-row gap-[10px] w-[156px] h-[56px] px-[10px]" style={{ left: x, top: y, ...(on ? { borderColor: "var(--k-blue)", boxShadow: "0 0 0 3px var(--focus-ring), var(--k-shadow)" } : {}), ...(human ? { borderStyle: "dashed", borderColor: "var(--k-warn)" } : {}) }}>
      <span className="hk-app !size-[30px]">{ic}</span><span className="hk-col min-w-0"><span className="hk-xs">{k}</span><span className="hk-t !text-[13px] hk-trunc">{t}</span></span>
    </div>
  );
  const edge = { fill: "none", stroke: "var(--k-edge-2)", strokeWidth: 2, markerEnd: "url(#hk-wf-arrow)" };
  return (
    <div className="w-[540px] hk-col gap-[12px]">
      {running && <span className="hk-s hk-row gap-[6px]"><Spin s={13} />{waiting ? "Paused on 3 emails · Sam needs to review" : "Running on 3 emails · step 2 of 3"}</span>}
      <div className="relative w-[540px] h-[236px]">
        <svg className="absolute inset-0" width="540" height="236" aria-hidden="true">
          <defs><marker id="hk-wf-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 L8 4 L0 8 z" style={{ fill: "var(--k-edge-2)" }} /></marker></defs>
          <path d="M156 28 H 190" {...edge} />
          <path d="M348 28 H 382" {...edge} />
          <path d="M270 56 V 178" {...edge} />
          <path d="M348 208 H 462 V 58" {...edge} />
        </svg>
        <Node x={0} y={0} ic={<Mail size={15} />} k="Trigger" t="Support email" />
        <Node x={192} y={0} ic={<Zap size={15} className="hk-agentc" />} k="Agent" t="Draft a reply" on={running && !waiting} />
        <Node x={384} y={0} ic={<Check size={15} />} k="Action" t="Send the reply" />
        <Node x={192} y={180} ic={<Hand size={15} className="hk-warnc" />} k="Person" t="Review draft" human={human} on={waiting} />
        <span className="absolute left-[353px] top-[6px] hk-s">Sure</span>
        <span className="absolute left-[472px] top-[122px] hk-s">Approved</span>
        {human ? <Tag tone="warn" className="absolute left-[282px] top-[104px]">Below 80% sure</Tag> : <span className="absolute left-[282px] top-[106px] hk-s">Not sure</span>}
      </div>
    </div>
  );
}

/* Shared status — one live view of the goal, what is known, what is still open and who is on
   it, for the people and the agents working the same problem (incident.io and PagerDuty
   incident pages, Linear project updates, Slack canvases). */
function SharedStatus({ o }: { o: Props }) {
  const resolved = o.state === "Resolved";
  const quiet = o.state === "Quiet";
  const known: [ReactNode, string][] = [
    [<Ag key="a" size="sm" icon={Bot} />, "Errors began at 09:12, seven minutes after the deploy"],
    [<Me key="m" i="JK" />, "Rolling back fixed checkout on staging"],
  ];
  const open: [string, string][] = [["Do we refund the failed orders?", "Billing agent"], ["What do we tell customers?", "Sam"]];
  return (
    <div className="hk-panel w-[520px] p-[16px] hk-col gap-[12px]">
      <div className="hk-row justify-between !items-start">
        <span className="hk-col gap-[2px]"><span className="hk-xs">Goal · checkout outage</span><span className="hk-h">{resolved ? "Checkout working again at 13:41" : "Checkout working again before 14:00"}</span></span>
        <Tag tone={resolved ? "ok" : quiet ? "neutral" : "bad"}>{resolved ? "Resolved" : quiet ? "Quiet · last change 3 h ago" : <><i className="size-[6px] rounded-full bg-current" />Live</>}</Tag>
      </div>
      <div className="hk-col gap-[6px]">
        <span className="hk-xs">What we know</span>
        {known.map(([who, t]) => <span key={t} className="hk-row gap-[10px] text-[13.5px] leading-[19px]"><span className="grid place-items-center size-[28px] shrink-0">{who}</span>{t}</span>)}
      </div>
      {o.open && !resolved && (
        <div className="hk-col gap-[6px]">
          <span className="hk-xs">Still open</span>
          {open.map(([q, who]) => <span key={q} className="hk-row justify-between gap-[10px] text-[13.5px] leading-[19px]"><span>{q}</span><span className="hk-s whitespace-nowrap">{who}</span></span>)}
        </div>
      )}
      {o.who && (
        <div className="hk-row gap-[10px] pt-[10px] border-t border-[var(--k-edge)]">
          <span className="hk-row !gap-[4px]"><Ag size="sm" icon={Bot} /><Ag size="sm" icon={Bot} /><Me i="JK" /><Me i="SR" /></span>
          <span className="hk-s hk-grow">{resolved ? "Closed by Sam at 13:41" : "2 agents and 2 people on it"}</span>
          <TextLink className="hk-s">Open the incident</TextLink>
        </div>
      )}
    </div>
  );
}

export const WORKFLOWS: Record<string, Entry> = {
  plan: { C: Plan, opts: [sel("state", "State", ["Review", "Running", "Waiting on you"]), tog("editable", "Editable")], refs: ["Claude Code plan mode", "Codex", "Cursor plan", "Manus", "Copilot Workspace"], states: [st("Draft", { state: "Review" }), st("Running", { state: "Running" }), st("Waiting on you", { state: "Waiting on you" })] },
  "task-list": { C: TaskList, opts: [tog("owners", "Owners"), tog("ai", "AI label"), sel("state", "State", ["Suggested", "Sent", "Done"])], refs: ["Copilot in Teams", "Notion AI", "Granola", "Linear"], states: ["Suggested", "Sent", "Done"].map((n) => st(n, { state: n })) },
  "hand-off": { C: HandOff, opts: [sel("to", "Hand to", ["A person", "Another agent"]), sel("state", "State", ["Picked up", "Waiting", "Working", "Back with you"]), tog("context", "Context passed")], refs: ["Intercom Fin", "Salesforce Agentforce", "Copilot Studio"], states: [st("Passed", { state: "Picked up" }), st("Working", { state: "Working" }), st("Back with you", { state: "Back with you" })] },
  "progress-steps": { C: ProgressSteps, opts: [sel("view", "View", ["Expanded", "Collapsed"]), tog("details", "Step details"), sel("state", "State", ["Working", "Done", "Failed"])], refs: ["ChatGPT agent", "Perplexity", "Claude research", "Gemini Deep Research"], states: ["Working", "Done", "Failed"].map((n) => st(n, { state: n })) },
  "shared-status": { C: SharedStatus, opts: [tog("open", "Open questions"), tog("who", "Who is on it"), sel("state", "State", ["Live", "Resolved", "Quiet"])], refs: ["incident.io", "PagerDuty", "Linear project updates", "Slack canvas"], states: ["Live", "Resolved", "Quiet"].map((n) => st(n, { state: n })) },
  "workflow-canvas": { C: WorkflowCanvas, opts: [sel("state", "State", ["Editing", "Running", "Waiting on a person"])], refs: ["n8n", "Zapier", "Make", "OpenAI Agent Builder", "Copilot Studio"], states: ["Editing", "Running", "Waiting on a person"].map((n) => st(n, { state: n })) },
};
